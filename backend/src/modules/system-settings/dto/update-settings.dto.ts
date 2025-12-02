import { IsString, IsOptional } from 'class-validator';

export class UpdateSettingsDto {
    @IsString()
    @IsOptional()
    baseName?: string;

    @IsString()
    @IsOptional()
    timezone?: string;

    @IsOptional()
    modules?: {
        maintenance?: boolean;
        emergency?: boolean;
        training?: boolean;
        family?: boolean;
        fatigue?: boolean;
    };

    @IsOptional()
    rbacPolicy?: Record<string, any>;
}
