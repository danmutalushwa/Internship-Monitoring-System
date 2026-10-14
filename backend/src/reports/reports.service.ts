import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
  // Note: Using Prisma enums/types that exist on your generated client
import { CreateReportDto, ReportDto } from './dto/report.dto';
import { RoleType, ReportStatus } from '@prisma/client';
import { Parser } from 'json2csv';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // Fetch reports based on user role and optional filters
  async findByUserRole(
    user: { id: number; role: RoleType; facultyId?: number },
    filters?: {
      faculty?: string;
      student?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ReportDto[]> {
    const where: any = {};

    // Role-based scoping
    switch (user.role) {
      case RoleType.STUDENT:
        where.studentId = user.id;
        break;
      case RoleType.SUPERVISOR:
        where.supervisorId = user.id;
        break;
      case RoleType.LECTURER:
        // Merge nested student filter with lecturer scope
        where.student = { assignedLecturerId: user.id };
        break;
      case RoleType.DEAN:
        where.facultyId = user.facultyId;
        break;
      case RoleType.ADMIN:
        // No additional scoping
        break;
      default:
        throw new ForbiddenException('Access denied');
    }

    // Dynamic filters
    if (filters?.faculty) where.facultyId = Number(filters.faculty);
    if (filters?.type) where.type = filters.type;
    if (filters?.student) {
      where.student = {
        ...where.student,
        name: { contains: filters.student },
      };
    }
    if (filters?.startDate && filters?.endDate) {
      where.createdAt = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
        
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map((r) => this.toDto(r));
  }

  // Export filtered reports as CSV
  async exportCSV(
    user: { id: number; role: RoleType; facultyId?: number },
    filters?: {
      faculty?: string;
      student?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<string> {
    const reports = await this.findByUserRole(user, filters);

    // Flatten nested fields for CSV
    const flatReports = reports.map((r) => ({
      title: r.title,
      studentName: r.student?.name ?? '',
      facultyId: r.facultyId ?? '',
      type: r.type,
      status: r.status,
      date: r.date,
    }));

    const fields = ['title', 'studentName', 'facultyId', 'type', 'status', 'date'];
    const parser = new Parser({ fields });
    return parser.parse(flatReports);
  }

  // Fetch a single report
  async findById(id: number): Promise<ReportDto> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
        
      },
    });

    if (!report) throw new NotFoundException(`Report with ID ${id} not found`);
    return this.toDto(report);
  }


  async createReport(studentId: number, dto: CreateReportDto): Promise<ReportDto> {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);

    const report = await this.prisma.report.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: ReportStatus.PENDING,
        fileUrl: dto.fileUrl ?? null,
        facultyId: student.facultyId ?? null,
        type: 'internship',
        studentId,
        
      },
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
        
      },
    });

    return this.toDto(report);
  }

  
  async updateStatus(
    id: number,
    reviewerId: number,
    status: ReportStatus,
    feedback: string,
  ): Promise<ReportDto> {
    const report = await this.prisma.report.update({
      where: { id },
      data: {
        status,
        feedback,
        reviewedBy: reviewerId,
      },
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });

    return this.toDto(report);
  }

  private toDto(report: any): ReportDto {
    return {
      id: report.id,
      title: report.title,
      status: report.status,
      date: report.createdAt.toISOString().split('T')[0],
      content: report.content,
      feedback: report.feedback || '',
      student: report.student
        ? { id: report.student.id, name: report.student.name }
        : undefined,
      reviewer: report.reviewer
        ? { id: report.reviewer.id, name: report.reviewer.name }
        : undefined,
      facultyId: report.facultyId ?? undefined,
      type: report.type ?? '',
      url: report.fileUrl ?? '',
    };
  }
}