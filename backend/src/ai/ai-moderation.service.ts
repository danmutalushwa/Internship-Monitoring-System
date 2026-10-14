import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AiModerationService {
  private readonly MAX_LENGTH = 8000;

  // you can expand this list
  private readonly bannedPatterns = ['kill', 'suicide', 'bomb'];

  validateReportContent(content: string) {
    if (!content || !content.trim()) {
      throw new BadRequestException('Report content is empty.');
    }

    if (content.length > this.MAX_LENGTH) {
      throw new BadRequestException('Report content is too long for AI processing.');
    }

    const lower = content.toLowerCase();
    for (const pattern of this.bannedPatterns) {
      if (lower.includes(pattern)) {
        throw new BadRequestException(
          'Report content contains sensitive terms that cannot be processed by AI.',
        );
      }
    }
  }
}