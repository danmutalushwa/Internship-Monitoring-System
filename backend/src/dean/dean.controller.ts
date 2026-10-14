import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { DeanService } from './dean.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dean')
@UseGuards(JwtAuthGuard)
export class DeanController {
  constructor(private readonly deanService: DeanService) {}

  @Get('notifications')
  async getNotifications(@Req() req) {
    const facultyId = req.user.facultyId;
    return this.deanService.getNotifications(facultyId);
  }

  @Get('reports')
  async getReports(
    @Req() req,
    @Query('status') status: string,
    @Query('search') search: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('page') page: string,
  ) {
    const facultyId = req.user.facultyId;

    return this.deanService.getReports({
      facultyId,
      status,
      search,
      startDate,
      endDate,
      page: parseInt(page || '1', 10),
    });
  }

  @Post('reports/bulk-update')
  async bulkUpdateReports(
    @Req() req,
    @Body() body: { ids: number[]; status: 'APPROVED' | 'REJECTED' },
  ) {
    const facultyId = req.user.facultyId;
    return this.deanService.bulkUpdateReports(body.ids, body.status, facultyId);
  }

  @Get('reports/:id')
  async getReportById(@Req() req, @Param('id') id: string) {
    const facultyId = req.user.facultyId;
    return this.deanService.getReportById(Number(id), facultyId);
  }

  @Get('reports/:id/feedback')
  async getReportFeedback(@Req() req, @Param('id') id: string) {
    const facultyId = req.user.facultyId;
    return this.deanService.getReportFeedback(Number(id), facultyId);
  }

  @Post('reports/:id/feedback')
  async submitFeedback(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { feedback: string },
  ) {
    const facultyId = req.user.facultyId;
    const deanId = req.user.id;

    return this.deanService.submitFeedback(
      Number(id),
      deanId,
      facultyId,
      body.feedback,
    );
  }

  @Post('reports/:id/status')
  async updateReportStatus(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED' },
  ) {
    const facultyId = req.user.facultyId;
    const deanId = req.user.id;

    return this.deanService.updateReportStatus(
      Number(id),
      body.status,
      deanId,
      facultyId,
    );
  }

  @Get('reports/:id/activity')
  async getReportActivity(@Req() req, @Param('id') id: string) {
    const facultyId = req.user.facultyId;
    return this.deanService.getReportActivity(Number(id), facultyId);
  }

  // ✅ AI Summary (Next.js internal-api sends userId + token)
  @Post('reports/:id/summarize')
  async summarizeReport(
    @Param('id') id: string,
    @Body() body: { userId: number },
    @Req() req,
  ) {
    const token = req.headers['authorization'];

    return this.deanService.summarizeReport(
      Number(id),
      req.user.facultyId,
      body.userId,
      token,
    );
  }

  // ✅ AI Feedback Suggestion (Next.js internal-api sends userId + token)
  @Post('reports/:id/suggest-feedback')
  async suggestFeedback(
    @Param('id') id: string,
    @Body() body: { userId: number },
    @Req() req,
  ) {
    const token = req.headers['authorization'];

    return this.deanService.suggestFeedback(
      Number(id),
      req.user.facultyId,
      body.userId,
      token,
    );
  }

  @Get('reports/:id/ai-logs')
  async getAiLogs(@Param('id') id: string, @Req() req) {
    return this.deanService.getAiLogs(Number(id), req.user.facultyId);
  }

  @Post('students/bulk-assign')
  async bulkAssignStudents(
    @Req() req,
    @Body() body: { reviewerId: number; studentIds: number[] },
  ) {
    const facultyId = req.user.facultyId;

    return this.deanService.bulkAssignStudents(
      body.reviewerId,
      body.studentIds,
      facultyId,
    );
  }

  @Get('students')
  async getStudents(
    @Req() req,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const facultyId = req.user.facultyId;
    return this.deanService.getStudents(facultyId, status, search);
  }

  @Get('reviewers')
  async getReviewers(@Req() req) {
    const facultyId = req.user.facultyId;
    return this.deanService.getReviewers(facultyId);
  }

  @Get('analytics')
  async getAnalytics(@Req() req) {
    const facultyId = req.user.facultyId;
    return this.deanService.getAnalytics(facultyId);
  }

  @Get('debug-students')
  debug() {
    return this.deanService.debugStudents();
  }
}