import { Module } from '@nestjs/common';
import { LlamaService } from './llama.service';
import { AiLogService } from './ai-log.service';
import { AiCacheService } from './ai-cache.service';
import { AiModerationService } from './ai-moderation.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    PrismaService,
    LlamaService,
    AiLogService,
    AiCacheService,
    AiModerationService,
  ],
  exports: [LlamaService, AiLogService],
})
export class LlamaModule {}