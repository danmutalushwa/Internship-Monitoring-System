import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class ReviewerService {
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

  async getAssignedStudents(reviewerId: number) {
    const students = await this.prisma.user.findMany({
      where: {
        assignedLecturerId: reviewerId,
        role: RoleType.STUDENT,
      },
      select: {
        id: true,
        name: true,
        faculty: { select: { name: true } },
        internships: {
          orderBy: { startDate: 'desc' },
          take: 1,
          select: { company: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Flatten latest internship into top-level fields
    return students.map((s) => {
      const latest = s.internships[0];
      return {
        id: s.id,
        name: s.name,
        faculty: s.faculty,
        internshipCompany: latest?.company ?? null,
        internshipStatus: latest?.status ?? null,
      };
    });
  }
}