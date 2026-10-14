import { Injectable, BadRequestException } from '@nestjs/common';
import { AiLogService } from './ai-log.service';
import { AiCacheService } from './ai-cache.service';
import { AiModerationService } from './ai-moderation.service';

type AiActionType = 'SUMMARY' | 'FEEDBACK';

@Injectable()
export class LlamaService {
  private readonly OLLAMA_URL = 'http://localhost:11434/api/generate';
  private readonly MODEL = 'llama2';

  // simple in-memory rate limiting: (userId + type) -> timestamps
  private recentCalls: Map<string, number[]> = new Map();
  private readonly WINDOW_MS = 60_000; // 1 minute
  private readonly MAX_CALLS_PER_WINDOW = 5;

  constructor(
    private readonly aiLog: AiLogService,
    private readonly aiCache: AiCacheService,
    private readonly moderation: AiModerationService,
  ) {}

  private rateLimit(key: string) {
    const now = Date.now();
    const windowStart = now - this.WINDOW_MS;

    const timestamps = (this.recentCalls.get(key) || []).filter(
      (t) => t >= windowStart,
    );

    if (timestamps.length >= this.MAX_CALLS_PER_WINDOW) {
      throw new BadRequestException(
        'Too many AI requests. Please wait a moment before trying again.',
      );
    }

    timestamps.push(now);
    this.recentCalls.set(key, timestamps);
  }

  // ✅ Flatten table content into natural sentences
  private flattenLogbook(content: string): string {
    const sentences = content
      .split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const cells = line.split('|').map(c => c.trim());
        if (cells.length >= 5) {
          return `${cells[0]} in ${cells[1]}: ${cells[2]} (Outcome: ${cells[3]}).`;
        }
        return '';
      })
      .filter(Boolean);

    return sentences.length > 0
      ? sentences.join(' ')
      : 'No structured logbook data found.';
  }

  // ✅ core low-level call to Ollama (non-streaming, with timeout)
  private async callOllama(prompt: string): Promise<string> {
    console.log('✅ Calling Ollama with prompt:', prompt.slice(0, 200));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(this.OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.MODEL,
          prompt,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log('✅ Ollama response status:', response.status);

      if (!response.ok) {
        throw new BadRequestException(`AI model error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Ollama raw response:', JSON.stringify(data, null, 2));

      if (!data.response || !data.response.trim()) {
        console.warn('⚠️ Ollama returned empty response');
        return '';
      }

      return data.response.trim();
    } catch (err) {
      console.error('❌ Ollama call failed:', err);
      return '';
    }
  }

  private buildPrompt(type: AiActionType, content: string): string {
    if (type === 'SUMMARY') {
      const plain = this.flattenLogbook(content).slice(0, 800);
      return `Summarize the following internship activities into 5 concise bullet points:\n\n${plain}`;
    }
    return '';
  }

  // high-level entrypoint with cache, logs, moderation, and rate limit
  async runAiOnReport(params: {
    type: AiActionType;
    reportId: number;
    userId: number;
    content: string;
  }): Promise<string> {
    try {
      this.moderation.validateReportContent(params.content);

      const rateKey = `${params.userId}:${params.type}`;
      this.rateLimit(rateKey);

      const cached = await this.aiCache.getCached({
        type: params.type,
        model: this.MODEL,
        reportId: params.reportId,
      });
      if (cached) return cached;

      const prompt = this.buildPrompt(params.type, params.content);
      const responseText = await this.callOllama(prompt);
      console.log('✅ AI OUTPUT (raw):', responseText);

      const finalText =
        responseText && responseText.trim().length > 0
          ? responseText.trim()
          : 'AI did not generate a response for this report.';

      await this.aiCache.setCache({
        type: params.type,
        model: this.MODEL,
        reportId: params.reportId,
        content: finalText,
      });

      await this.aiLog.createLog({
        type: params.type,
        model: this.MODEL,
        prompt,
        response: finalText,
        userId: params.userId,
        reportId: params.reportId,
      });

      return finalText;
    } catch (err) {
      console.error('❌ runAiOnReport failed:', err);
      return 'AI service encountered an error. Please review manually.';
    }
  }

  async summarize(content: string, reportId: number, userId: number) {
    return this.runAiOnReport({
      type: 'SUMMARY',
      reportId,
      userId,
      content,
    });
  }

  // ✅ Summarization-first feedback with fallback + try/catch
  async suggestFeedback(content: string, reportId: number, userId: number) {
    try {
      // Step 1: Summarize the report
      const summaryPrompt = this.buildPrompt('SUMMARY', content);
      let summary = await this.callOllama(summaryPrompt);

      // Step 2: Fallback if summarization fails
      if (!summary || summary.trim().length === 0) {
        console.warn("⚠️ Summarization failed, falling back to flattened content");
        summary = this.flattenLogbook(content).slice(0, 800);
      }

      // Step 3: Generate feedback from summary (or fallback content)
      const feedbackPrompt = `You are a lecturer reviewing the following summary of a student's internship logbook.
Provide 3 constructive and actionable feedback points that help the student improve:\n\n${summary}`;

      const feedback = await this.callOllama(feedbackPrompt);

      const finalText =
        feedback && feedback.trim().length > 0
          ? feedback.trim()
          : 'No AI feedback generated. Please review the student report manually.';

      // Step 4: Cache + log
      await this.aiCache.setCache({
        type: 'FEEDBACK',
        model: this.MODEL,
        reportId,
        content: finalText,
      });

      await this.aiLog.createLog({
        type: 'FEEDBACK',
        model: this.MODEL,
        prompt: feedbackPrompt,
        response: finalText,
        userId,
        reportId,
      });

      return finalText;
    } catch (err) {
      console.error('❌ suggestFeedback failed:', err);
      return 'AI feedback service encountered an error. Please review manually.';
    }
  }
}