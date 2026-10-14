import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  reportId: number;

  @IsString()
  feedback: string;

  @IsEnum(['APPROVED', 'REJECTED', 'NEEDS_REVISION'])
  status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

  @IsOptional()
  @IsString()
  date?: string;
}