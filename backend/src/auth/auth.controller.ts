import { Request } from 'express';
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleType } from '@prisma/client';
import { PrismaService } from '../prisma.service'; // <-- inject Prisma

interface RequestWithUser extends Request {
  user?: any;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService, // <-- add Prisma
  ) {}

  // Register new user with role conversion
  @Post('register')
  async register(@Body() body: {
    name: string;
    email: string;
    password: string;
    faculty: string;
    role?: string;
  }) {
    const roleEnum = body.role?.toUpperCase() as RoleType | undefined;
    return this.authService.register({
      ...body,
      role: roleEnum,
    });
  }

  // Login: validate via LocalStrategy, then return JWT in response body
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: RequestWithUser) {
    const { accessToken, user } = await this.authService.login(req.user);
    return { accessToken, user };
  }

  // Logout: no-op (client deletes token)
  @Post('logout')
  async logout() {
    return { ok: true };
  }

  // Protected: return logged-in user with faculty + latest internship
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    const student = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        faculty: true,
        internships: {
          orderBy: { startDate: 'desc' },
          take: 1, // latest internship only
        },
      },
    });

    if (!student) return null;

    const latestInternship = student.internships[0];

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      role: student.role,
      faculty: student.faculty,
      internshipCompany: latestInternship?.company ?? null,
      internshipStatus: latestInternship?.status ?? null,
    };
  }

  // Debug: show token from Authorization header
  @UseGuards(AuthGuard('jwt'))
  @Get('debug-token')
  getDebugToken(@Req() req: RequestWithUser) {
    const authHeader = req.headers['authorization'];
    return {
      token: authHeader?.replace('Bearer ', ''),
      user: req.user,
    };
  }
}