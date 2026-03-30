import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';

function isValidEmail(value?: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidChileanPhone(value?: string) {
  if (!value) return true;
  const digits = value.replace(/\D/g, '');
  return /^569\d{8}$/.test(digits);
}

function isValidRut(rut?: string): boolean {
  if (!rut) return true;

  const clean = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

  if (clean.length < 2) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expected = 11 - (sum % 11);

  let expectedDv = '';
  if (expected === 11) expectedDv = '0';
  else if (expected === 10) expectedDv = 'K';
  else expectedDv = String(expected);

  return dv === expectedDv;
}

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async createSubscription(input: {
  accountId: string;
  tenantName: string;
  tenantRut?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  billingDay?: number;
  startDate?: string; // ISO date string
  hasInitialCharges?: boolean;
  initialCharges?: { label: string; amount: number }[];
  monthlyBillingStart?: string;
}) {
  const {
    accountId,
    tenantName,
    tenantRut,
    tenantEmail,
    tenantPhone,
    billingDay,
    startDate,
    hasInitialCharges,
    initialCharges,
    monthlyBillingStart,
  } = input;

  if (!accountId) throw new BadRequestException('accountId is required');
  if (!tenantName) throw new BadRequestException('tenantName is required');

  if (tenantEmail && !isValidEmail(tenantEmail)) {
    throw new BadRequestException('Email inválido');
  }

  if (tenantPhone && !isValidChileanPhone(tenantPhone)) {
    throw new BadRequestException('Teléfono inválido');
  }

  if (tenantRut && !isValidRut(tenantRut)) {
    throw new BadRequestException('RUT inválido');
  }

  if (monthlyBillingStart && !/^\d{4}-\d{2}$/.test(monthlyBillingStart)) {
    throw new BadRequestException('monthlyBillingStart must use YYYY-MM');
  }

  const normalizedInitialCharges = Array.isArray(initialCharges)
    ? initialCharges
        .filter((item) => item && item.label && item.amount != null)
        .map((item) => ({
          label: String(item.label).trim(),
          amount: Math.trunc(Number(item.amount)),
        }))
        .filter((item) => item.label && !Number.isNaN(item.amount) && item.amount > 0)
    : [];

try {
  return await this.prisma.subscription.create({
    data: {
      accountId,
      tenantName,
      tenantRut: tenantRut || null,
      tenantEmail: tenantEmail || null,
      tenantPhone: tenantPhone || null,
      billingDay: billingDay ?? 5,
      status: 'draft',
      startDate: startDate ? new Date(startDate) : new Date(),
      hasInitialCharges: Boolean(hasInitialCharges && normalizedInitialCharges.length > 0),
      initialCharges: normalizedInitialCharges.length
        ? (normalizedInitialCharges as any)
        : undefined,
      monthlyBillingStart: monthlyBillingStart || null,
      firstInvoiceType: null,
    },
  });
} catch (error) {
  console.error('createSubscription error:', error);
  throw error;
}
}

async updateDraft(
  id: string,
  input: {
    tenantName?: string;
    tenantRut?: string;
    tenantEmail?: string;
    tenantPhone?: string;
    billingDay?: number;
    startDate?: string;
    hasInitialCharges?: boolean;
    initialCharges?: { label: string; amount: number }[];
    monthlyBillingStart?: string;
  },
  accountId: string,
) {
  if (!id) throw new BadRequestException('id is required');
  if (!accountId) throw new BadRequestException('accountId is required');

  const existing = await this.prisma.subscription.findFirst({
    where: {
      id,
      accountId,
    },
  });

  if (!existing) {
    throw new BadRequestException('Subscription not found');
  }

  if (existing.status !== 'draft') {
    throw new BadRequestException('Only draft subscriptions can be updated');
  }

  const {
    tenantName,
    tenantRut,
    tenantEmail,
    tenantPhone,
    billingDay,
    startDate,
    hasInitialCharges,
    initialCharges,
    monthlyBillingStart,
  } = input;

  const normalizedInitialCharges = Array.isArray(initialCharges)
    ? initialCharges
        .filter((item) => item && item.label && item.amount != null)
        .map((item) => ({
          label: String(item.label).trim(),
          amount: Math.trunc(Number(item.amount)),
        }))
        .filter((item) => item.label && !Number.isNaN(item.amount) && item.amount > 0)
    : [];

  const nextHasInitialCharges =
    hasInitialCharges === undefined
      ? existing.hasInitialCharges
      : Boolean(hasInitialCharges && normalizedInitialCharges.length > 0);

  return this.prisma.subscription.update({
    where: { id },
    data: {
      tenantName: tenantName?.trim() || existing.tenantName,
      tenantRut: tenantRut === undefined ? existing.tenantRut : tenantRut || null,
      tenantEmail: tenantEmail === undefined ? existing.tenantEmail : tenantEmail || null,
      tenantPhone: tenantPhone === undefined ? existing.tenantPhone : tenantPhone || null,
      billingDay: billingDay ?? existing.billingDay,
      startDate: startDate ? new Date(startDate) : existing.startDate,
      hasInitialCharges: nextHasInitialCharges,
      initialCharges:
        nextHasInitialCharges && normalizedInitialCharges.length
          ? (normalizedInitialCharges as any)
          : undefined,
      monthlyBillingStart:
        monthlyBillingStart === undefined
          ? existing.monthlyBillingStart
          : monthlyBillingStart || null,
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
  if (!subscriptionId) {
    throw new BadRequestException('subscriptionId is required');
  }

  const sub = await this.prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      items: true,
      tenant: true,
    },
  });

  if (!sub) {
    throw new BadRequestException('Subscription not found');
  }

  if (sub.status === 'active') {
    return sub;
  }

  if (!sub.items.length) {
    throw new BadRequestException('Cannot activate without items');
  }

  if (!sub.monthlyBillingStart) {
    throw new BadRequestException('monthlyBillingStart is required');
  }
  const monthlyBillingStart = sub.monthlyBillingStart;

  const initialCharges = Array.isArray(sub.initialCharges)
    ? (sub.initialCharges as { label?: string; amount?: number }[])
        .filter((item) => item && item.label && item.amount != null)
        .map((item) => ({
          label: String(item.label).trim(),
          amount: Math.trunc(Number(item.amount)),
        }))
        .filter((item) => item.label && !Number.isNaN(item.amount) && item.amount > 0)
    : [];

  const hasInitialCharges = sub.hasInitialCharges && initialCharges.length > 0;

  return this.prisma.$transaction(async (tx) => {
    const updated = await tx.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        firstInvoiceType: hasInitialCharges ? 'initial' : 'monthly',
      },
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

  if (hasInitialCharges) {
    await this.invoicesService.createFromSubscription({
      subscriptionId: sub.id,
      period: monthlyBillingStart,
      type: 'initial',
      customItems: initialCharges,
    });
  }

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