import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountBillingJob {
  private readonly logger = new Logger(AccountBillingJob.name);

  constructor(private prisma: PrismaService) {}

  async run() {
    const now = new Date();

    const accounts = await this.prisma.account.findMany({
      where: {
        billingStatus: 'active',
        nextPaymentDueAt: { lte: now },
      },
    });

    for (const acc of accounts) {
      await this.prisma.account.update({
        where: { id: acc.id },
        data: { billingStatus: 'past_due' },
      });

      this.logger.warn(`Account ${acc.id} → past_due`);
    }

    return { processed: accounts.length };
  }
}