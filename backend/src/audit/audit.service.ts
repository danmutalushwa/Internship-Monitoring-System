import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Logs an action to the audit trail.
   * @param actorId - The numeric ID of the user performing the action
   * @param action - A string describing the action (e.g. 'DELETE_USER', 'ASSIGN_SUPERVISOR')
   * @param entityType - The type of entity affected (e.g. 'USER', 'REPORT')
   * @param entityId - The ID of the affected entity
   * @param target - Optional human-readable label (e.g. 'Dan Andrew (dan@example.com)')
   */
  async logAction(
    actorId: number,
    action: string,
    entityType?: string,
    entityId?: number,
    target?: string,
  ) {
    console.log(
      `[AUDIT] ${action} by ${actorId} on ${entityType ?? 'UNKNOWN'} #${entityId ?? 'N/A'}`,
    );

    return this.prisma.auditLog.create({
      data: {
        actor: actorId,   // numeric ID
        action,
        entityType,
        entityId,
        target,           // readable email or name
      },
    });
  }
}