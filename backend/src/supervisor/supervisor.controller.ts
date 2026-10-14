import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SupervisorService } from './supervisor.service';

@Controller('supervisor')
@UseGuards(JwtAuthGuard)
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get('students')
  async getAssignedStudents(@Req() req) {
    
    return this.supervisorService.getAssignedStudents(req.user.id);
  }
  @Get('reports')
  async getReviewableReports(@Req() req) {
    return this.supervisorService.getReviewableReports(req.user.id);
  }

  @Get('feedback')
  async getFeedbackReports() {
    return this.supervisorService.getFeedbackReports();
  }

  @Get('dashboard')
  async getDashboardSummary() {
    return this.supervisorService.getDashboardSummary();
  }
}