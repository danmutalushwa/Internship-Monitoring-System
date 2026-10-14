import {
  Controller,
  Get,
  Patch,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('notifications')
  async getNotifications(@Req() req) {
    return this.studentService.getNotifications(req.user.id);
  }

  @Patch('notifications/:id/read')
  async markNotificationAsRead(@Param('id') id: string, @Req() req) {
    return this.studentService.markAsRead(req.user.id, parseInt(id));
  }

  @Get('assignments')
  async getAssignmentHistory(@Req() req) {
    return this.studentService.getAssignmentHistory(req.user.id);
  }

  // New: Student profile for dashboard
  @Get('me')
  async getMe(@Req() req) {
    return this.studentService.getMe(req.user.id);
  }

  // New: Student reports for dashboard
  @Get('reports')
  async getReports(@Req() req) {
    return this.studentService.getReports(req.user.id);
  }
}