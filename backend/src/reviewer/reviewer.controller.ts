import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewerService } from './reviewer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviewer')
@UseGuards(JwtAuthGuard)
export class ReviewerController {
  constructor(private readonly reviewerService: ReviewerService) {}

  @Get('notifications')
  async getNotifications(@Req() req) {
    return this.reviewerService.getNotifications(req.user.id);
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string, @Req() req) {
    return this.reviewerService.markAsRead(req.user.id, parseInt(id));
  }

  @Get('students')
  async getAssignedStudents(@Req() req) {
    return this.reviewerService.getAssignedStudents(req.user.id);
  }
}