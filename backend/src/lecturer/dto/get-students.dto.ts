import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetStudentsDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  facultyId: number;
}