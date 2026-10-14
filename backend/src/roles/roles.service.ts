import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const roles = await this.prisma.role.findMany();
    return roles.map((role) => ({
      ...role,
      permissions: JSON.parse(role.permissions),
    }));
  }

  async findByName(name: string) {
    const role = await this.prisma.role.findUnique({ where: { name } });
    if (!role) return null;
    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  }

  async create(dto: CreateRoleDto, adminId: number) {
    const existing = await this.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Role '${dto.name}' already exists`);
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name.toUpperCase(),
        permissions: JSON.stringify(dto.permissions),
        createdBy: adminId, 
      },
    });

    await this.auditService.logAction(adminId, 'CREATE_ROLE', 'ROLE', role.id, role.name);

    return {
      ...role,
      permissions: JSON.parse(role.permissions),
    };
  }

  async update(name: string, dto: UpdateRoleDto, adminId: number) {
    const role = await this.findByName(name);
    if (!role) {
      throw new NotFoundException(`Role '${name}' not found`);
    }

    const updated = await this.prisma.role.update({
      where: { name },
      data: {
        permissions: JSON.stringify(dto.permissions),
      },
    });

    await this.auditService.logAction(adminId, 'UPDATE_ROLE', 'ROLE', updated.id, updated.name);

    return {
      ...updated,
      permissions: JSON.parse(updated.permissions),
    };
  }

  async remove(name: string, adminId: number) {
    const role = await this.findByName(name);
    if (!role) {
      throw new NotFoundException(`Role '${name}' not found`);
    }

    await this.prisma.role.delete({ where: { name } });

    await this.auditService.logAction(adminId, 'DELETE_ROLE', 'ROLE', undefined, name);
  }
}