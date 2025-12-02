import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service';
import axios from 'axios';

@Injectable()
export class WeatherService {
    private readonly logger = new Logger(WeatherService.name);
    private readonly API_KEY = '3113a838a2963401d60dc76e4ed2834a'; // In a real app, use ConfigService
    private readonly CITY = 'London'; // Default location, could be configurable

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        this.logger.debug('Fetching weather data...');
        await this.fetchAndSaveWeather();
    }

    async fetchAndSaveWeather() {
        try {
            const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${this.CITY}&appid=${this.API_KEY}&units=metric`
            );

            const data = response.data;

            // Save snapshot
            const snapshot = await this.prisma.client.weatherSnapshot.create({
                data: {
                    temperature: data.main.temp,
                    condition: data.weather[0].main,
                    windSpeed: data.wind.speed,
                    windDirection: data.wind.deg,
                    visibility: data.visibility,
                    humidity: data.main.humidity,
                    pressure: data.main.pressure,
                    rawJson: JSON.stringify(data),
                },
            });

            this.logger.log(`Weather snapshot saved: ${snapshot.id}`);

            // Update Runway Status based on rules
            await this.updateRunwayStatus(data);

            return snapshot;
        } catch (error) {
            this.logger.error('Error fetching weather data', error);
            throw error;
        }
    }

    private async updateRunwayStatus(data: any) {
        let status = 'OPEN';

        // Simple rules
        if (data.wind.speed > 15 || data.visibility < 1000 || ['Thunderstorm', 'Snow', 'Tornado'].includes(data.weather[0].main)) {
            status = 'CLOSED';
        } else if (data.wind.speed > 10 || data.visibility < 5000 || ['Rain', 'Drizzle', 'Fog'].includes(data.weather[0].main)) {
            status = 'CAUTION';
        }

        // Update System Settings
        await this.prisma.client.systemSettings.upsert({
            where: { key: 'RUNWAY_STATUS' },
            update: { value: status },
            create: {
                key: 'RUNWAY_STATUS',
                value: status,
                category: 'operational',
            },
        });

        this.logger.log(`Runway status updated to: ${status}`);
    }

    async getLatestSnapshot() {
        return this.prisma.client.weatherSnapshot.findFirst({
            orderBy: { timestamp: 'desc' },
        });
    }
}
