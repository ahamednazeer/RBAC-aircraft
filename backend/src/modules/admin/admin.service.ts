import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    // User Management
    async getAllUsers() {
        return this.prisma.client.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async createUser(dto: CreateUserDto) {
        // Check if user already exists
        const existingUser = await this.prisma.client.user.findFirst({
            where: {
                OR: [{ email: dto.email }, { username: dto.username }],
            },
        });

        if (existingUser) {
            throw new ConflictException('User with this email or username already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.client.user.create({
            data: {
                ...dto,
                password: hashedPassword,
                isActive: dto.isActive ?? true,
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async updateUser(id: string, dto: UpdateUserDto) {
        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updateData: any = { ...dto };

        // Hash password if provided
        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 10);
        }

        return this.prisma.client.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async deleteUser(id: string) {
        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.client.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }

    async assignRole(id: string, dto: AssignRoleDto) {
        const user = await this.prisma.client.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.client.user.update({
            where: { id },
            data: { role: dto.role },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    // System Statistics
    async getSystemStats() {
        const [
            totalUsers,
            activeUsers,
            totalAircraft,
            readyAircraft,
            activeMaintenance,
            activeEmergencies,
            totalDocuments,
        ] = await Promise.all([
            this.prisma.client.user.count(),
            this.prisma.client.user.count({ where: { isActive: true } }),
            this.prisma.client.aircraft.count(),
            this.prisma.client.aircraft.count({ where: { status: 'READY' } }),
            this.prisma.client.maintenanceLog.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.client.emergency.count({ where: { status: 'ACTIVE' } }),
            this.prisma.client.document.count(),
        ]);

        const usersByRole = await this.prisma.client.user.groupBy({
            by: ['role'],
            _count: true,
        });

        const aircraftByStatus = await this.prisma.client.aircraft.groupBy({
            by: ['status'],
            _count: true,
        });

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                byRole: usersByRole.reduce((acc, item) => {
                    acc[item.role] = item._count;
                    return acc;
                }, {}),
            },
            aircraft: {
                total: totalAircraft,
                ready: readyAircraft,
                byStatus: aircraftByStatus.reduce((acc, item) => {
                    acc[item.status] = item._count;
                    return acc;
                }, {}),
            },
            maintenance: {
                active: activeMaintenance,
            },
            emergencies: {
                active: activeEmergencies,
            },
            documents: {
                total: totalDocuments,
            },
        };
    }
}
