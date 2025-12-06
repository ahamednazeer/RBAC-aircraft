import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { RunwayStatusService } from './runway-status.service';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [WeatherController],
    providers: [WeatherService, RunwayStatusService, PrismaService],
    exports: [WeatherService, RunwayStatusService],
})
export class WeatherModule { }

