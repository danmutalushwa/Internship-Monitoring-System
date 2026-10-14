import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import type { AuthRequest } from '../auth/types/auth-request';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @Permissions('manage_roles')
  async getAllRoles() {
    return this.rolesService.findAll();
  }

  @Post()
  @Permissions('manage_roles')
  async createRole(@Body() dto: CreateRoleDto, @Req() req: AuthRequest) {
    const adminId = Number(req.user.id);
    return this.rolesService.create(dto, adminId);
  }

  @Put(':name')
  @Permissions('manage_roles')
  async updateRole(
    @Param('name') name: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: AuthRequest,
  ) {
    const adminId = Number(req.user.id);
    return this.rolesService.update(name, dto, adminId);
  }

  @Delete(':name')
  @Permissions('manage_roles')
  async deleteRole(@Param('name') name: string, @Req() req: AuthRequest) {
    const adminId = Number(req.user.id);
    return this.rolesService.remove(name, adminId);
  }
}