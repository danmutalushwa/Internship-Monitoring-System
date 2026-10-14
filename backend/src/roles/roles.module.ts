import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaService } from '../prisma.service';
import { AuditModule } from '../audit/audit.module';
import { AuditService } from 'src/audit/audit.service';

@Module({
  imports: [AuditModule],
  controllers: [RolesController],
  providers: [RolesService, PrismaService, AuditService],
  exports: [RolesService],
})
export class RolesModule {}

