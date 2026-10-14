import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class LecturerService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentsForLecturer(lecturerId: number) {
    const students = await this.prisma.user.findMany({
      where: { 
        role: RoleType.STUDENT,
        assignedLecturerId: lecturerId,
       },
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

    // Flatten latest internship into top-level fields for convenience
    return students.map((s) => {
      const latest = s.internships[0];
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        faculty: s.faculty,
        internshipCompany: latest?.company ?? null,
        internshipStatus: latest?.status ?? null,
      };
    });
  }

  async getReportsForFaculty(params: {
    facultyId: number;
    status?: string;
    search?: string;
    week?: string;
    page?: number;
  }) {
    const { facultyId, status, search, week, page } = params;
    const filters: any = { facultyId };

    if (status) filters.status = status;
    if (search)
      filters.student = {
        name: { contains: search, mode: 'insensitive' },
      };
    if (week) filters.title = { contains: `Week ${week}` };

    return this.prisma.report.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        feedback: true,
        student: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: ((page ?? 1) - 1) * 5,
      take: 5,
    });
  }

  async getFeedbackReportsForLecturer(params: {
    facultyId: number;
    status?: string;
    search?: string;
    week?: string;
    page?: number;
  }) {
    const { facultyId, status, search, week, page } = params;
    const filters: any = {
      facultyId,
      feedback: { not: null },
    };

    if (status) filters.status = status;
    if (search)
      filters.student = {
        name: { contains: search, mode: 'insensitive' },
      };
    if (week) filters.title = { contains: `Week ${week}` };

    return this.prisma.report.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        feedback: true,
        student: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: ((page ?? 1) - 1) * 5,
      take: 5,
    });
  }
}