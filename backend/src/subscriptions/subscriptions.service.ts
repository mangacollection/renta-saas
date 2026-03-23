import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSubscription(input: {
    accountId: string;
    tenantName: string;
    tenantRut?: string;
    tenantEmail?: string;
    billingDay?: number;
    startDate?: string; // ISO date string
  }) {
    const { accountId, tenantName, tenantRut, tenantEmail, billingDay, startDate } = input;

    if (!accountId) throw new BadRequestException('accountId is required');
    if (!tenantName) throw new BadRequestException('tenantName is required');

    return this.prisma.subscription.create({
      data: {
        accountId,
        tenantName,
        tenantRut: tenantRut || null,
        tenantEmail: tenantEmail || null,
        billingDay: billingDay ?? 5,
        status: 'draft',
        startDate: startDate ? new Date(startDate) : new Date(),
      },
    });
  }

      async addItem(input: {
      subscriptionId: string;
      type: string; // depto|estacionamiento|bodega|gasto_comun|otro
      name: string;
      amount: number;
    }) {
      const { subscriptionId, type, name, amount } = input;

      if (!subscriptionId) throw new BadRequestException('subscriptionId is required');
      if (!type) throw new BadRequestException('type is required');
      if (!name) throw new BadRequestException('name is required');
      if (amount == null || Number.isNaN(amount)) {
        throw new BadRequestException('amount is required');
      }

      const normalizedName = name.trim();
      const normalizedAmount = Math.trunc(amount);

      const existing = await this.prisma.subscriptionItem.findFirst({
        where: {
          subscriptionId,
          name: normalizedName,
          amount: normalizedAmount,
        },
      });

      if (existing) {
        throw new BadRequestException('Item already exists');
      }

      return this.prisma.subscriptionItem.create({
        data: {
          subscriptionId,
          type,
          name: normalizedName,
          amount: normalizedAmount,
        },
      });
    }

  async listByAccount(accountId: string) {
    if (!accountId) throw new BadRequestException('accountId is required');

    return this.prisma.subscription.findMany({
      where: { accountId },
        include: {
        items: true,
        tenant: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async activate(subscriptionId: string) {
    if (!subscriptionId) throw new BadRequestException('subscriptionId is required');

    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { items: true },
    });

    if (!sub) throw new BadRequestException('Subscription not found');
    if (!sub.items.length)
      throw new BadRequestException('Cannot activate without items');

      return this.prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'active' },
      });

      await tx.tenant.upsert({
        where: { subscriptionId: sub.id },
        update: {
          name: sub.tenantName,
          rut: sub.tenantRut ?? null,
          email: sub.tenantEmail ?? null,
          phone: sub.tenantPhone ?? null,
          accountId: sub.accountId,
        },
        create: {
          subscriptionId: sub.id,
          accountId: sub.accountId,
          name: sub.tenantName,
          rut: sub.tenantRut ?? null,
          email: sub.tenantEmail ?? null,
          phone: sub.tenantPhone ?? null,
        },
      });

      return updated;
    });
  }
    async updateItem(
      id: string,
      input: { name?: string; amount?: number },
      accountId: string,
    ) {
      if (!id) throw new BadRequestException('id is required');
      if (!accountId) throw new BadRequestException('accountId is required');

      const item = await this.prisma.subscriptionItem.findFirst({
        where: {
          id,
          subscription: {
            accountId,
          },
        },
      });

      if (!item) {
        throw new BadRequestException('Item not found');
      }

      return this.prisma.subscriptionItem.update({
        where: { id },
        data: {
          name: input.name ?? item.name,
          amount:
            input.amount == null || Number.isNaN(input.amount)
              ? item.amount
              : Math.trunc(input.amount),
        },
      });
    }
    async deleteItem(id: string, accountId: string) {
      if (!id) throw new BadRequestException('id is required');
      if (!accountId) throw new BadRequestException('accountId is required');

      const item = await this.prisma.subscriptionItem.findFirst({
        where: {
          id,
          subscription: {
            accountId,
          },
        },
      });

      if (!item) {
        throw new BadRequestException('Item not found');
      }

      await this.prisma.subscriptionItem.delete({
        where: { id },
      });

      return { ok: true };
    }
  
}
