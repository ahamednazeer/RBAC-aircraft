import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import { RunwayStatusService, WeatherData } from './runway-status.service';
import axios from 'axios';

// Retry configuration
const RETRY_CONFIG = {
    initialRetryMs: 60000,     // 1 minute
    maxRetries: 5,
    fallbackRetryMs: 300000,   // 5 minutes after max retries
    staleThresholdMs: 3600000, // 60 minutes = WEATHER_UNAVAILABLE
};

@Injectable()
export class WeatherService {
    private readonly logger = new Logger(WeatherService.name);
    private readonly API_KEY = process.env.OPENWEATHER_API_KEY || 'e0466f929274df3b73427fe06a32eef0';
    private readonly CITY = process.env.WEATHER_LOCATION || 'London';
    private readonly LAT = process.env.WEATHER_LAT;
    private readonly LON = process.env.WEATHER_LON;

    private retryCount = 0;
    private lastStatus: string | null = null;

    constructor(
        private prisma: PrismaService,
        private runwayStatusService: RunwayStatusService,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron() {
        this.logger.debug('Fetching weather data (5-minute poll)...');
        await this.fetchAndSaveWeather();
    }

    async fetchAndSaveWeather(lat?: number, lon?: number) {
        try {
            // Use coordinates if provided, then SystemSettings baseLocation, then env vars, then default
            let url: string;
            if (lat !== undefined && lon !== undefined) {
                url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`;
            } else {
                // Check SystemSettings for base location
                const baseLocationSetting = await this.prisma.client.systemSettings.findUnique({
                    where: { key: 'baseLocation' },
                });
                const location = baseLocationSetting?.value || this.CITY;

                if (this.LAT && this.LON && !baseLocationSetting) {
                    url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.LAT}&lon=${this.LON}&appid=${this.API_KEY}&units=metric`;
                } else {
                    url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.API_KEY}&units=metric`;
                }
            }

            const response = await axios.get(url);
            const data = response.data;

            // Reset retry count on success
            this.retryCount = 0;

            // Extract weather data
            const weatherData = this.extractWeatherData(data);

            // Get runway heading and calculate status
            const runwayHeading = await this.runwayStatusService.getRunwayHeading();
            const statusResult = await this.runwayStatusService.getEffectiveStatus(weatherData, runwayHeading);

            // Save snapshot
            const snapshot = await this.prisma.client.weatherSnapshot.create({
                data: {
                    temperature: data.main.temp,
                    condition: data.weather[0].main,
                    windSpeed: data.wind.speed,
                    windDirection: data.wind.deg || 0,
                    windGust: data.wind.gust || null,
                    visibility: data.visibility,
                    humidity: data.main.humidity,
                    pressure: data.main.pressure,
                    ceiling: this.estimateCeiling(data),
                    precipitation: this.extractPrecipitation(data),
                    precipIntensity: data.rain?.['1h'] || data.snow?.['1h'] || null,
                    severeWeather: this.extractSevereWeather(data),
                    statusReason: statusResult.reason,
                    isStale: false,
                    staleSince: null,
                    rawJson: JSON.stringify(data),
                },
            });

            this.logger.log(`Weather snapshot saved: ${snapshot.id} - Status: ${statusResult.status}`);

            // Update runway status in system settings
            await this.updateRunwayStatus(statusResult.status, statusResult.reason);

            // Check for status transitions and generate alerts
            await this.checkStatusTransition(statusResult.status);

            return snapshot;
        } catch (error) {
            this.logger.error('Error fetching weather data', error);
            await this.handleFetchError();
            throw error;
        }
    }

    /**
     * Extract weather data from API response
     */
    private extractWeatherData(data: any): WeatherData {
        const ceiling = this.estimateCeiling(data);
        return {
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg,
            windGust: data.wind.gust,
            visibility: data.visibility,
            ceiling: ceiling !== null ? ceiling : undefined,
            condition: data.weather[0].main,
            severeWeather: this.extractSevereWeather(data),
        };
    }

    /**
     * Estimate ceiling from cloud data (OpenWeatherMap approximation)
     */
    private estimateCeiling(data: any): number | null {
        // OpenWeatherMap doesn't provide exact ceiling
        // Estimate based on cloud coverage and typical cloud base heights
        const clouds = data.clouds?.all; // 0-100%
        if (clouds === undefined) return null;

        if (clouds === 0) return 10000; // Clear sky = unlimited
        if (clouds < 25) return 5000;   // Few clouds
        if (clouds < 50) return 3000;   // Scattered
        if (clouds < 75) return 2000;   // Broken
        return 1000;                    // Overcast or heavy clouds
    }

    /**
     * Extract precipitation type
     */
    private extractPrecipitation(data: any): string {
        const condition = data.weather[0].main.toLowerCase();
        if (data.rain) {
            const intensity = data.rain['1h'] || 0;
            if (intensity > 7.6) return 'Heavy Rain';
            if (intensity > 2.5) return 'Moderate Rain';
            return 'Light Rain';
        }
        if (data.snow) {
            const intensity = data.snow['1h'] || 0;
            if (intensity > 4) return 'Heavy Snow';
            return 'Light Snow';
        }
        if (condition.includes('drizzle')) return 'Drizzle';
        if (condition.includes('rain')) return 'Rain';
        if (condition.includes('snow')) return 'Snow';
        return 'None';
    }

    /**
     * Extract severe weather flags
     */
    private extractSevereWeather(data: any): string[] {
        const flags: string[] = [];
        const condition = data.weather[0].main.toLowerCase();
        const description = data.weather[0].description?.toLowerCase() || '';

        if (condition.includes('thunderstorm')) flags.push('thunderstorm');
        if (condition.includes('tornado')) flags.push('tornado');
        if (condition.includes('fog') || description.includes('fog')) flags.push('fog');
        if (condition.includes('mist')) flags.push('mist');
        if (condition.includes('smoke')) flags.push('smoke');
        if (condition.includes('haze')) flags.push('haze');

        // Check for extreme conditions
        if (data.main.temp < -20) flags.push('extreme_cold');
        if (data.main.temp > 45) flags.push('extreme_heat');
        if (data.wind.speed > 20) flags.push('high_wind'); // > 40 kt

        return flags;
    }

    /**
     * Handle fetch errors with retry logic
     */
    private async handleFetchError() {
        this.retryCount++;

        // Mark latest snapshot as stale
        const latest = await this.prisma.client.weatherSnapshot.findFirst({
            orderBy: { timestamp: 'desc' },
            where: { isStale: false },
        });

        if (latest) {
            await this.prisma.client.weatherSnapshot.update({
                where: { id: latest.id },
                data: {
                    isStale: true,
                    staleSince: new Date(),
                },
            });
        }

        // Check if stale for too long
        if (latest?.staleSince) {
            const staleMs = Date.now() - latest.staleSince.getTime();
            if (staleMs > RETRY_CONFIG.staleThresholdMs) {
                await this.notifyWeatherUnavailable();
            }
        }

        this.logger.warn(`Weather fetch failed. Retry count: ${this.retryCount}`);
    }

    /**
     * Notify ops when weather becomes unavailable
     */
    private async notifyWeatherUnavailable() {
        // Find ops officers and commanders
        const recipients = await this.prisma.client.user.findMany({
            where: {
                role: { in: ['OPS_OFFICER', 'COMMANDER', 'ADMIN'] },
                isActive: true,
            },
        });

        for (const user of recipients) {
            await this.prisma.client.notification.create({
                data: {
                    userId: user.id,
                    title: '⚠️ Weather Data Unavailable',
                    message: 'Weather API has been unreachable for over 60 minutes. Manual weather verification required.',
                    type: 'WARNING',
                },
            });
        }

        this.logger.error('Weather data unavailable for > 60 minutes. Ops notified.');
    }

    /**
     * Update runway status in system settings
     */
    private async updateRunwayStatus(status: string, reason: string) {
        await this.prisma.client.systemSettings.upsert({
            where: { key: 'RUNWAY_STATUS' },
            update: { value: status },
            create: {
                key: 'RUNWAY_STATUS',
                value: status,
                category: 'operational',
            },
        });

        await this.prisma.client.systemSettings.upsert({
            where: { key: 'RUNWAY_STATUS_REASON' },
            update: { value: reason },
            create: {
                key: 'RUNWAY_STATUS_REASON',
                value: reason,
                category: 'operational',
            },
        });

        this.logger.log(`Runway status updated to: ${status}`);
    }

    /**
     * Check for status transitions and generate alerts
     */
    private async checkStatusTransition(newStatus: string) {
        if (this.lastStatus && this.lastStatus !== newStatus) {
            // Status changed
            const isWorsening =
                (this.lastStatus === 'OPEN' && (newStatus === 'CAUTION' || newStatus === 'CLOSED')) ||
                (this.lastStatus === 'CAUTION' && newStatus === 'CLOSED');

            if (isWorsening) {
                await this.generateWeatherAlert(this.lastStatus, newStatus);
            }

            // Audit log
            await this.prisma.client.auditLog.create({
                data: {
                    userId: 'SYSTEM',
                    action: 'RUNWAY_STATUS_CHANGE',
                    entity: 'RunwayStatus',
                    entityId: 'system',
                    details: JSON.stringify({ from: this.lastStatus, to: newStatus }),
                },
            });
        }

        this.lastStatus = newStatus;
    }

    /**
     * Generate weather alerts for status transitions
     */
    private async generateWeatherAlert(fromStatus: string, toStatus: string) {
        // Get missions departing in next 30 minutes
        const thirtyMinsFromNow = new Date(Date.now() + 30 * 60 * 1000);
        const missions = await this.prisma.client.mission.findMany({
            where: {
                status: { in: ['PLANNED', 'IN_PROGRESS'] },
                startTime: { lte: thirtyMinsFromNow },
            },
            include: { pilot: true },
        });

        // Alert assigned pilots
        const pilotIds = missions.map(m => m.pilotId).filter(Boolean) as string[];
        const uniquePilotIds = [...new Set(pilotIds)];

        // Also alert Ops and Commanders
        const staffUsers = await this.prisma.client.user.findMany({
            where: {
                role: { in: ['OPS_OFFICER', 'COMMANDER'] },
                isActive: true,
            },
        });

        const allRecipientIds = [...uniquePilotIds, ...staffUsers.map(u => u.id)];
        const uniqueRecipients = [...new Set(allRecipientIds)];

        for (const userId of uniqueRecipients) {
            await this.prisma.client.notification.create({
                data: {
                    userId,
                    title: toStatus === 'CLOSED'
                        ? '🚨 Runway Status: CLOSED'
                        : '⚠️ Runway Status: CAUTION',
                    message: `Runway status changed from ${fromStatus} to ${toStatus}. Review weather conditions before flight.`,
                    type: toStatus === 'CLOSED' ? 'EMERGENCY' : 'WARNING',
                },
            });
        }

        this.logger.warn(`Weather alert generated: ${fromStatus} → ${toStatus}. Notified ${uniqueRecipients.length} users.`);
    }

    /**
     * Get latest weather snapshot with calculated status
     */
    async getLatestSnapshot() {
        const snapshot = await this.prisma.client.weatherSnapshot.findFirst({
            orderBy: { timestamp: 'desc' },
        });

        if (!snapshot) return null;

        // Get effective runway status
        const runwayHeading = await this.runwayStatusService.getRunwayHeading();
        const weatherData: WeatherData = {
            windSpeed: snapshot.windSpeed,
            windDirection: snapshot.windDirection || undefined,
            windGust: snapshot.windGust || undefined,
            visibility: snapshot.visibility || undefined,
            ceiling: snapshot.ceiling || undefined,
            condition: snapshot.condition,
            severeWeather: snapshot.severeWeather,
        };

        const statusResult = await this.runwayStatusService.getEffectiveStatus(weatherData, runwayHeading);

        return {
            ...snapshot,
            runwayStatus: statusResult.status,
            runwayStatusReason: statusResult.reason,
            runwayStatusFactors: statusResult.factors,
            isOverride: statusResult.isOverride,
            overrideBy: statusResult.overrideBy,
            overrideExpiry: statusResult.overrideExpiry,
            formattedWeather: this.formatForPilots(snapshot),
        };
    }

    /**
     * Format weather in aviation-friendly style (pseudo-METAR)
     */
    private formatForPilots(snapshot: any): string {
        const windDir = this.degreesToCardinal(snapshot.windDirection);
        const windKts = Math.round(snapshot.windSpeed * 1.944);
        const gustKts = snapshot.windGust ? Math.round(snapshot.windGust * 1.944) : null;
        const visMiles = snapshot.visibility
            ? Math.round(snapshot.visibility / 1609.34 * 10) / 10
            : null;
        const tempC = Math.round(snapshot.temperature);

        let formatted = `WIND ${windDir} ${windKts}`;
        if (gustKts && gustKts > windKts) {
            formatted += `G${gustKts}`;
        }
        formatted += `KT`;

        if (visMiles !== null) {
            formatted += ` | VIS ${visMiles}SM`;
        }

        formatted += ` | ${snapshot.condition.toUpperCase()}`;
        formatted += ` | TEMP ${tempC}°C`;

        if (snapshot.ceiling) {
            formatted += ` | CEIL ${snapshot.ceiling}FT`;
        }

        if (snapshot.severeWeather && snapshot.severeWeather.length > 0) {
            formatted += ` | ⚠️ ${snapshot.severeWeather.join(', ').toUpperCase()}`;
        }

        return formatted;
    }

    private degreesToCardinal(degrees: number | null): string {
        if (degrees === null || degrees === undefined) return 'VRB';
        const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return cardinals[index];
    }

    /**
     * Fetch weather for specific coordinates (for destination weather)
     */
    async getWeatherForLocation(lat: number, lon: number) {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );
            const data = response.data;
            const weatherData = this.extractWeatherData(data);
            const runwayHeading = await this.runwayStatusService.getRunwayHeading();
            const statusResult = this.runwayStatusService.calculateStatus(weatherData, runwayHeading);

            return {
                temperature: data.main.temp,
                condition: data.weather[0].main,
                description: data.weather[0].description,
                windSpeed: data.wind.speed,
                windDirection: data.wind.deg || 0,
                windGust: data.wind.gust || null,
                visibility: data.visibility,
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                ceiling: this.estimateCeiling(data),
                precipitation: this.extractPrecipitation(data),
                severeWeather: this.extractSevereWeather(data),
                cityName: data.name,
                country: data.sys.country,
                runwayStatus: statusResult.status,
                runwayStatusReason: statusResult.reason,
                formattedWeather: `WIND ${this.degreesToCardinal(data.wind.deg)} ${Math.round(data.wind.speed * 1.944)}KT | VIS ${Math.round(data.visibility / 1609.34 * 10) / 10}SM | ${data.weather[0].main.toUpperCase()} | TEMP ${Math.round(data.main.temp)}°C`,
            };
        } catch (error) {
            this.logger.error(`Error fetching weather for ${lat}, ${lon}`, error);
            throw error;
        }
    }
}
