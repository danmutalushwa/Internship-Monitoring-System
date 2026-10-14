import { InternshipStatus } from '@prisma/client';
import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export class CreateInternshipDto {
  @IsString()
  company: string;

  @IsString()
  department: string;

  @IsDateString()
  startDate: string; // must be ISO format: YYYY-MM-DD

  @IsDateString()
  endDate: string;

  @IsString()
  supervisor: string;

  @IsEnum(InternshipStatus)
  status: InternshipStatus;
}

export class UpdateInternshipDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  supervisor?: string;

  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;
}