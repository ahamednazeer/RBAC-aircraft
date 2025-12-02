import { IsString, IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { MissionStatus, MissionType } from '@prisma/client';

export class CreateMissionDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    aircraftId?: string;

    @IsOptional()
    @IsUUID()
    pilotId?: string;

    @IsDateString()
    startTime: string;

    @IsOptional()
    @IsDateString()
    endTime?: string;

    @IsOptional()
    @IsEnum(MissionStatus)
    status?: MissionStatus;

    @IsEnum(MissionType)
    type: MissionType;
}
