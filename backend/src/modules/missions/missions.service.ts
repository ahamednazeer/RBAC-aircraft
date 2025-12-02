import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { Mission, Prisma } from '@prisma/client';

@Injectable()
export class MissionsService {
    constructor(private prisma: PrismaService) { }

    async create(createMissionDto: CreateMissionDto): Promise<Mission> {
        return this.prisma.client.mission.create({
            data: createMissionDto,
        });
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        cursor?: Prisma.MissionWhereUniqueInput;
        where?: Prisma.MissionWhereInput;
        orderBy?: Prisma.MissionOrderByWithRelationInput;
    }): Promise<Mission[]> {
        const { skip, take, cursor, where, orderBy } = params || {};
        return this.prisma.client.mission.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                aircraft: true,
                pilot: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
        });
    }

    async findOne(id: string): Promise<Mission | null> {
        return this.prisma.client.mission.findUnique({
            where: { id },
            include: {
                aircraft: true,
                pilot: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                    },
                },
            },
        });
    }

    async update(id: string, updateMissionDto: UpdateMissionDto): Promise<Mission> {
        return this.prisma.client.mission.update({
            where: { id },
            data: updateMissionDto,
        });
    }

    async remove(id: string): Promise<Mission> {
        return this.prisma.client.mission.delete({
            where: { id },
        });
    }
}
