import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AutomationJob {
  private readonly logger = new Logger(AutomationJob.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleDailyAutomation() {
    this.logger.log('🔁 Running daily automation job');

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: 'pending',
      },
    });

    const today = new Date();
    let recommendations = 0;

    for (const invoice of invoices) {
      const due = new Date(invoice.dueDate);

      const diffMs = today.getTime() - due.getTime();
      const daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (daysLate < 0) continue;

      let action: string | null = null;
      let priority: string | null = null;

      if (daysLate >= 7) {
        action = 'send_strong_message';
        priority = 'high';
      } else if (daysLate >= 3) {
        action = 'send_reminder';
        priority = 'medium';
      }

      if (action) {
        recommendations++;

        this.logger.log(
          `📌 Invoice ${invoice.id} → ${action} (${priority}) - ${daysLate} días atraso`,
        );
      }
    }

    await this.prisma.automationRun.create({
      data: {
        totalInvoices: invoices.length,
        recommendations,
      },
    });

    this.logger.log(
      `✅ Automation job finished | reviewed=${invoices.length} recommendations=${recommendations}`,
    );
  }
}