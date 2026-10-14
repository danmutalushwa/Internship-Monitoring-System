import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Returns dashboard metrics for admin overview
   */
  @Get('metrics')
  async getMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  /**
   * Returns reviewer performance analytics
   */
  @Get('reviewers/performance')
  async getReviewerPerformance() {
    return this.adminService.getReviewerPerformance();
  }

  /**
   * Performs admin search across users, reports, reviewers
   */
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('type') type?: 'user' | 'report' | 'reviewer' | 'all'
  ) {
    return this.adminService.searchAdminData(query, type);
  }

  /**
   * Returns latest admin notifications (audit logs, system events)
   */
  @Get('notifications')
  async getNotifications() {
    return this.adminService.getAdminNotifications();
  }

  @Get('audit/:id')
  async getAuditLog(@Param('id') id: string) {
    return this.adminService.getAuditLogById(Number(id));
  }

  @Public()
  @Get('faculties')
  async getFaculties() {
    return this.adminService.getFaculties();
  }
}