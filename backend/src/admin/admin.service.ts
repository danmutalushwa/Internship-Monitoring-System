import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType, ReportStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Dashboard Metrics (fixed soft deletes)
  async getDashboardMetrics() {
    const [totalUsers, activeReviewers, faculties, settings] = await Promise.all([
      // Count only active (non-deleted) users
      this.prisma.user.count({
        where: { isDeleted: false },
      }),

      // Count only active reviewers who have reviewed something
      this.prisma.user.count({
        where: {
          isDeleted: false,
          role: { in: [RoleType.SUPERVISOR, RoleType.LECTURER] },
          reviewedReports: { some: {} },
        },
      }),

      // Count faculties that have at least one active user
      this.prisma.faculty.count({
        where: {
          users: {
            some: { isDeleted: false },
          },
        },
      }),

      this.prisma.settings.findFirst(),
    ]);

    const pendingConfigs =
      !settings?.reviewDeadline || !settings?.facultyMappings ? 1 : 0;

    return {
      totalUsers,
      activeReviewers,
      faculties,
      pendingConfigs,
    };
  }

  //  Reviewer Performance (unchanged except soft-delete safety)
  async getReviewerPerformance() {
    const [reviewers, settings] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          isDeleted: false,
          role: { in: [RoleType.SUPERVISOR, RoleType.LECTURER] },
        },
        include: {
          reviewedReports: {
            select: {
              status: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          faculty: true,
        },
      }),
      this.prisma.settings.findFirst(),
    ]);

    const deadline = settings?.reviewDeadline
      ? new Date(settings.reviewDeadline)
      : null;

    return reviewers.map((r) => {
      const reviews = r.reviewedReports;
      const total = reviews.length;

      const approved = reviews.filter((rev) => rev.status === ReportStatus.APPROVED).length;
      const rejected = reviews.filter((rev) => rev.status === ReportStatus.REJECTED).length;
      const pending = reviews.filter((rev) => rev.status === ReportStatus.PENDING).length;

      const durations = reviews
        .filter((rev) => rev.status !== ReportStatus.PENDING)
        .map(
          (rev) =>
            new Date(rev.updatedAt).getTime() -
            new Date(rev.createdAt).getTime(),
        );

      const avgReviewTime = durations.length
        ? Math.round(
            durations.reduce((a, b) => a + b, 0) /
              durations.length /
              (1000 * 60 * 60 * 24),
          )
        : null;

      const overdue =
        deadline &&
        reviews.some(
          (rev) =>
            rev.status === ReportStatus.PENDING &&
            new Date(rev.createdAt) < deadline,
        );

      return {
        name: r.name,
        role: r.role,
        faculty: r.faculty?.name ?? 'Unassigned',
        total,
        approved,
        rejected,
        pending,
        avgReviewTime,
        overdue,
      };
    });
  }

  // Search (fixed soft deletes)
  async searchAdminData(query: string, type?: string) {
    const q = query.toLowerCase();

    const [users, reports, reviewers] = await Promise.all([
      type === 'user' || type === 'all' || !type
        ? this.prisma.user.findMany({
            where: {
              isDeleted: false, // FIXED
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { role: q.toUpperCase() as RoleType },
              ],
            },
          })
        : [],

      type === 'report' || type === 'all' || !type
        ? this.prisma.report.findMany({
            where: {
              OR: [
                {
                  student: {
                    name: { contains: q },
                  },
                },
                {
                  reviewer: {
                    name: { contains: q },
                  },
                },
              ],
            },
            include: {
              student: true,
            },
          })
        : [],

      type === 'reviewer' || type === 'all' || !type
        ? this.prisma.user.findMany({
            where: {
              isDeleted: false, 
              role: { in: [RoleType.SUPERVISOR, RoleType.LECTURER] },
              name: { contains: q },
            },
          })
        : [],
    ]);

    return [
      ...users.map((u) => ({
        type: 'user',
        label: `${u.name} (${u.role})`,
        link: `/admin/users/${u.id}`,
      })),

      ...reports.map((r) => ({
        type: 'report',
        label: `${r.student?.name ?? 'Unknown'} - ${r.status}`,
        link: `/admin/reports/${r.id}`,
      })),

      ...reviewers.map((r) => ({
        type: 'reviewer',
        label: `${r.name} (${r.role})`,
        link: `/admin/reviewers`,
      })),
    ];
  }

  // Notifications 
  async getAdminNotifications() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return logs.map((log) => ({
      id: `${log.id}-${log.createdAt.getTime()}`,
      message: `${log.actor} performed ${log.action}`,
      type: 'audit',
      createdAt: log.createdAt,
      link: `/admin/audit/${log.id}`,
    }));
  }

  async getAuditLogById(id: number) {
  return this.prisma.auditLog.findUnique({
    where: { id },
  });
 }
  async getFaculties() {
    return this.prisma.faculty.findMany({
      orderBy: { name: 'asc' },
    });
  }
}