import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
  BadRequestException,
  Query,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from '@prisma/client';
import { AssignUserDto } from './dto/assign-user.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  // Admin can create any user
  @Post()
  @Roles(RoleType.ADMIN)
  async createUser(
    @Body() body: {
      name: string;
      email: string;
      password: string;
      role?: RoleType;
    },
  ) {
    return this.usersService.createUser(body);
  }

  // Admin and Dean can view all users
  @Get('all')
  @Roles(RoleType.ADMIN, RoleType.DEAN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // Admin and Dean: filter users by role and facultyId
  @Get()
  @Roles(RoleType.ADMIN, RoleType.DEAN)
  async filterUsers(
    @Query('role') role?: RoleType,
    @Query('faculty') faculty?: string,
  ) {
    return this.usersService.filterUsers({ role, faculty });
  }

  // Supervisor: view assigned students
  @Get('assigned')
  @Roles(RoleType.SUPERVISOR)
  async getAssignedStudents(@Req() req) {
    const supervisorId: number = req.user.id;
    return this.usersService.findAssignedStudents(supervisorId);
  }

  // Lecturer: view assigned students
  @Get('lecturer-students')
  @Roles(RoleType.LECTURER)
  async getLecturerStudents(@Req() req) {
    const lecturerId: number = req.user.id;
    return this.usersService.findLecturerStudents(lecturerId);
  }

  // Dean: view students and lecturers in their faculty
  @Get('faculty-overview')
  @Roles(RoleType.DEAN)
  async getFacultyOverview(@Req() req) {
    const deanFacultyId: number = req.user.facultyId;
    return this.usersService.getFacultyUsers(deanFacultyId);
  }

  // Admin and Dean: fetch assignable users by role and faculty
  @Get('roles')
  @Roles(RoleType.ADMIN, RoleType.DEAN)
  async getAssignableUsers(@Query('facultyId') facultyId?: string) {
    return this.usersService.getAssignableUsers(
      facultyId ? Number(facultyId) : undefined,
    );
  }

  // Student: update own profile
  @Patch('profile/:id')
  @Roles(RoleType.STUDENT)
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; email?: string },
    @Req() req,
  ) {
    if (req.user.id !== id) {
      throw new BadRequestException('Unauthorized profile update attempt');
    }
    return this.usersService.updateProfile(id, body);
  }

  // Student: change password
  @Patch(':id/password')
  @Roles(RoleType.STUDENT)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req,
  ) {
    if (req.user.id !== id) {
      throw new BadRequestException('Unauthorized password change attempt');
    }

    const user = await this.usersService.findById(id);
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await bcrypt.compare(body.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(body.newPassword, 10);
    return this.usersService.updatePassword(id, hashed);
  }

  // Admin and Dean: assign lecturer, supervisor, or reviewer to student
  @Patch(':id/assign')
  @Roles(RoleType.ADMIN, RoleType.DEAN)
  async assignStudent(
    @Param('id', ParseIntPipe) studentId: number,
    @Body() dto: AssignUserDto,
    @Req() req,
  ) {
    return this.usersService.assignStudent(studentId, dto, req.user);
  }

  @Get('faculties')
  @Roles(RoleType.ADMIN, RoleType.DEAN)
  async getFaculties() {
    return this.prisma.faculty.findMany({
      select: { id: true, name: true },
    });
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const actor = req.user as { id?: number; email?: string };
    if (!actor?.id || !actor?.email) {
      throw new BadRequestException('Missing authentication user id or email');
    }

    return this.usersService.deleteUser(id, actor.id, actor.email);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.DEAN)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { name?: string; email?: string; role?: RoleType; facultyId?: number },
  ) {
    return this.usersService.updateUser(id, body);
  }
}