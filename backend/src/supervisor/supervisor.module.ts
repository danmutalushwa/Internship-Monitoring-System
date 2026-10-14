import { Module } from '@nestjs/common';
import { SupervisorController } from './supervisor.controller';
import { SupervisorService } from './supervisor.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [SupervisorController],
  providers: [SupervisorService, PrismaService],
})
export class SupervisorModule {}