import { IsNumber, IsOptional } from 'class-validator';

export class AssignUserDto {
  @IsOptional()
  @IsNumber()
  lecturerId?: number;

  @IsOptional()
  @IsNumber()
  reviewerId?: number;

  @IsOptional()
  @IsNumber()
  supervisorId?: number;
}