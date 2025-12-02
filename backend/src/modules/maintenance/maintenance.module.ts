import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceService } from './maintenance.service';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [JwtModule],
    controllers: [MaintenanceController],
    providers: [MaintenanceService, PrismaService],
})
export class MaintenanceModule { }
