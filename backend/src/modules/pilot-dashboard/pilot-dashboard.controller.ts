import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { PilotDashboardService } from './pilot-dashboard.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pilot-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PilotDashboardController {
    constructor(private readonly pilotDashboardService: PilotDashboardService) { }

    @Get()
    @Roles(Role.PILOT, Role.ADMIN, Role.COMMANDER)
    async getDashboard(@Request() req: any) {
        return this.pilotDashboardService.getDashboardData(req.user.sub);
    }

    @Get('alerts')
    @Roles(Role.PILOT, Role.ADMIN, Role.COMMANDER)
    async getAlerts(@Request() req: any) {
        return this.pilotDashboardService.getAlerts(req.user.sub);
    }

    @Patch('missions/:id/acknowledge')
    @Roles(Role.PILOT)
    async acknowledgeMission(@Param('id') id: string, @Request() req: any) {
        return this.pilotDashboardService.acknowledgeMission(id, req.user.sub);
    }

    @Patch('alerts/:id/read')
    @Roles(Role.PILOT, Role.ADMIN, Role.COMMANDER)
    async markAlertRead(@Param('id') id: string, @Request() req: any) {
        return this.pilotDashboardService.markAlertRead(id, req.user.sub);
    }
}
