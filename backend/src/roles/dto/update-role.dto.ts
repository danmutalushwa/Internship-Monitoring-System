import { IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsArray()
  @ArrayNotEmpty()
  permissions: string[];
}