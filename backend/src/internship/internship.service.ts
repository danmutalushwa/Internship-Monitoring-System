import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType, InternshipStatus } from '@prisma/client';

@Injectable()
export class InternshipService {
  constructor(private readonly prisma: PrismaService) {}

  async findByStudentId(studentId: number) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);
    if (student.role !== RoleType.STUDENT)
      throw new ForbiddenException('Only students can view internships');

    return this.prisma.internship.findMany({
      where: { studentId },
      orderBy: { startDate: 'desc' },
    });
  }

  async createInternship(studentId: number, dto: any) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException(`Student with ID ${studentId} not found`);
    if (student.role !== RoleType.STUDENT)
      throw new ForbiddenException('Only students can create internships');

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO format: YYYY-MM-DD');
    }

    // Validate status against enum
    if (!Object.values(InternshipStatus).includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${Object.values(InternshipStatus).join(', ')}`
      );
    }

    try {
      return await this.prisma.internship.create({
        data: {
          company: dto.company,
          department: dto.department,
          startDate,
          endDate,
          supervisor: dto.supervisor,
          status: dto.status, // enum value
          studentId,
        },
      });
    } catch (err) {
      console.error('Internship creation failed:', err);
      throw new BadRequestException('Failed to create internship');
    }
  }

  async updateInternship(studentId: number, internshipId: number, dto: any) {
    const internship = await this.prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship) throw new NotFoundException(`Internship with ID ${internshipId} not found`);
    if (internship.studentId !== studentId)
      throw new ForbiddenException('You can only update your own internships');

    // Validate dates if provided
    let startDate = internship.startDate;
    let endDate = internship.endDate;
    if (dto.startDate) {
      const parsed = new Date(dto.startDate);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid startDate format. Use ISO format: YYYY-MM-DD');
      }
      startDate = parsed;
    }
    if (dto.endDate) {
      const parsed = new Date(dto.endDate);
      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('Invalid endDate format. Use ISO format: YYYY-MM-DD');
      }
      endDate = parsed;
    }

    // Validate status if provided
    let status = internship.status;
    if (dto.status) {
      if (!Object.values(InternshipStatus).includes(dto.status)) {
        throw new BadRequestException(
          `Invalid status. Must be one of: ${Object.values(InternshipStatus).join(', ')}`
        );
      }
      status = dto.status;
    }

    return this.prisma.internship.update({
      where: { id: internshipId },
      data: {
        company: dto.company ?? internship.company,
        department: dto.department ?? internship.department,
        startDate,
        endDate,
        supervisor: dto.supervisor ?? internship.supervisor,
        status,
      },
    });
  }

  async deleteInternship(studentId: number, internshipId: number) {
    const internship = await this.prisma.internship.findUnique({ where: { id: internshipId } });
    if (!internship) throw new NotFoundException(`Internship with ID ${internshipId} not found`);
    if (internship.studentId !== studentId)
      throw new ForbiddenException('You can only delete your own internships');

    await this.prisma.internship.delete({ where: { id: internshipId } });
    return { success: true };
  }

  // 🔎 New: find reports for validation
  async findReportsByStudentAndInternship(studentId: number, internshipId: number) {
    return this.prisma.report.findMany({
      where: { studentId, internshipId }, 
    });
  }

  // 🔎 New: update internship status with validation
  async updateStatus(internshipId: number, status: InternshipStatus) {
    return this.prisma.internship.update({
      where: { id: internshipId },
      data: { status },
    });
  }
}