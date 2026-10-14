import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateFeedbackDto } from './dto/feedback.dto';

@Controller('api/feedback')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('student')
  async getStudentFeedback(@Req() req) {
    const studentId = req.user.id;
    return this.feedbackService.findByStudentReports(studentId);
  }

  @Post()
  @Roles('REVIEWER') // ✅ restrict to reviewers only
  async createFeedback(@Req() req, @Body() dto: CreateFeedbackDto) {
    const reviewerId = req.user.id;
    return this.feedbackService.createFeedback(dto.reportId, reviewerId, dto);
  }
}