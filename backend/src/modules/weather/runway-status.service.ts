import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

// Aviation thresholds for runway status calculation
const THRESHOLDS = {
    wind: {
        open: 25,      // <= 25 kt = OPEN
        caution: 40,   // 26-40 kt = CAUTION, > 40 kt = CLOSED
    },
    crosswind: {
        open: 15,      // <= 15 kt = OPEN
        caution: 25,   // 16-25 kt = CAUTION, > 25 kt = CLOSED
    },
    visibility: {
        open: 5000,    // >= 5000m = OPEN
        caution: 1500, // 1500-4999m = CAUTION, < 1500m = CLOSED
    },
    ceiling: {
        open: 1000,    // >= 1000 ft = OPEN
        caution: 500,  // 500-999 ft = CAUTION, < 500 ft = CLOSED
    },
    gustDelta: 10,     // > 10% above sustained = CAUTION factor
};

const SEVERE_WEATHER = ['Thunderstorm', 'Tornado', 'Extreme'];

export interface RunwayStatusResult {
    status: 'OPEN' | 'CAUTION' | 'CLOSED';
    reason: string;
    factors: string[];
    isOverride: boolean;
    overrideBy?: string;
    overrideExpiry?: Date;
}

export interface WeatherData {
    windSpeed: number;       // m/s
    windDirection?: number;  // degrees
    windGust?: number;       // m/s
    visibility?: number;     // meters
    ceiling?: number;        // feet
    condition: string;
    severeWeather?: string[];
}

