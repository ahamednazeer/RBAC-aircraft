import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.prisma.client.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        const { password: _, ...result } = user;
        return result;
    }

    async login(username: string, password: string) {
        const user = await this.validateUser(username, password);

        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    async register(data: {
        email: string;
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
    }) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.client.user.create({
            data: {
                ...data,
                role: data.role as any,
                password: hashedPassword,
            },
        });

        const { password: _, ...result } = user;
        return result;
    }
}
