import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MaintenanceService {
    constructor(private prisma: PrismaService) { }

    async findAll(userRole?: string, userId?: string) {
        const where: any = {};

        // Technicians see only their own logs
        if (userRole === 'TECHNICIAN') {
            where.technicianId = userId;
        }

        return this.prisma.client.maintenanceLog.findMany({
            where,
            include: {
                aircraft: true,
                technician: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.client.maintenanceLog.findUnique({
            where: { id },
            include: {
                aircraft: true,
                technician: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        username: true,
                    },
                },
            },
        });
    }

    async create(data: any) {
        return this.prisma.client.maintenanceLog.create({
            data,
            include: {
                aircraft: true,
                technician: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.client.maintenanceLog.update({
            where: { id },
            data,
            include: {
                aircraft: true,
                technician: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async delete(id: string) {
        return this.prisma.client.maintenanceLog.delete({
            where: { id },
        });
    }
}
