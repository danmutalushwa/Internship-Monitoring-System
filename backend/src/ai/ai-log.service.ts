import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export type AiLogType = 'SUMMARY' | 'FEEDBACK' | 'OTHER';

@Injectable()
export class AiLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(params: {
    type: AiLogType;
    model: string;
    prompt: string;
    response: string;
    userId: number;   
    reportId: number; 
  }) {
    return this.prisma.aiLog.create({
      data: {
        type: params.type,
        model: params.model,
        prompt: params.prompt,
        response: params.response,
        userId: params.userId,
        reportId: params.reportId,
      },
    });
  }

  async getLogsForReport(reportId: number) {
    return this.prisma.aiLog.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLogsForUser(userId: number) {
    return this.prisma.aiLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}