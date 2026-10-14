import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RoleType, InternshipStatus } from '@prisma/client';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    const [totalStudents, totalSupervisors, totalReports, completedInternships] =
      await Promise.all([
        this.prisma.user.count({ where: { role: RoleType.STUDENT } }),
        this.prisma.user.count({ where: { role: RoleType.SUPERVISOR } }),
        this.prisma.report.count(),
        // Use relation filter instead of scalar field
        this.prisma.user.count({
          where: {
            internships: {
              some: { status: InternshipStatus.COMPLETED },
            },
          },
        }),
      ]);

    return {
      totalStudents,
      totalSupervisors,
      totalReports,
      completedInternships,
    };
  }

  @Get('trends')
  async getTrends() {
    const rawTrends = await this.prisma.$queryRaw<
      { month: string; count: number }[]
    >`
      SELECT strftime('%m', createdAt) AS month, COUNT(*) AS count
      FROM Report
      GROUP BY month
      ORDER BY month ASC
    `;

    const monthMap: Record<string, string> = {
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Aug',
      '09': 'Sep',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dec',
    };

    return rawTrends.map((r) => ({
      month: monthMap[r.month] || r.month,
      count: Number(r.count),
    }));
  }

  @Get('recent')
  async getRecent() {
    const recent = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { student: true },
    });

    return recent.map((r) => ({
      student: r.student.name,
      reportTitle: r.title,
      date: r.createdAt.toISOString().split('T')[0],
    }));
  }
}