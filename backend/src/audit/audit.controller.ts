import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Roles } from '../auth/roles.decorator';
import { RoleType } from '@prisma/client';

@Controller('audit')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles(RoleType.ADMIN)
  async getAuditLogs() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      id: log.id,
      actor: String(log.actor),
      action: log.action,
      target: log.target ?? `${log.entityType ?? 'UNKNOWN'} #${log.entityId ?? 'N/A'}`,
      timestamp: log.createdAt.toISOString(), 
    }));
  }
}