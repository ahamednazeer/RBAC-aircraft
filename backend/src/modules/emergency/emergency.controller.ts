import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmergencyService } from './emergency.service';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('emergencies')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EmergencyController {
    constructor(private emergencyService: EmergencyService) { }

    @Get()
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN', 'PILOT')
    async findAll() {
        return this.emergencyService.findAll();
    }

    @Get('active-count')
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN')
    async getActiveCount() {
        const count = await this.emergencyService.getActiveCount();
        return { count };
    }

    @Get(':id')
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN')
    async findOne(@Param('id') id: string) {
        return this.emergencyService.findOne(id);
    }

    @Post()
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN')
    async create(@Body() createDto: any) {
        return this.emergencyService.create(createDto);
    }

    @Patch(':id')
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return this.emergencyService.update(id, updateDto);
    }

    @Patch(':id/status')
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN')
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.emergencyService.updateStatus(id, body.status);
    }

    @Post(':id/assign')
    @Roles('EMERGENCY', 'COMMANDER', 'ADMIN')
    async assignUser(@Param('id') id: string, @Body() body: { userId: string }) {
        return this.emergencyService.assignUser(id, body.userId);
    }
}
