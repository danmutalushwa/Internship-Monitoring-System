import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email.service';
import { LlamaService } from 'src/ai/llama.service';

interface ReportFilters {
  facultyId: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page: number;
}

@Injectable()
export class DeanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly llama: LlamaService,
  ) {}

  // 🔔 Escalated notifications (faculty-scoped)
  async getNotifications(facultyId: number) {
    try {
      const reports = await this.prisma.report.findMany({
        where: {
          escalated: true,
          student: { facultyId },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { student: true },
      });

      return reports.map((r) => ({
        id: r.id,
        message: `Escalated report from ${r.student?.name ?? 'Unknown'}`,
        type: 'escalation',
        createdAt: r.createdAt,
        link: `/dean/reports/${r.id}`,
      }));
    } catch {
      throw new BadRequestException('Failed to fetch notifications');
    }
  }

  // 📑 Reports (faculty-scoped)
  async getReports(filters: ReportFilters) {
    const pageSize = 10;

    const where: any = {
      student: { facultyId: filters.facultyId },
    };

    if (filters.status) where.status = filters.status;

    if (filters.search) {
      where.OR = [
        { student: { name: { contains: filters.search } } },
        { reviewer: { name: { contains: filters.search } } },
      ];
    }

    if (filters.startDate && filters.endDate) {
      where.updatedAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    try {
      return await this.prisma.report.findMany({
        where,
        include: {
          student: true,
          reviewer: true,
        },
        skip: (filters.page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      });
    } catch {
      throw new BadRequestException('Failed to fetch reports');
    }
  }

  // Bulk update reports
  async bulkUpdateReports(
    ids: number[],
    status: 'APPROVED' | 'REJECTED',
    facultyId: number,
  ) {
    if (!ids?.length) {
      throw new BadRequestException('No report IDs provided');
    }

    try {
      const result = await this.prisma.report.updateMany({
        where: {
          id: { in: ids },
          student: { facultyId },
        },
        data: { status },
      });

      return { updated: result.count };
    } catch {
      throw new BadRequestException('Failed to update reports');
    }
  }

  // Single report detail
  async getReportById(reportId: number, facultyId: number) {
    const report = await this.prisma.report.findFirst({
      where: {
        id: reportId,
        student: { facultyId },
      },
      include: {
        student: true,
        reviewer: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found or access denied');
    }

    return report;
  }

  // Report feedback history
  async getReportFeedback(reportId: number, facultyId: number) {
    const feedback = await this.prisma.feedback.findMany({
      where: {
        reportId,
        report: { student: { facultyId } },
      },
      include: {
        reviewer: true,
      },
      orderBy: { date: 'desc' },
    });

    return Array.from(new Map(feedback.map((f) => [f.id, f])).values());
  }

  // Submit feedback
  async submitFeedback(
    reportId: number,
    deanId: number,
    facultyId: number,
    feedback: string,
  ) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, student: { facultyId } },
    });

    if (!report) {
      throw new NotFoundException('Report not found or access denied');
    }

    return this.prisma.feedback.create({
      data: {
        reportId,
        reviewerId: deanId,
        feedback,
        status: report.status,
        date: new Date(),
      },
    });
  }

  // Update report status
  async updateReportStatus(
    reportId: number,
    status: 'APPROVED' | 'REJECTED',
    deanId: number,
    facultyId: number,
  ) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, student: { facultyId } },
    });

    if (!report) {
      throw new NotFoundException('Report not found or access denied');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return { success: true };
  }

  // Activity log placeholder
  async getReportActivity(reportId: number, facultyId: number) {
    return [];
  }

  // AI Summary (REAL, with AI infra)
  async summarizeReport(
    reportId: number,
    facultyId: number,
    userId: number,   // required
    token: string,
  ) {
    console.log("✅ summarizeReport HIT", { reportId, facultyId, userId });

    const report = await this.prisma.report.findFirst({
      where: { id: reportId, student: { facultyId } },
    });
    console.log("✅ REPORT FOUND:", report);
    if (!report) {
      
      throw new NotFoundException('Report not found or access denied');
    }

    const summary = await this.llama.summarize(
      report.content,
      reportId,
      userId,
    );
    console.log("✅ AI OUTPUT:", summary);

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { summary },
    })
     console.log("✅ UPDATED REPORT:", updated);
    return updated;
  }

  // AI Feedback Suggestion (REAL, with AI infra)
  async suggestFeedback(
    reportId: number,
    facultyId: number,
    userId: number,   
    token: string,
  ) {
    console.log("✅ suggestFeedback HIT", { reportId, facultyId, userId });
    console.log("✅ summarizeReport START");
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, student: { facultyId } },
    });
    console.log("✅ REPORT FOUND:", report);

    if (!report) {
      throw new NotFoundException('Report not found or access denied');
    }

    const feedback = await this.llama.suggestFeedback(
      report.content,
      reportId,
      userId,
    );
     console.log("✅ AI OUTPUT:", feedback);
     console.log("✅ suggestFeedback START");
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { feedback },
    })
    console.log("✅ UPDATED REPORT:", updated);
    console.log("✅ AI OUTPUT (feedback):", feedback, "length:", feedback?.length);
    return updated;
  }

  // AI logs for a report
  async getAiLogs(reportId: number, facultyId: number) {
    // ensure dean has access to this report
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, student: { facultyId } },
      select: { id: true },
    });

    if (!report) {
      throw new NotFoundException('Report not found or access denied');
    }

    return this.prisma.aiLog.findMany({
      where: { reportId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Assign students
  async bulkAssignStudents(
    reviewerId: number,
    studentIds: number[],
    facultyId: number,
  ) {
    if (!reviewerId || !studentIds?.length) {
      throw new BadRequestException('Missing required assignment data');
    }

    const reviewer = await this.prisma.user.findFirst({
      where: { id: reviewerId, role: 'LECTURER', facultyId },
    });

    if (!reviewer) {
      throw new BadRequestException('Reviewer does not belong to your faculty');
    }

    try {
      const students = await this.prisma.user.findMany({
        where: {
          id: { in: studentIds },
          role: 'STUDENT',
          facultyId,
        },
      });

      await this.prisma.user.updateMany({
        where: { id: { in: students.map((s) => s.id) } },
        data: { assignedLecturerId: reviewerId },
      });

      return {
        assigned: students.length,
      };
    } catch {
      throw new BadRequestException('Failed to assign students');
    }
  }

  // Students list
  async getStudents(facultyId: number, status?: string, search?: string) {
    try {
      return await this.prisma.user.findMany({
        where: {
          role: 'STUDENT',
          facultyId,

          ...(status === 'UNASSIGNED'
            ? { assignedLecturerId: null }
            : status === 'ASSIGNED'
            ? { assignedLecturerId: { not: null } }
            : {}),

          ...(search
            ? {
                name: {
                  contains: search,
                },
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          assignedLecturerId: true,
          assignedLecturer: { select: { name: true } },
        },
        orderBy: { name: 'asc' },
      });
    } catch {
      throw new BadRequestException('Failed to fetch students');
    }
  }

  // Lecturers list
  async getReviewers(facultyId: number) {
    try {
      return await this.prisma.user.findMany({
        where: {
          role: 'LECTURER',
          facultyId,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch {
      throw new BadRequestException('Failed to fetch lecturers');
    }
  }

  // Debug
  async debugStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        facultyId: true,
      },
    });
  }

  // Faculty Analytics (SQLite-safe + BigInt-safe)
  async getAnalytics(facultyId: number) {
    // Students
    const totalStudents = await this.prisma.user.count({
      where: { role: 'STUDENT', facultyId },
    });

    const assignedStudents = await this.prisma.user.count({
      where: {
        role: 'STUDENT',
        facultyId,
        assignedLecturerId: { not: null },
      },
    });

    const unassignedStudents = totalStudents - assignedStudents;

    // Reports
    const totalReports = await this.prisma.report.count({
      where: { student: { facultyId } },
    });

    // Convert BigInt → number
    const reportsByStatusRaw = await this.prisma.report.groupBy({
      by: ['status'],
      where: { student: { facultyId } },
      _count: { status: true },
    });

    const reportsByStatus = reportsByStatusRaw.map((s: any) => ({
      status: s.status,
      _count: { status: Number(s._count.status) },
    }));

    // Weekly submissions (SQLite-safe)
    const weeklyReportsRaw =
      await this.prisma.$queryRawUnsafe<{ week: string; count: bigint | number }[]>(
        `
      SELECT 
        strftime('%Y-%W', Report.createdAt) AS week,
        COUNT(*) AS count
      FROM Report
      INNER JOIN User ON User.id = Report.studentId
      WHERE User.facultyId = ${facultyId}
      GROUP BY week
      ORDER BY week DESC
      LIMIT 8;
    `,
      );

    const weekly = weeklyReportsRaw.map((row) => ({
      week: row.week,
      count: Number(row.count),
    }));

    return {
      students: {
        total: totalStudents,
        assigned: assignedStudents,
        unassigned: unassignedStudents,
      },
      reports: {
        total: totalReports,
        byStatus: reportsByStatus,
        weekly: weekly,
      },
    };
  }
}