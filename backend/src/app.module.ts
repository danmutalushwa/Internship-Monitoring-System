import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { PrismaService } from './prisma.service';
import { RolesService } from './roles/roles.service';
import { RolesController } from './roles/roles.controller';
import { RolesModule } from './roles/roles.module';


import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

import { DashboardController } from './dashboard.controller';
import { LlamaModule } from './ai/llama.module';
import { SupervisorModule } from './supervisor/supervisor.module';
import { AuditModule } from './audit/audit.module';
import { InternshipModule } from './internship/internship.module';
import { DeanModule } from './dean/dean.module';
import { AdminModule } from './admin/admin.module';
import { LecturerModule } from './lecturer/lecturer.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ReportsModule,
    LlamaModule,
    SupervisorModule,
    AuditModule,
    RolesModule,
    InternshipModule,
    DeanModule,
    AdminModule,
    LecturerModule,
  ],
  controllers: [DashboardController, AdminController, RolesController],
  providers: [PrismaService, AdminService, RolesService],
  exports: [RolesService],
})
export class AppModule {}