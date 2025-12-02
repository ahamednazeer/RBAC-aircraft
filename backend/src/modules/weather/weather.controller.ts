import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('weather')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('refresh')
    @Roles(Role.ADMIN, Role.COMMANDER, Role.OPS_OFFICER)
    async refreshWeather() {
        return this.weatherService.fetchAndSaveWeather();
    }

    @Get('current')
    async getCurrentWeather() {
        return this.weatherService.getLatestSnapshot();
    }
}
