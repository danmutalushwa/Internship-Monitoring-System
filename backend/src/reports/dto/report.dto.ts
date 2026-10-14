import { IsNotEmpty, IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { $Enums } from '@prisma/client';

export type ReportStatus = $Enums.ReportStatus;

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsInt()
  internshipId?: number; 
}

export class UpdateReportStatusDto {
  @IsNotEmpty()
  @IsEnum($Enums.ReportStatus)
  status: ReportStatus;

  @IsOptional()
  @IsString()
  feedback?: string; 

  @IsOptional()
  @IsString()
  content?: string; 

  @IsOptional()
  @IsInt()
  parentId?: number;
}

export class ReportDto {
  id: number;
  title: string;
  status: ReportStatus;
  content: string;
  feedback: string;
  fileUrl?: string;
  url: string;
  date: string; 
  createdAt?: string;
  updatedAt?: string;

  student?: {
    id: number;
    name: string;
  };

  reviewer?: {
    id: number;
    name: string;
  };

  facultyId?: number;
  type: string;

  internship?: { 
    id: number;
    company: string;
  };
}