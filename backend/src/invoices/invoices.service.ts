import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromSubscription(input: {
    subscriptionId: string;
    period: string; // "YYYY-MM"
    dueDate?: string; // ISO string
    type?: 'initial' | 'monthly';
    customItems?: { label: string; amount: number }[];
  }) {
    const { subscriptionId, period, dueDate, type = 'monthly', customItems } = input;

    if (!subscriptionId) {
      throw new BadRequestException('subscriptionId is required');
    }

    if (!period) {
      throw new BadRequestException('period is required (YYYY-MM)');
    }

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { items: true },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const items = customItems?.length
      ? customItems
      : subscription.items.map((it) => ({
          label: it.name,
          amount: it.amount,
        }));

    const total = items.reduce((sum, it) => sum + it.amount, 0);

    const computedDueDate = dueDate
      ? new Date(dueDate)
      : this.defaultDueDate(period, subscription.billingDay);

    const existing = await this.prisma.invoice.findFirst({
      where: {
        subscriptionId,
        period,
        type,
      },
      include: {
        items: true,
      },
    });

    if (existing) {
      return existing;
    }

    const invoice = await this.prisma.invoice.create({
      data: {
        subscriptionId,
        period,
        total,
        dueDate: computedDueDate,
        status: 'pending',
        type,
      },
    });

    if (items.length > 0) {
      await this.prisma.invoiceItem.createMany({
        data: items.map((it) => ({
          invoiceId: invoice.id,
          label: it.label,
          amount: it.amount,
        })),
      });
    }

    return this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: { items: true },
    });
  }

  private defaultDueDate(period: string, billingDay: number) {
    const [y, m] = period.split('-').map((v) => parseInt(v, 10));

    if (!y || !m) {
      throw new BadRequestException('Invalid period format. Use YYYY-MM');
    }

    const date = new Date(y, m - 1, billingDay, 12, 0, 0);
    return date;
  }

  async listBySubscription(subscriptionId: string) {
    if (!subscriptionId) {
      throw new BadRequestException('subscriptionId is required');
    }

    return this.prisma.invoice.findMany({
      where: { subscriptionId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateForMonth(input: { period: string; accountId?: string }) {
    const { period, accountId } = input;

    if (!period) {
      throw new BadRequestException('period is required (YYYY-MM)');
    }

    const subs = await this.prisma.subscription.findMany({
      where: {
        status: 'active',
        ...(accountId ? { accountId } : {}),
      },
      include: { items: true },
    });

    let created = 0;
    let skipped = 0;

    for (const sub of subs) {
      if (!sub.items?.length) {
        skipped++;
        continue;
      }

      const invoiceItems = sub.items.map((it) => ({
        label: it.name,
        amount: it.amount,
      }));

      const total = invoiceItems.reduce((sum, it) => sum + it.amount, 0);
      const dueDate = this.defaultDueDate(period, sub.billingDay);

      const existingMonthly = await this.prisma.invoice.findFirst({
        where: {
          subscriptionId: sub.id,
          period,
          type: 'monthly',
        },
      });

      if (existingMonthly) {
        skipped++;
        continue;
      }

      const invoice = await this.prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          period,
          total,
          dueDate,
          status: 'pending',
          type: 'monthly',
        },
      });

      if (invoiceItems.length > 0) {
        await this.prisma.invoiceItem.createMany({
          data: invoiceItems.map((item) => ({
            invoiceId: invoice.id,
            label: item.label,
            amount: item.amount,
          })),
        });
      }

      created++;
    }

    return { period, created, skipped, processed: subs.length };
  }
}