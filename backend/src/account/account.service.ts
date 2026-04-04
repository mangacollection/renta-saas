import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlan(accountId: string) {
    if (!accountId) throw new BadRequestException('accountId is required');

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: {
        plan: true,
        planPrice: true,
        billingStatus: true,
        trialEndsAt: true,
        nextPaymentDueAt: true,
      },
    });

    if (!account) throw new BadRequestException('account not found');

    if (
      account.billingStatus === 'trial' &&
      account.trialEndsAt &&
      account.trialEndsAt.getTime() < Date.now()
    ) {
      await this.prisma.account.update({
        where: { id: accountId },
        data: { billingStatus: 'past_due' },
      });

      account.billingStatus = 'past_due';
    }

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
      nextPaymentDueAt: account.nextPaymentDueAt,
      daysRemaining,
    };
  }

  async getProfile(email: string) {
    if (!email) throw new BadRequestException('email is required');

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        role: true,
        phone: true,
      },
    });

    if (!user) throw new BadRequestException('user not found');

    return user;
  }

  async updateProfile(email: string, phone?: string) {
    if (!email) throw new BadRequestException('email is required');

    const normalizedPhone = phone?.trim() ? phone.trim() : null;

    const user = await this.prisma.user.update({
      where: { email },
      data: {
        phone: normalizedPhone,
      },
      select: {
        email: true,
        role: true,
        phone: true,
      },
    });

    return user;
  }
}