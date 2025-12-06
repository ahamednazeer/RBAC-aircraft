import { Module } from '@nestjs/common';
import { PilotDashboardController } from './pilot-dashboard.controller';
import { PilotDashboardService } from './pilot-dashboard.service';
import { PrismaService } from '../../prisma.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
    imports: [WeatherModule],
    controllers: [PilotDashboardController],
    providers: [PilotDashboardService, PrismaService],
    exports: [PilotDashboardService],
})
export class PilotDashboardModule { }
