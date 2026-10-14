import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => ({
      id: n.id,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt,
      link: n.link,
      isRead: n.isRead,
    }));
  }

  async markAsRead(userId: number, notificationId: number) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) return { success: false, message: 'Notification not found' };

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return { success: true };
  }

  async getAssignmentHistory(studentId: number) {
    return this.prisma.assignmentLog.findMany({
      where: { studentId },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Student profile + counters for dashboard
  async getMe(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
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

    const latestInternship = student?.internships[0];

    // Counters
    const totalReports = await this.prisma.report.count({ where: { studentId } });
    const approved = await this.prisma.report.count({ where: { studentId, status: 'APPROVED' } });
    const pending = await this.prisma.report.count({ where: { studentId, status: 'PENDING' } });
    const rejected = await this.prisma.report.count({ where: { studentId, status: 'REJECTED' } });

    return {
      id: student?.id,
      name: student?.name,
      email: student?.email,
      faculty: student?.faculty,
      internshipCompany: latestInternship?.company ?? null,
      internshipStatus: latestInternship?.status ?? null,
      submitted: totalReports,
      approved,
      pending,
      rejected,
    };
  }

  // Student reports for dashboard
  async getReports(studentId: number) {
    return this.prisma.report.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });
  }
}