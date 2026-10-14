import { Module } from '@nestjs/common';
import { InternshipController } from './internship.controller';
import { InternshipService } from './internship.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [InternshipController],
  providers: [InternshipService, PrismaService], 
  exports: [InternshipService], 
})
export class InternshipModule {}