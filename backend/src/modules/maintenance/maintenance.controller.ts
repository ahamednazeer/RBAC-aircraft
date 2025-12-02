import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MaintenanceService } from './maintenance.service';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('maintenance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MaintenanceController {
    constructor(private maintenanceService: MaintenanceService) { }

    @Get()
    @Roles('TECHNICIAN', 'COMMANDER', 'ADMIN')
    async findAll(@Request() req) {
        return this.maintenanceService.findAll(req.user.role, req.user.id);
    }

    @Get(':id')
    @Roles('TECHNICIAN', 'COMMANDER', 'ADMIN')
    async findOne(@Param('id') id: string) {
        return this.maintenanceService.findOne(id);
    }

    @Post()
    @Roles('TECHNICIAN', 'ADMIN')
    async create(@Body() createDto: any) {
        return this.maintenanceService.create(createDto);
    }

    @Patch(':id')
    @Roles('TECHNICIAN', 'ADMIN')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return this.maintenanceService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    async delete(@Param('id') id: string) {
        return this.maintenanceService.delete(id);
    }
}
