import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AircraftController } from './aircraft.controller';
import { AircraftService } from './aircraft.service';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [JwtModule],
    controllers: [AircraftController],
    providers: [AircraftService, PrismaService],
})
export class AircraftModule { }
