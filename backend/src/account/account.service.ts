import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlan(accountId: string) {
    if (!accountId) throw new BadRequestException('accountId is required');

    // 1) Cargar account
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        plan: true,
        planPrice: true,
        billingStatus: true,
        trialEndsAt: true,
      },
    });

    if (!account) throw new BadRequestException('account not found');

    // 2) Si trial venció, pasar a past_due (sin cron)
    if (
      account.billingStatus === 'trial' &&
      account.trialEndsAt &&
      account.trialEndsAt.getTime() < Date.now()
    ) {
      await this.prisma.account.update({
        where: { id: accountId },
        data: { billingStatus: 'past_due' },
      });

      // reflejar cambio en respuesta
      account.billingStatus = 'past_due';
    }

    // 3) daysRemaining dinámico
    const daysRemaining =
      account.trialEndsAt && account.billingStatus === 'trial'
        ? Math.max(
            0,
            Math.ceil(
              (account.trialEndsAt.getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;

    return {
      plan: account.plan,
      planPrice: account.planPrice,
      billingStatus: account.billingStatus,
      trialEndsAt: account.trialEndsAt,
      daysRemaining,
    };
  }
}
