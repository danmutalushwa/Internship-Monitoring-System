import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RoleType } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService, 
  ) {}

  // Register new user with hashed password and validated role
  async register(data: {
    name: string;
    email: string;
    password: string;
    faculty: string;
    role?: RoleType;
  }) {
    const normalizedEmail = data.email.toLowerCase();
    const existing = await this.usersService.findByEmail(normalizedEmail);
    if (existing) {
      throw new UnauthorizedException('Email already in use');
    }

    const role: RoleType = data.role ?? RoleType.STUDENT;
    const allowedRoles: RoleType[] = [
      RoleType.STUDENT,
      RoleType.SUPERVISOR,
      RoleType.LECTURER,
      RoleType.DEAN,
      RoleType.ADMIN,
    ];
    if (!allowedRoles.includes(role)) {
      throw new BadRequestException('Invalid role specified');
    }
    // valididate faculty exists
    const facultyRecord = await this.prisma.faculty.findUnique({
      where: { name: data.faculty },
    });

    if (!facultyRecord) {
      throw new BadRequestException('Selected faculty does not exist');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const created = await this.usersService.createUser({
      name: data.name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      facultyId: facultyRecord.id, 
    });

    const { password, ...safeUser } = created as any;
    return safeUser;
  }

  // Used by LocalStrategy for login validation
  async validateUser(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) return null;

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) return null;

    const { password: _pw, ...safeUser } = user as any;
    return safeUser;
  }

  // Login: return JWT and safe user object
  async login(user: {
    id: string;
    email: string;
    role: RoleType;
    [key: string]: any;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });

    const { password, ...safeUser } = user as any;
    return {
      accessToken,
      user: safeUser,
    };
  }

  // Forgot password: generate reset token
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (!user) {
      return { message: 'If this email exists, a reset link will be sent.' };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '15m' },
    );

    // Simulate sending email
    return {
      message: 'Password reset link generated',
      resetToken,
    };
  }

  // Reset password using token
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const hashed = await bcrypt.hash(newPassword, 10);

      await this.usersService.updatePassword(payload.sub, hashed);
      return { message: 'Password successfully reset' };
    } catch (err) {
      throw new NotFoundException('Invalid or expired reset token');
    }
  }
}