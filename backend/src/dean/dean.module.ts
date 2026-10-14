import { Module } from '@nestjs/common';
import { DeanController } from './dean.controller';
import { DeanService } from './dean.service';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email.service'; 
import { LlamaModule } from 'src/ai/llama.module';

@Module({
  imports: [LlamaModule],
  controllers: [DeanController],
  providers: [
    DeanService,
    PrismaService,
    EmailService,

  ],
})
export class DeanModule {}