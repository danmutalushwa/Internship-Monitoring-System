import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { PrismaService } from '../prisma.service';
import { AuditService } from './audit.service';

@Module({
  controllers: [AuditController],
  providers: [PrismaService, AuditService],
  exports: [AuditService],
})
export class AuditModule {}