import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { InternshipService } from './internship.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InternshipStatus } from '@prisma/client';

@Controller('internships') 
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  @Get('student')
  @Roles('STUDENT')
  async getStudentInternships(@Req() req: any) {
    const studentId = parseInt(req.user.id, 10);
    return this.internshipService.findByStudentId(studentId);
  }

  @Post()
  @Roles('STUDENT')
  async createInternship(@Req() req: any, @Body() body: any) {
    const studentId = parseInt(req.user.id, 10);
    return this.internshipService.createInternship(studentId, body);
  }

  @Patch(':id')
  @Roles('STUDENT')
  async updateInternship(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const studentId = parseInt(req.user.id, 10);
    return this.internshipService.updateInternship(
      studentId,
      parseInt(id, 10),
      body,
    );
  }

  @Delete(':id')
  @Roles('STUDENT')
  async deleteInternship(@Req() req: any, @Param('id') id: string) {
    const studentId = parseInt(req.user.id, 10);
    return this.internshipService.deleteInternship(studentId, parseInt(id, 10));
  }


  @Patch(':id/status')
  @Roles('STUDENT')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: InternshipStatus,
  ) {
    const studentId = parseInt(req.user.id, 10);

    if (status === InternshipStatus.COMPLETED) {
      const reports =
        await this.internshipService.findReportsByStudentAndInternship(
          studentId,
          parseInt(id, 10),
        );

      const submittedCount = reports.length;
      const approvedCount = reports.filter(
        (r) => r.status === 'APPROVED', 
      ).length;

      if (submittedCount < 8 || approvedCount < 8) {
        throw new ForbiddenException(
          'You must submit and have 8 reports approved before marking internship as COMPLETED',
        );
      }
    }

    if (
      status === InternshipStatus.ONGOING ||
      status === InternshipStatus.COMPLETED
    ) {
      return this.internshipService.updateStatus(parseInt(id, 10), status);
    }

    throw new ForbiddenException('Invalid status update');
  }
}