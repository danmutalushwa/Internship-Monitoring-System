import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class SupervisorService {
  constructor(private readonly prisma: PrismaService) {}

  async getAssignedStudents(supervisorId: number) {
    const students = await this.prisma.user.findMany({
      where: { assignedSupervisorId: supervisorId },
      select: {
        id: true,
        name: true,
        email: true,
        faculty: { select: { name: true } },
        internships: {
          orderBy: { startDate: 'desc' },
          take: 1,
          select: { company: true, status: true },
        },
      },
    });

    // Flatten latest internship into top-level fields
    return students.map((s) => {
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        facultyName: s.faculty?.name ?? 'N/A',
        internshipCompany: s.internships[0]?.company,
        internshipStatus: s.internships[0]?.status ?? 'N/A',
      };
    });
  }

  async getReviewableReports(supervisorId: number) {
    return this.prisma.report.findMany({
      where: {
        student: {
          assignedSupervisorId: supervisorId,
        },
        status: "PENDING",
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getFeedbackReports() {
    return this.prisma.report.findMany({
      where: {
        supervisorId: { not: null },
        feedback: { not: null },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        feedback: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getDashboardSummary() {
    const [studentCount, reportCount, feedbackCount] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: RoleType.STUDENT,
          assignedSupervisorId: { not: null },
        },
      }),
      this.prisma.report.count({
        where: {
          supervisorId: { not: null },
        },
      }),
      this.prisma.report.count({
        where: {
          supervisorId: { not: null },
          feedback: { not: null },
        },
      }),
    ]);

    return {
      totalAssignedStudents: studentCount,
      totalReports: reportCount,
      totalFeedbackReports: feedbackCount,
    };
  }
}