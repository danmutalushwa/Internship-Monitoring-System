import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoleType } from '@prisma/client';
import { AssignUserDto } from './dto/assign-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: RoleType;
    facultyId?: number;
  }) {
    return this.prisma.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: number) {
    console.log('findById called with:', id);
    if (!id) throw new BadRequestException('Invalid ID passed to findById');
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(userId: number, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { isDeleted: false },
      include: {
        faculty: { select: { name: true } },
        assignedLecturer: { select: { name: true } },
        assignedSupervisor: { select: { name: true } },
        assignedReviewer: { select: { name: true } },
      },
    });
  }

  async filterUsers(filters: { role?: RoleType; faculty?: string }) {
    return this.prisma.user.findMany({
      where: {
        isDeleted: false,
        ...(filters.role && { role: filters.role }),
        ...(filters.faculty &&
          !isNaN(Number(filters.faculty)) && {
            facultyId: Number(filters.faculty),
          }),
      },
      include: {
        faculty: { select: { name: true } },
        assignedLecturer: { select: { name: true } },
        assignedSupervisor: { select: { name: true } },
        assignedReviewer: { select: { name: true } },
      },
    });
  }

  async findAssignedStudents(supervisorId: number) {
    const students = await this.prisma.user.findMany({
      where: {
        assignedSupervisorId: supervisorId,
        role: RoleType.STUDENT,
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

  async findLecturerStudents(lecturerId: number) {
    const students = await this.prisma.user.findMany({
      where: {
        assignedLecturerId: lecturerId,
        role: RoleType.STUDENT,
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

  async getFacultyUsers(deanFacultyId: number) {
    return this.prisma.user.findMany({
      where: {
        facultyId: deanFacultyId,
        role: { in: [RoleType.STUDENT, RoleType.LECTURER] },
      },
      include: { faculty: { select: { name: true } } },
    });
  }

  async updateProfile(id: number, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        email: data.email?.toLowerCase(),
      },
    });
  }

  async getUserWithReports(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        studentReports: true,
        reviewedReports: true,
      },
    });
  }

  async assignStudent(studentId: number, dto: AssignUserDto, actor: any) {
    const student = await this.prisma.user.findUnique({ where: { id: studentId } });

    if (!student || student.role !== RoleType.STUDENT) {
      throw new BadRequestException('Target must be a student');
    }

    const updateData: any = {};

    if (dto.lecturerId) {
      const lecturer = await this.prisma.user.findUnique({ where: { id: dto.lecturerId } });
      if (!lecturer || lecturer.role !== RoleType.LECTURER) {
        throw new BadRequestException('Invalid lecturer');
      }
      if (lecturer.facultyId !== student.facultyId) {
        throw new BadRequestException('Lecturer must belong to the same faculty as the student');
      }
      updateData.assignedLecturerId = dto.lecturerId;
    }

    if (dto.supervisorId) {
      const supervisor = await this.prisma.user.findUnique({ where: { id: dto.supervisorId } });
      if (!supervisor || supervisor.role !== RoleType.SUPERVISOR) {
        throw new BadRequestException('Invalid supervisor');
      }
      updateData.assignedSupervisorId = dto.supervisorId;
    }

    if (dto.reviewerId) {
      const reviewer = await this.prisma.user.findUnique({ where: { id: dto.reviewerId } });
      if (
        !reviewer ||
        (reviewer.role !== RoleType.LECTURER && reviewer.role !== RoleType.SUPERVISOR)
      ) {
        throw new BadRequestException('Reviewer must be a lecturer or supervisor');
      }
      if (reviewer.role === RoleType.LECTURER && reviewer.facultyId !== student.facultyId) {
        throw new BadRequestException('Reviewer lecturer must belong to the same faculty as the student');
      }
      updateData.assignedReviewerId = dto.reviewerId;
    }

    await this.prisma.user.update({
      where: { id: studentId },
      data: updateData,
    });

    return { message: 'Assignment successful' };
  }

  async getAssignableUsers(facultyId?: number) {
    const whereClause = facultyId ? { facultyId } : {};

    const lecturers = await this.prisma.user.findMany({
      where: { role: RoleType.LECTURER, isDeleted: false, ...whereClause },
      select: { id: true, name: true, email: true, facultyId: true },
    });

    const supervisors = await this.prisma.user.findMany({
      where: { role: RoleType.SUPERVISOR, isDeleted: false },
      select: { id: true, name: true, email: true },
    });

    const reviewers = await this.prisma.user.findMany({
      where: {
        role: { in: [RoleType.LECTURER, RoleType.SUPERVISOR] },
        isDeleted: false,
        ...whereClause,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        facultyId: true,
      },
    });

    return { lecturers, supervisors, reviewers };
  }

  async updateUser(
    id: number,
    data: { name?: string; email?: string; role?: RoleType; facultyId?: number },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.role && { role: data.role }),
        ...(data.facultyId && { facultyId: data.facultyId }),
      },
    });
  }
    async deleteUser(id: number, actorId: number, actorEmail: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true, name: true, email: true },
    });

    if (!user) throw new Error('User not found');
    if (user.role === RoleType.ADMIN || user.role === RoleType.DEAN) {
      throw new Error('Cannot delete Admin or Dean accounts');
    }

    // Clear assignments if this user was assigned as lecturer/supervisor/reviewer
    await this.prisma.user.updateMany({
      where: {
        OR: [
          { assignedLecturerId: id },
          { assignedSupervisorId: id },
          { assignedReviewerId: id },
        ],
      },
      data: {
        assignedLecturerId: null,
        assignedSupervisorId: null,
        assignedReviewerId: null,
      },
    });

    // Soft delete the user
    await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Log the deletion in AuditLog
    await this.prisma.auditLog.create({
      data: {
        actor: actorId,
        target: actorEmail,
        action: 'DELETE_USER',
        entityType: 'USER',
        entityId: id,
      },
    });

    return { success: true };
  }
}
  