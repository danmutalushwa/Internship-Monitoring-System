import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type AiCacheType = 'SUMMARY' | 'FEEDBACK';

@Injectable()
export class AiCacheService {
  private readonly TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

  constructor(private readonly prisma: PrismaService) {}

  async getCached(params: {
    type: AiCacheType;
    model: string;
    reportId: number;
  }) {
    const entry = await this.prisma.aiCache.findUnique({
      where: {
        type_model_reportId: {
          type: params.type,
          model: params.model,
          reportId: params.reportId,
        },
      },
    });

    if (!entry) return null;

    const age = Date.now() - entry.createdAt.getTime();
    if (age > this.TTL_MS) return null;

    return entry.content;
  }

  async setCache(params: {
    type: AiCacheType;
    model: string;
    reportId: number;
    content: string;
  }) {
    return this.prisma.aiCache.upsert({
      where: {
        type_model_reportId: {
          type: params.type,
          model: params.model,
          reportId: params.reportId,
        },
      },
      update: { content: params.content, createdAt: new Date() },
      create: {
        type: params.type,
        model: params.model,
        reportId: params.reportId,
        content: params.content,
      },
    });
  }
}