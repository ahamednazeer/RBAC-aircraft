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
import { AircraftService } from './aircraft.service';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('aircraft')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AircraftController {
    constructor(private aircraftService: AircraftService) { }

    @Get()
    @Roles('PILOT', 'TECHNICIAN', 'COMMANDER', 'ADMIN')
    async findAll(@Request() req) {
        return this.aircraftService.findAll(req.user.role);
    }

    @Get('stats')
    @Roles('PILOT', 'TECHNICIAN', 'COMMANDER', 'ADMIN')
    async getStats() {
        return this.aircraftService.getStats();
    }

    @Get(':id')
    @Roles('PILOT', 'TECHNICIAN', 'COMMANDER', 'ADMIN')
    async findOne(@Param('id') id: string) {
        return this.aircraftService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    async create(@Body() createDto: any) {
        return this.aircraftService.create(createDto);
    }

    @Patch(':id')
    @Roles('TECHNICIAN', 'ADMIN')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return this.aircraftService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    async delete(@Param('id') id: string) {
        return this.aircraftService.delete(id);
    }
}
