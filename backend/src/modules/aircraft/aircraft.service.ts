import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AircraftService {
    constructor(private prisma: PrismaService) { }

    async findAll(userRole?: string) {
        // All roles can view aircraft, but with different levels of detail
        return this.prisma.client.aircraft.findMany({
            orderBy: { tailNumber: 'asc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.aircraft.findUnique({
            where: { id },
            include: {
                maintenanceLogs: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        technician: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async create(data: any) {
        return this.prisma.client.aircraft.create({
            data,
        });
    }

    async update(id: string, data: any) {
        return this.prisma.client.aircraft.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.client.aircraft.delete({
            where: { id },
        });
    }

    async getStats() {
        const total = await this.prisma.client.aircraft.count();
        const ready = await this.prisma.client.aircraft.count({
            where: { status: 'READY' },
        });
        const inMaintenance = await this.prisma.client.aircraft.count({
            where: { status: 'IN_MAINTENANCE' },
        });
        const grounded = await this.prisma.client.aircraft.count({
            where: { status: 'GROUNDED' },
        });

        return {
            total,
            ready,
            inMaintenance,
            grounded,
            readyPercentage: total > 0 ? Math.round((ready / total) * 100) : 0,
        };
    }
}
