import { IsString, IsOptional, IsArray } from 'class-validator';
import { Role } from '@prisma/client';

export class UploadDocumentDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    allowedRoles: Role[];

    @IsArray()
    @IsOptional()
    tags?: string[];
}

export class UpdateDocumentDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    allowedRoles?: Role[];

    @IsArray()
    @IsOptional()
    tags?: string[];
}
