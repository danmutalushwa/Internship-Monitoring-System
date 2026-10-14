import { Controller, Post, Patch, Delete, Get, Param, Query, UseGuards, UseInterceptors, UploadedFile, Body, Req, Res, BadRequestException, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateReportDto, UpdateReportStatusDto } from './dto/report.dto';
import { PrismaService } from '../prisma.service';
import { LlamaService } from '../ai/llama.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Prisma, ReportStatus } from '@prisma/client';
import type { Response } from 'express';
import { Parser } from 'json2csv';

@Controller('reports')
export class ReportsController {
  constructor(
    private prisma: PrismaService,
    private llama: LlamaService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/reports',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
  }))
  async createReport(@Req() req, @Body() dto: any, @UploadedFile() file: Express.Multer.File) {
    console.log("DTO RECEIVED:", dto);
    console.log("FILE RECEIVED:", file);
    console.log("USER:", req.user);
    const student = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!student || student.role !== 'STUDENT') throw new BadRequestException('Only students can submit reports.');

    const existing = await this.prisma.report.findFirst({
      where: { studentId: student.id, title: dto.title },
    });
    if (existing) throw new BadRequestException('You have already submitted this week’s report.');

    const report = await this.prisma.report.create({
      data: {
        title: dto.title,
        content: dto.content,
        studentId: student.id,
        facultyId: student.facultyId,
        fileUrl: file ? `/uploads/reports/${file.filename}` : null,
        status: 'PENDING',
        type: 'internship',
      },
    });

    return { message: 'Report submitted successfully!', report };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/reports',
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
  }))
  async updateReport(@Param('id') id: string, @Req() req, @Body() dto: CreateReportDto, @UploadedFile() file: Express.Multer.File) {
    const report = await this.prisma.report.findUnique({ where: { id: Number(id) } });
    if (!report || report.studentId !== req.user.id) throw new ForbiddenException('You can only edit your own reports.');
    if (report.status !== 'PENDING') throw new BadRequestException('Only pending reports can be edited.');

    const updated = await this.prisma.report.update({
      where: { id: report.id },
      data: {
        title: dto.title,
        content: dto.content,
        fileUrl: file ? `/uploads/reports/${file.filename}` : report.fileUrl,
      },
    });

    await this.prisma.reportActivity.create({
      data: { reportId: report.id, actorId: req.user.id, action: 'UPDATED' },
    });

    return { message: 'Report updated successfully!', report: updated };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteReport(@Param('id') id: string, @Req() req) {
    const report = await this.prisma.report.findUnique({ where: { id: Number(id) } });
    if (!report || report.studentId !== req.user.id) throw new ForbiddenException('You can only delete your own reports.');
    if (report.status !== 'PENDING') throw new BadRequestException('Only pending reports can be deleted.');

    await this.prisma.report.delete({ where: { id: report.id } });
    return { message: 'Report deleted successfully!' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('supervisor')
  async getSupervisorReports(@Req() req) {
    return this.prisma.report.findMany({
      where: {
        student: { assignedSupervisorId: req.user.id }
      },
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('lecturer')
  async getLecturerReports(@Req() req) {
    const lecturer = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!lecturer || lecturer.role !== 'LECTURER') throw new ForbiddenException('Access denied.');

    return this.prisma.report.findMany({
      where: { facultyId: lecturer.facultyId },
      include: {
        student: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getReports(
    @Req() req,
    @Query('faculty') faculty?: string,
    @Query('student') student?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Access denied.');

    const where: Prisma.ReportWhereInput = {};

    if (faculty) where.facultyId = Number(faculty);
    if (type) where.type = type;
    if (student) {
      where.student = {
        name: { contains: student.toLocaleLowerCase() },
      };
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
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

    return reports.map((r) => ({
      id: r.id,
      name: r.title,
      student: r.student.name,
      faculty: r.facultyId,
      type: r.type,
      url: r.fileUrl,
      createdAt: r.createdAt.toISOString().split('T')[0],
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Get('export')
  async exportReportsAsCSV(
    @Req() req,
    @Res() res: Response,
    @Query('faculty') faculty?: string,
    @Query('student') student?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Access denied.');

    const where: Prisma.ReportWhereInput = {};

    if (faculty) where.facultyId = Number(faculty);
    if (type) where.type = type;
    if (student) {
      where.student = {
        name: { contains: student, mode: 'insensitive' } as any,
      };
    }
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        student: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = reports.map((r) => ({
      Title: r.title,
      Student: r.student.name,
      Faculty: r.facultyId, 
      Type: r.type,
      Status: r.status,
      Date: r.createdAt.toISOString().split('T')[0],
    }));

    const parser = new Parser({ fields: Object.keys(rows[0]) });
    const csv = parser.parse(rows);
        res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"');
    res.send(csv);
  }
}
    