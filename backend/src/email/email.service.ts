import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
      this.logger.warn('EMAIL_USER or EMAIL_PASS not configured');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    type?: string;
    accountId?: string;
  }) {
    const { to, subject, html, type, accountId } = params;

    if (!to) {
      this.logger.warn('Email skipped: no recipient');
      return;
    }

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent → ${to}`);

      // log success
      await this.prisma.emailLog.create({
        data: {
          email: to,
          type: type || 'unknown',
          status: 'sent',
          accountId,
        },
      });

      return info;
    } catch (error) {
      this.logger.error('Email send error', error);

      // retry 1 vez
      try {
        const info = await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });

        this.logger.log(`Email retry success → ${to}`);

        await this.prisma.emailLog.create({
          data: {
            email: to,
            type: type || 'retry',
            status: 'sent',
            accountId,
          },
        });

        return info;
      } catch (retryError) {
        await this.prisma.emailLog.create({
          data: {
            email: to,
            type: type || 'unknown',
            status: 'failed',
            error: retryError?.message || 'unknown error',
            accountId,
          },
        });

        throw retryError;
      }
    }
  }
}