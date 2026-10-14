import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType, ReportStatus } from '@prisma/client'; // ✅ Import enums from Prisma

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch feedback for all reports submitted by a student
  async findByStudentReports(studentId: number) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);

    const reports = await this.prisma.report.findMany({
      where: { studentId },
      select: { id: true },
    });

    const reportIds = reports.map((r) => r.id);

    return this.prisma.feedback.findMany({
      where: { reportId: { in: reportIds } },
      include: {
        report: { select: { title: true } },
        reviewer: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // Create feedback for a report — restricted to reviewers
  async createFeedback(
    reportId: number,
    reviewerId: number,
    data: {
      feedback: string;
      status: ReportStatus; // ✅ Use Prisma enum
      date?: string;        // ✅ Accept date as string from DTO
    }
  ) {
    const reviewer = await this.prisma.user.findUnique({ where: { id: reviewerId } });
    if (!reviewer) throw new NotFoundException(`Reviewer with ID ${reviewerId} not found`);
    if (reviewer.role !== RoleType.REVIEWER) throw new ForbiddenException('Only reviewers can submit feedback');

    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException(`Report with ID ${reportId} not found`);

    return this.prisma.feedback.create({
      data: {
        feedback: data.feedback,
        status: data.status,
        date: data.date ? new Date(data.date) : new Date(), // ✅ Convert string to Date
        reportId,
        reviewerId,
      },
    });
  }
}