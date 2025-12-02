import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MissionsService } from './missions.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MissionsController {
    constructor(private readonly missionsService: MissionsService) { }

    @Post()
    @Roles(Role.ADMIN, Role.COMMANDER, Role.PILOT, Role.OPS_OFFICER) // Assuming Pilots can maybe request missions? Or just Admin/Commander
    create(@Body() createMissionDto: CreateMissionDto) {
        return this.missionsService.create(createMissionDto);
    }

    @Get()
    @Roles(Role.ADMIN, Role.COMMANDER, Role.PILOT, Role.TECHNICIAN)
    findAll(@Query('status') status?: string) {
        // Basic filtering by status if provided
        const where = status ? { status: status as any } : {};
        return this.missionsService.findAll({ where });
    }

    @Get(':id')
    @Roles(Role.ADMIN, Role.COMMANDER, Role.PILOT, Role.TECHNICIAN)
    findOne(@Param('id') id: string) {
        return this.missionsService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.COMMANDER)
    update(@Param('id') id: string, @Body() updateMissionDto: UpdateMissionDto) {
        return this.missionsService.update(id, updateMissionDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.COMMANDER)
    remove(@Param('id') id: string) {
        return this.missionsService.remove(id);
    }
}
