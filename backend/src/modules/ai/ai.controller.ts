import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

interface ChatRequestDto {
    message: string;
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('chat')
    @HttpCode(HttpStatus.OK)
    async chat(@Body() body: ChatRequestDto, @Request() req: any) {
        const { message } = body;

        if (!message || message.trim().length === 0) {
            return {
                success: false,
                error: 'Message is required',
            };
        }

        try {
            const response = await this.aiService.chat(message, {
                userId: req.user.sub,
                role: req.user.role,
            });

            return {
                success: true,
                response,
            };
        } catch (error: any) {
            console.error('AI chat error:', error);
            return {
                success: false,
                error: error.message || 'Failed to generate response',
            };
        }
    }
}
