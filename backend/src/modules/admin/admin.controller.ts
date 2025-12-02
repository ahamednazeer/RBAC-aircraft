import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { AdminService } from './admin.service';
import { CreateUserDto, UpdateUserDto, AssignRoleDto } from './dto/user.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // User Management
    @Get('users')
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }

    @Post('users')
    async createUser(@Body() dto: CreateUserDto) {
        return this.adminService.createUser(dto);
    }

    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.adminService.updateUser(id, dto);
    }

    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return this.adminService.deleteUser(id);
    }

    @Patch('users/:id/role')
    async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
        return this.adminService.assignRole(id, dto);
    }

    // System Statistics
    @Get('stats')
    async getStats() {
        return this.adminService.getSystemStats();
    }
}
