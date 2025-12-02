import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    controllers: [WeatherController],
    providers: [WeatherService, PrismaService],
    exports: [WeatherService],
})
export class WeatherModule { }
