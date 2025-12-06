import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SystemSettingsService {
    constructor(private prisma: PrismaService) { }

    async getAllSettings() {
        const settings = await this.prisma.client.systemSettings.findMany();

        // Convert to key-value object
        const settingsObject: Record<string, any> = {};
        settings.forEach((setting) => {
            try {
                settingsObject[setting.key] = JSON.parse(setting.value);
            } catch {
                settingsObject[setting.key] = setting.value;
            }
        });

        return settingsObject;
    }

    async updateSettings(dto: UpdateSettingsDto) {
        const updates: Promise<any>[] = [];

        if (dto.baseName !== undefined) {
            updates.push(
                this.prisma.client.systemSettings.upsert({
                    where: { key: 'baseName' },
                    update: { value: dto.baseName },
                    create: { key: 'baseName', value: dto.baseName, category: 'general' },
                }),
            );
        }

        if (dto.baseLocation !== undefined) {
            updates.push(
                this.prisma.client.systemSettings.upsert({
                    where: { key: 'baseLocation' },
                    update: { value: dto.baseLocation },
                    create: { key: 'baseLocation', value: dto.baseLocation, category: 'general' },
                }),
            );
        }

        if (dto.timezone !== undefined) {
            updates.push(
                this.prisma.client.systemSettings.upsert({
                    where: { key: 'timezone' },
                    update: { value: dto.timezone },
                    create: { key: 'timezone', value: dto.timezone, category: 'general' },
                }),
            );
        }

        if (dto.modules !== undefined) {
            updates.push(
                this.prisma.client.systemSettings.upsert({
                    where: { key: 'modules' },
                    update: { value: JSON.stringify(dto.modules) },
                    create: {
                        key: 'modules',
                        value: JSON.stringify(dto.modules),
                        category: 'modules',
                    },
                }),
            );
        }

        if (dto.rbacPolicy !== undefined) {
            updates.push(
                this.prisma.client.systemSettings.upsert({
                    where: { key: 'rbacPolicy' },
                    update: { value: JSON.stringify(dto.rbacPolicy) },
                    create: {
                        key: 'rbacPolicy',
                        value: JSON.stringify(dto.rbacPolicy),
                        category: 'rbac',
                    },
                }),
            );
        }

        await Promise.all(updates);

        return this.getAllSettings();
    }

    async resetToDefaults() {
        await this.prisma.client.systemSettings.deleteMany();

        const defaults = {
            baseName: 'AeroOps Airbase',
            baseLocation: 'London',
            timezone: 'UTC',
            modules: {
                maintenance: true,
                emergency: true,
                training: true,
                family: true,
                fatigue: true,
            },
            rbacPolicy: {},
        };

        await this.updateSettings(defaults);

        return defaults;
    }
}
