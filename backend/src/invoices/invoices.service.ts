import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromSubscription(input: {
    subscriptionId: string;
    period: string; // "YYYY-MM"
    dueDate?: string; // ISO string
  }) {
    const { subscriptionId, period, dueDate } = input;

    if (!subscriptionId) throw new BadRequestException('subscriptionId is required');
    if (!period) throw new BadRequestException('period is required (YYYY-MM)');

    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { items: true },
    });

    if (!subscription) throw new BadRequestException('Subscription not found');

    const total = subscription.items.reduce((sum, it) => sum + it.amount, 0);

    // dueDate default: billingDay del contrato en el mes del period
    const computedDueDate = dueDate
      ? new Date(dueDate)
      : this.defaultDueDate(period, subscription.billingDay);

    return this.prisma.invoice.create({
      data: {
        subscriptionId,
        period,
        total,
        dueDate: computedDueDate,
        status: 'pending',
      },
    });
  }

  private defaultDueDate(period: string, billingDay: number) {
    // period "YYYY-MM"
    const [y, m] = period.split('-').map((v) => parseInt(v, 10));
    if (!y || !m) throw new BadRequestException('Invalid period format. Use YYYY-MM');

    // JS month is 0-based
    const date = new Date(y, m - 1, billingDay, 12, 0, 0);
    return date;
  }

  async listBySubscription(subscriptionId: string) {
    if (!subscriptionId) throw new BadRequestException('subscriptionId is required');

    return this.prisma.invoice.findMany({
      where: { subscriptionId },
      orderBy: { createdAt: 'desc' },
    });
  }
async generateForMonth(input: { period: string; accountId?: string }) {
  const { period, accountId } = input;

  if (!period) throw new BadRequestException('period is required (YYYY-MM)');

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

    const total = sub.items.reduce((sum, it) => sum + it.amount, 0);
    const dueDate = this.defaultDueDate(period, sub.billingDay);

    try {
      await this.prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          period,
          total,
          dueDate,
          status: 'pending',
        },
      });
      created++;
    } catch (e) {
      // Por @@unique([subscriptionId, period]) si ya existe, cae acá → lo saltamos
      skipped++;
    }
  }

  return { period, created, skipped, processed: subs.length };
}
}
