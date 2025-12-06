import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GroqService } from './groq.service';
import { PrismaService } from '../../prisma.service';

@Module({
    controllers: [AiController],
    providers: [AiService, GroqService, PrismaService],
    exports: [AiService],
})
export class AiModule { }
