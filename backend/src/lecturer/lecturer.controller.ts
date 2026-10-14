import { Controller, Get, Query, UseGuards, ValidationPipe, Req } from '@nestjs/common';
import { LecturerService } from './lecturer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetStudentsDto } from './dto/get-students.dto';
import { GetReportsDto } from './dto/get-reports.dto';
import { GetFeedbackDto } from './dto/get-feedback.dto';

@Controller('lecturer')
@UseGuards(JwtAuthGuard)
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Get('students')
  async getStudents( @Req() req) {
    return this.lecturerService.getStudentsForLecturer(req.user.id);
  }

  @Get('reports')
  async getReports(
    @Query(new ValidationPipe({ transform: true })) query: GetReportsDto,
  ) {
    return this.lecturerService.getReportsForFaculty({
      facultyId: query.facultyId,
      status: query.status,
      search: query.search,
      week: query.week,
      page: query.page ?? 1,
    });
  }

  @Get('feedback')
  async getFeedback(
    @Query(new ValidationPipe({ transform: true })) query: GetFeedbackDto,
  ) {
    return this.lecturerService.getFeedbackReportsForLecturer({
      facultyId: query.facultyId,
      status: query.status,
      search: query.search,
      week: query.week,
      page: query.page ?? 1,
    });
  }
}