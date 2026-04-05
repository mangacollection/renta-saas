import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
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
  }) {
    try {
      if (!params.to) {
        this.logger.warn('Email skipped: no recipient');
        return;
      }

      const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

      const info = await this.transporter.sendMail({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      this.logger.log(`Email sent → ${params.to}`);

      return info;
    } catch (error) {
      this.logger.error('Email send error', error);
      throw error;
    }
  }
}