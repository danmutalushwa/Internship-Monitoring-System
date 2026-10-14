import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendAssignmentEmail(to: string, reviewerName: string, count: number) {
    await this.transporter.sendMail({
      from: `"UoK Internship System" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'New Student Assignments',
      html: `<p>Dear ${reviewerName},</p><p>You’ve been assigned ${count} new student(s).</p>`,
    });
  }
}