@Injectable()
export class RunwayStatusService {
    private readonly logger = new Logger(RunwayStatusService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Helper to upgrade status to CAUTION only if not already CLOSED
     */
    private upgradeToCAUTION(currentStatus: 'OPEN' | 'CAUTION' | 'CLOSED'): 'OPEN' | 'CAUTION' | 'CLOSED' {
        return currentStatus === 'CLOSED' ? 'CLOSED' : 'CAUTION';
    }

    /**
     * Convert wind speed from m/s to knots
     */
    private msToKnots(ms: number): number {
        return ms * 1.944;
    }

    /**
     * Calculate crosswind component
     * crosswind = windSpeed × sin(|windDir - runwayHeading|)
     */
    private calculateCrosswind(windSpeed: number, windDirection: number, runwayHeading: number): number {
        const angleDiff = Math.abs(windDirection - runwayHeading);
        const radians = (angleDiff * Math.PI) / 180;
        return windSpeed * Math.abs(Math.sin(radians));
    }

    /**
     * Calculate runway status based on weather data and thresholds
     */
    calculateStatus(weather: WeatherData, runwayHeading: number = 270): RunwayStatusResult {
        const factors: string[] = [];
        let status: 'OPEN' | 'CAUTION' | 'CLOSED' = 'OPEN';

        // Convert wind to knots
        const windKts = this.msToKnots(weather.windSpeed);
        const gustKts = weather.windGust ? this.msToKnots(weather.windGust) : 0;

        // 1. Check severe weather (immediate CLOSED)
        if (weather.severeWeather && weather.severeWeather.length > 0) {
            const severeFound = weather.severeWeather.filter(sw =>
                SEVERE_WEATHER.some(s => sw.toLowerCase().includes(s.toLowerCase()))
            );
            if (severeFound.length > 0) {
                factors.push(`Severe weather: ${severeFound.join(', ')}`);
                return { status: 'CLOSED', reason: factors[0], factors, isOverride: false };
            }
        }

        // Check condition for severe weather
        if (SEVERE_WEATHER.some(s => weather.condition.toLowerCase().includes(s.toLowerCase()))) {
            factors.push(`Severe condition: ${weather.condition}`);
            return { status: 'CLOSED', reason: factors[0], factors, isOverride: false };
        }

        // 2. Wind speed check
        if (windKts > THRESHOLDS.wind.caution) {
            factors.push(`Wind ${windKts.toFixed(0)} kt > 40 kt`);
            status = 'CLOSED';
        } else if (windKts > THRESHOLDS.wind.open) {
            factors.push(`Wind ${windKts.toFixed(0)} kt (26-40 kt)`);
            status = this.upgradeToCAUTION(status);
        }

        // 3. Crosswind check
        if (weather.windDirection !== undefined && weather.windDirection !== null) {
            const crosswindKts = this.msToKnots(
                this.calculateCrosswind(weather.windSpeed, weather.windDirection, runwayHeading)
            );
            if (crosswindKts > THRESHOLDS.crosswind.caution) {
                factors.push(`Crosswind ${crosswindKts.toFixed(0)} kt > 25 kt`);
                status = 'CLOSED';
            } else if (crosswindKts > THRESHOLDS.crosswind.open) {
                factors.push(`Crosswind ${crosswindKts.toFixed(0)} kt (16-25 kt)`);
                status = this.upgradeToCAUTION(status);
            }
        }

        // 4. Visibility check
        if (weather.visibility !== undefined && weather.visibility !== null) {
            if (weather.visibility < THRESHOLDS.visibility.caution) {
                factors.push(`Visibility ${weather.visibility}m < 1500m`);
                status = 'CLOSED';
            } else if (weather.visibility < THRESHOLDS.visibility.open) {
                factors.push(`Visibility ${weather.visibility}m (1500-5000m)`);
                status = this.upgradeToCAUTION(status);
            }
        }

        // 5. Ceiling check
        if (weather.ceiling !== undefined && weather.ceiling !== null) {
            if (weather.ceiling < THRESHOLDS.ceiling.caution) {
                factors.push(`Ceiling ${weather.ceiling} ft < 500 ft`);
                status = 'CLOSED';
            } else if (weather.ceiling < THRESHOLDS.ceiling.open) {
                factors.push(`Ceiling ${weather.ceiling} ft (500-1000 ft)`);
                status = this.upgradeToCAUTION(status);
            }
        }

        // 6. Gust delta check (gust > 10% above sustained)
        if (gustKts > 0) {
            const gustDelta = ((gustKts - windKts) / windKts) * 100;
            if (gustDelta > THRESHOLDS.gustDelta) {
                factors.push(`Gust delta ${gustDelta.toFixed(0)}% > 10%`);
                status = this.upgradeToCAUTION(status);
            }
        }

        // 7. Fog/Mist conditions
        if (['Fog', 'Mist', 'Haze'].includes(weather.condition)) {
            factors.push(`Reduced visibility condition: ${weather.condition}`);
            status = this.upgradeToCAUTION(status);
        }

        const reason = factors.length > 0 ? factors[0] : 'All conditions normal';
        return { status, reason, factors, isOverride: false };
    }

    /**
     * Get effective runway status, considering manual overrides
     */
    async getEffectiveStatus(weather: WeatherData, runwayHeading: number = 270): Promise<RunwayStatusResult> {
        // Check for active manual override
        const override = await this.prisma.client.runwayOverride.findFirst({
            where: {
                clearedAt: null,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                operator: {
                    select: { firstName: true, lastName: true, username: true },
                },
            },
        });

        if (override) {
            return {
                status: override.status as 'OPEN' | 'CAUTION' | 'CLOSED',
                reason: `Manual override: ${override.reason}`,
                factors: [`Overridden by ${override.operator.firstName} ${override.operator.lastName}`],
                isOverride: true,
                overrideBy: override.operator.username,
                overrideExpiry: override.expiresAt || undefined,
            };
        }

        // Calculate from weather
        return this.calculateStatus(weather, runwayHeading);
    }

    /**
     * Set manual runway override (Ops Officer / Commander only)
     */
    async setManualOverride(
        status: 'OPEN' | 'CAUTION' | 'CLOSED',
        reason: string,
        operatorId: string,
        expiresAt?: Date,
    ) {
        // Clear any existing active override first
        await this.clearActiveOverrides(operatorId);

        const override = await this.prisma.client.runwayOverride.create({
            data: {
                status,
                reason,
                operatorId,
                expiresAt,
            },
        });

        // Log to audit
        await this.prisma.client.auditLog.create({
            data: {
                userId: operatorId,
                action: 'RUNWAY_OVERRIDE_SET',
                entity: 'RunwayOverride',
                entityId: override.id,
                details: JSON.stringify({ status, reason, expiresAt }),
            },
        });

        this.logger.log(`Runway override set to ${status} by ${operatorId}: ${reason}`);
        return override;
    }

    /**
     * Clear active runway override
     */
    async clearActiveOverrides(clearedBy: string) {
        const active = await this.prisma.client.runwayOverride.findMany({
            where: { clearedAt: null },
        });

        for (const override of active) {
            await this.prisma.client.runwayOverride.update({
                where: { id: override.id },
                data: { clearedAt: new Date(), clearedBy },
            });

            await this.prisma.client.auditLog.create({
                data: {
                    userId: clearedBy,
                    action: 'RUNWAY_OVERRIDE_CLEARED',
                    entity: 'RunwayOverride',
                    entityId: override.id,
                    details: JSON.stringify({ previousStatus: override.status }),
                },
            });
        }

        return active.length;
    }

    /**
     * Get runway heading from system settings
     */
    async getRunwayHeading(): Promise<number> {
        const setting = await this.prisma.client.systemSettings.findUnique({
            where: { key: 'RUNWAY_HEADING' },
        });
        return setting ? parseFloat(setting.value) : 270; // Default to 270 (Runway 27)
    }
}
