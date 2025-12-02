import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmergencyController } from './emergency.controller';
import { EmergencyService } from './emergency.service';
import { PrismaService } from '../../prisma.service';

@Module({
    imports: [JwtModule],
    controllers: [EmergencyController],
    providers: [EmergencyService, PrismaService],
})
export class EmergencyModule { }
