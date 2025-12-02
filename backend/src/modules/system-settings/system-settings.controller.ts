import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { SystemSettingsService } from './system-settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('system-settings')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) { }

    @Get()
    @Roles('ADMIN')
    async getSettings() {
        return this.settingsService.getAllSettings();
    }

    @Patch()
    @Roles('ADMIN')
    async updateSettings(@Body() dto: UpdateSettingsDto) {
        return this.settingsService.updateSettings(dto);
    }

    @Post('reset')
    @Roles('ADMIN')
    async resetSettings() {
        return this.settingsService.resetToDefaults();
    }
}
