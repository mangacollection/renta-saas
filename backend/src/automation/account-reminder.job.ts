import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountReminderJob {
  private readonly logger = new Logger(AccountReminderJob.name);

  constructor(private prisma: PrismaService) {}

  async run() {
    const now = new Date();

    const accounts = await this.prisma.account.findMany({
      where: {
        OR: [
          { billingStatus: 'active' },
          { billingStatus: 'past_due' },
        ],
      },
      include: {
        users: true,
      },
    });

    let sent = 0;

    for (const acc of accounts) {
      const owner = acc.users.find((u) => u.role === 'owner');
      if (!owner) continue;

      const due = acc.nextPaymentDueAt;
      if (!due) continue;

      const diffDays = Math.ceil(
        (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      let reminderType: string | null = null;

      if (acc.billingStatus === 'active') {
        if (diffDays === 3) reminderType = 'before_3d';
        if (diffDays === 1) reminderType = 'before_1d';
      }

      if (acc.billingStatus === 'past_due') {
        reminderType = 'past_due';
      }

      if (!reminderType) continue;

      // evitar spam
      if (acc.lastReminderType === reminderType) continue;

      // 👉 aquí puedes luego conectar WhatsApp / Email real
      this.logger.log(
        `Reminder ${reminderType} → ${owner.email} (account ${acc.id})`,
      );

      await this.prisma.account.update({
        where: { id: acc.id },
        data: {
          lastReminderSentAt: now,
          lastReminderType: reminderType,
        },
      });

      sent++;
    }

    return { sent };
  }
}