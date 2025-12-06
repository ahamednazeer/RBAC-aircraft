import { Controller, Get, Post, Patch, Body, Query, UseGuards, Request } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { RunwayStatusService } from './runway-status.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

/**
 * Weather Controller with Role-Based Access Control
 * 
 * Role Access Matrix:
 * | Role          | Origin | Destination | Runway Status | Severe Alerts | Forecast |
 * |---------------|--------|-------------|---------------|---------------|----------|
 * | Pilot         | ✅ Yes | ✅ If mission | ✅ Yes      | ✅ Yes        | ❌ No   |
 * | Ops Officer   | ✅ Yes | ✅ Yes      | ✅ Yes        | ✅ Yes        | ✅ Yes  |
 * | Commander     | ✅ Summary | ❌ No   | ✅ Risk level | ✅ Yes        | Summary |
 * | Technician    | ⚠️ Minimal | ❌ No   | ❌ No         | ⚠️ Critical   | ❌ No   |
 * | Emergency     | ⚠️ Incident | ❌ No  | ❌ No         | ⚠️ Yes        | ❌ No   |
 * | Trainee       | ❌ No  | ❌ No       | ❌ No         | ❌ No         | ❌ No   |
 * | Family        | ❌ No  | ❌ No       | ❌ No         | ❌ No         | ❌ No   |
 * | Admin         | ❌ No  | ❌ No       | ❌ No         | ❌ No         | ❌ No   |
 */

