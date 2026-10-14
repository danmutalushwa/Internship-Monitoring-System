import { Module } from '@nestjs/common';
import { LecturerController } from './lecturer.controller';
import { LecturerService } from './lecturer.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LecturerController],
  providers: [LecturerService, PrismaService],
})
export class LecturerModule {}