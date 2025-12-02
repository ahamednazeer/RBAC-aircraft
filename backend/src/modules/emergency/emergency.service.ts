import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EmergencyService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.client.emergency.findMany({
            include: {
                timeline: {
                    orderBy: { createdAt: 'asc' },
                },
                assignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.emergency.findUnique({
            where: { id },
            include: {
                timeline: {
                    orderBy: { createdAt: 'asc' },
                },
                assignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async create(data: any) {
        const emergency = await this.prisma.client.emergency.create({
            data,
        });

        // Create initial timeline event
        await this.prisma.client.emergencyTimeline.create({
            data: {
                emergencyId: emergency.id,
                event: 'Emergency created',
                description: 'Emergency reported and logged in system',
            },
        });

        return this.findOne(emergency.id);
    }

    async update(id: string, data: any) {
        return this.prisma.client.emergency.update({
            where: { id },
            data,
        });
    }

    async updateStatus(id: string, status: string) {
        const emergency = await this.prisma.client.emergency.update({
            where: { id },
            data: { status: status as any },
        });

        // Add timeline event
        await this.prisma.client.emergencyTimeline.create({
            data: {
                emergencyId: id,
                event: `Status changed to ${status}`,
                description: `Emergency status updated to ${status}`,
            },
        });

        return this.findOne(id);
    }

    async assignUser(emergencyId: string, userId: string) {
        await this.prisma.client.emergencyAssignment.create({
            data: {
                emergencyId,
                userId,
            },
        });

        await this.prisma.client.emergencyTimeline.create({
            data: {
                emergencyId,
                event: 'Team member assigned',
                description: 'Response team member assigned to emergency',
            },
        });

        return this.findOne(emergencyId);
    }

    async getActiveCount() {
        return this.prisma.client.emergency.count({
            where: { status: 'ACTIVE' },
        });
    }
}