@Controller('weather')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WeatherController {
    constructor(
        private readonly weatherService: WeatherService,
        private readonly runwayStatusService: RunwayStatusService,
    ) { }

    @Post('refresh')
    @Roles(Role.COMMANDER, Role.OPS_OFFICER)
    async refreshWeather() {
        return this.weatherService.fetchAndSaveWeather();
    }

    @Get('current')
    async getCurrentWeather(@Request() req: any) {
        const weather = await this.weatherService.getLatestSnapshot();
        const userRole = req.user?.role;

        // ❌ NO WEATHER DATA for these roles
        if (['TRAINEE', 'FAMILY', 'ADMIN'].includes(userRole)) {
            return {
                message: 'Weather data not available for this role',
                accessLevel: 'none'
            };
        }

        // ⚠️ TECHNICIAN - Minimal weather (safety-related only)
        // Only sees: basic conditions affecting maintenance (heavy rain, lightning, extreme temps)
        if (userRole === 'TECHNICIAN') {
            const criticalAlerts = weather?.severeWeather?.filter(sw =>
                ['thunderstorm', 'high_wind', 'extreme_heat', 'extreme_cold', 'lightning'].includes(sw)
            ) || [];

            return {
                accessLevel: 'minimal',
                // Basic weather affecting outdoor maintenance
                condition: weather?.condition,
                temperature: weather?.temperature,
                precipitation: weather?.precipitation,
                // Only critical severe weather alerts
                severeWeatherAlerts: criticalAlerts.length > 0 ? criticalAlerts : null,
                // No runway status, no destination, no forecast
                timestamp: weather?.timestamp,
            };
        }

        // ⚠️ EMERGENCY - Incident-relevant weather only
        // Wind, visibility (affects smoke/fire), temp, rain intensity, severe alerts
        if (userRole === 'EMERGENCY') {
            return {
                accessLevel: 'incident-only',
                // Wind & visibility (affects smoke, fire spread)
                windSpeed: weather?.windSpeed,
                windDirection: weather?.windDirection,
                visibility: weather?.visibility,
                // Temperature (heat-related incidents)
                temperature: weather?.temperature,
                // Rain intensity (response delay)
                precipitation: weather?.precipitation,
                precipIntensity: weather?.precipIntensity,
                // Severe weather alerts
                severeWeatherAlerts: weather?.severeWeather,
                condition: weather?.condition,
                // No runway status, no destination, no forecast
                timestamp: weather?.timestamp,
            };
        }

        // ✅ COMMANDER - Summary/Risk view
        // Origin summary, runway risk level, severe alerts, no destination, summary forecast only
        if (userRole === 'COMMANDER') {
            return {
                accessLevel: 'summary',
                // Weather overview (not full METAR)
                condition: weather?.condition,
                temperature: weather?.temperature,
                windSpeed: weather?.windSpeed,
                // Runway risk level
                runwayStatus: weather?.runwayStatus,
                runwayStatusReason: weather?.runwayStatusReason,
                isOverride: weather?.isOverride,
                // Severe weather warnings
                severeWeatherAlerts: weather?.severeWeather,
                // Weather trend summary
                isStale: weather?.isStale,
                // No destination weather
                // No detailed METAR/TAF
                timestamp: weather?.timestamp,
            };
        }

        // ✅ PILOT - Full flight weather
        // Origin weather, runway status, severe alerts, destination (if mission has it)
        if (userRole === 'PILOT') {
            return {
                accessLevel: 'flight',
                // Full origin weather
                condition: weather?.condition,
                temperature: weather?.temperature,
                windSpeed: weather?.windSpeed,
                windDirection: weather?.windDirection,
                windGust: weather?.windGust,
                visibility: weather?.visibility,
                ceiling: weather?.ceiling,
                humidity: weather?.humidity,
                pressure: weather?.pressure,
                precipitation: weather?.precipitation,
                // Runway status
                runwayStatus: weather?.runwayStatus,
                runwayStatusReason: weather?.runwayStatusReason,
                runwayStatusFactors: weather?.runwayStatusFactors,
                isOverride: weather?.isOverride,
                overrideBy: weather?.overrideBy,
                overrideExpiry: weather?.overrideExpiry,
                // Severe weather alerts
                severeWeatherAlerts: weather?.severeWeather,
                // Formatted METAR-style
                formattedWeather: weather?.formattedWeather,
                // Stale indicator
                isStale: weather?.isStale,
                staleSince: weather?.staleSince,
                // Destination weather fetched separately via mission endpoint
                // No forecast (TAF) for pilot - Ops provides this
                timestamp: weather?.timestamp,
            };
        }

        // ✅ OPS_OFFICER - Full operational weather for planning
        // Origin, destination, alternate, runway, alerts, forecast (TAF)
        if (userRole === 'OPS_OFFICER') {
            return {
                accessLevel: 'full',
                // Complete origin weather
                ...weather,
                // Destination weather available via /location endpoint
                // Forecast available (TODO: integrate TAF API)
                forecastAvailable: true,
                timestamp: weather?.timestamp,
            };
        }

        // Default: minimal for any unrecognized role
        return {
            message: 'Weather data not available',
            accessLevel: 'none'
        };
    }

    @Get('location')
    @Roles(Role.PILOT, Role.OPS_OFFICER)
    async getWeatherByLocation(
        @Request() req: any,
        @Query('lat') lat: string,
        @Query('lon') lon: string,
    ) {
        // Only Pilot (if mission has destination) and Ops Officer can fetch location weather
        return this.weatherService.getWeatherForLocation(
            parseFloat(lat),
            parseFloat(lon),
        );
    }

    @Get('runway-status')
    @Roles(Role.PILOT, Role.OPS_OFFICER, Role.COMMANDER)
    async getRunwayStatus(@Request() req: any) {
        const userRole = req.user?.role;
        const weather = await this.weatherService.getLatestSnapshot();

        // Commander gets risk level only
        if (userRole === 'COMMANDER') {
            return {
                status: weather?.runwayStatus,
                reason: weather?.runwayStatusReason,
                isOverride: weather?.isOverride,
                timestamp: weather?.timestamp,
            };
        }

        // Pilot and Ops get full runway status
        return {
            status: weather?.runwayStatus,
            reason: weather?.runwayStatusReason,
            factors: weather?.runwayStatusFactors,
            isOverride: weather?.isOverride,
            overrideBy: weather?.overrideBy,
            overrideExpiry: weather?.overrideExpiry,
            timestamp: weather?.timestamp,
        };
    }

    @Post('runway-override')
    @Roles(Role.COMMANDER, Role.OPS_OFFICER)
    async setRunwayOverride(
        @Request() req: any,
        @Body() body: { status: 'OPEN' | 'CAUTION' | 'CLOSED'; reason: string; expiresAt?: string },
    ) {
        const expiresAt = body.expiresAt ? new Date(body.expiresAt) : undefined;
        return this.runwayStatusService.setManualOverride(
            body.status,
            body.reason,
            req.user.sub,
            expiresAt,
        );
    }

    @Patch('runway-override/clear')
    @Roles(Role.COMMANDER, Role.OPS_OFFICER)
    async clearRunwayOverride(@Request() req: any) {
        const count = await this.runwayStatusService.clearActiveOverrides(req.user.sub);
        return { message: `Cleared ${count} override(s)`, count };
    }

    @Get('system-status')
    @Roles(Role.ADMIN)
    async getSystemStatus() {
        // Admin only sees system health, not weather data
        const weather = await this.weatherService.getLatestSnapshot();
        return {
            accessLevel: 'system-only',
            // System health info only
            apiStatus: weather ? 'CONNECTED' : 'DISCONNECTED',
            lastFetchTimestamp: weather?.timestamp,
            isStale: weather?.isStale,
            staleSince: weather?.staleSince,
            // No weather data
        };
    }
}


