import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GroqResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

@Injectable()
export class GroqService {
    private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    private readonly apiKey: string;
    private readonly model: string;

    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || '';
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

        // Debug: Log key info (masked for security)
        const keyLength = this.apiKey.length;
        const keyPreview = this.apiKey ? `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(keyLength - 4)}` : 'NOT SET';
        console.log(`[GroqService] API Key loaded: ${keyPreview} (length: ${keyLength})`);
        console.log(`[GroqService] Model: ${this.model}`);
    }

    async chat(messages: ChatMessage[]): Promise<string> {
        if (!this.apiKey) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        try {
            const response = await axios.post<GroqResponse>(
                this.apiUrl,
                {
                    model: this.model,
                    messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return response.data.choices[0]?.message?.content || 'No response generated.';
        } catch (error: any) {
            console.error('GROQ API error:', error.response?.data || error.message);
            throw new Error('Failed to generate AI response');
        }
    }
}
