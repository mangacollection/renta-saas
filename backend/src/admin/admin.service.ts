import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listAccounts() {
    return this.prisma.account.findMany();
  }

  async createOwnerAccount(input: {
    accountName: string;
    ownerEmail: string;
    ownerPhone?: string;
    maxSubscriptions?: number;
  }) {
    const { accountName, ownerEmail, ownerPhone, maxSubscriptions } = input;

    const existing = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    return this.prisma.account.create({
      data: {
        name: accountName,
        maxSubscriptions: maxSubscriptions ?? 5,
        billingStartedAt: new Date(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        users: {
          create: {
            email: ownerEmail,
            role: 'owner',
            phone: ownerPhone || null,
          },
        },
      },
      include: { users: true },
    });
  }

  async onboardUser(input: {
    email: string;
    accountId: string;
    role?: string;
    phone?: string;
  }) {
    const { email, accountId, role, phone } = input;

    if (!email) throw new BadRequestException('email is required');
    if (!accountId) throw new BadRequestException('accountId is required');

    return this.prisma.user.upsert({
      where: { email },
      update: {
        accountId,
        role: role ?? undefined,
        phone: phone ?? undefined,
      },
      create: {
        email,
        accountId,
        role: role ?? 'owner',
        phone: phone || null,
      },
    });
  }

  async createAccountPayment(input: {
    accountId: string;
    amount: number;
    method: string;
    channel?: string;
    reference?: string;
  }) {
    const { accountId, amount, method, channel, reference } = input;

    if (!accountId) throw new BadRequestException('accountId is required');
    if (!amount || amount <= 0)
      throw new BadRequestException('amount must be greater than 0');
    if (!method) throw new BadRequestException('method is required');

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new BadRequestException('account not found');

    return this.prisma.accountPayment.create({
      data: {
        accountId,
        amount,
        method,
        channel,
        reference,
      },
    });
  }

  async createAccountPaymentFromEmail(input: {
    from: string;
    subject: string;
    body: string;
  }) {
    const { from, subject, body } = input;

    if (!from) {
      throw new BadRequestException('from is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: from },
    });

    if (!user || !user.accountId) {
      throw new BadRequestException('user not found or has no account');
    }

    const amountMatch = body?.match(/(?:CLP|\$)?\s*([\d\.,]+)/i);

    if (!amountMatch) {
      throw new BadRequestException('amount not found in email body');
    }

    const rawAmount = amountMatch[1].replace(/[.,\s]/g, '');
    const amount = parseInt(rawAmount, 10);

    if (!amount || amount <= 0) {
      throw new BadRequestException('invalid amount');
    }

    const accountId = user.accountId;

    // ✅ DEDUPE best-effort: evita duplicar AccountPayment por mismo email (últimos 10 min)
    const referenceKey = `${from} | ${subject}`;
    const windowStart = new Date(Date.now() - 10 * 60 * 1000);

    const existing = await this.prisma.accountPayment.findFirst({
      where: {
        accountId,
        channel: 'email',
        method: 'transferencia',
        amount,
        reference: referenceKey,
        createdAt: { gte: windowStart },
        status: { in: ['received', 'approved'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      return existing;
    }

    // 1) Crear payment en received (comportamiento actual)
    const payment = await this.prisma.accountPayment.create({
      data: {
        accountId,
        amount,
        method: 'transferencia',
        channel: 'email',
        reference: referenceKey, // antes: subject
        status: 'received',
      },
    });

    // ✅ FASE 3: Matching simple contra invoice pending del mes actual
    const now = new Date();
    const currentPeriod = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}`;

    const pendingInvoice = await this.prisma.invoice.findFirst({
      where: {
        subscription: { accountId },
        period: currentPeriod,
        status: 'pending',
        total: amount,
      },
      orderBy: { createdAt: 'desc' }, // por si hubiera más de una que calce
    });

    // DEBUG TEMP
    console.log('pendingInvoice found:', pendingInvoice);

    if (pendingInvoice && pendingInvoice.total === amount) {
      // Marcar invoice como pagada + crear Payment (sin tocar AccountPayment)
      await this.prisma.$transaction(async (tx) => {
        // 1) Intentar marcar como pagada SOLO si sigue pending
        const updated = await tx.invoice.updateMany({
          where: {
            id: pendingInvoice.id,
            status: 'pending',
          },
          data: { status: 'paid' },
        });

        // 2) Si no actualizó nada, ya estaba pagada
        if (updated.count === 0) {
          return;
        }

        // 3) Solo si se actualizó, creamos el Payment
        await tx.payment.create({
          data: {
            invoiceId: pendingInvoice.id,
            method: 'transferencia',
            amount,
            note: 'auto:match-email',
          },
        });
      });
    }

    // 2) Buscar planPrice del account
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { planPrice: true },
    });

    if (!account) {
      throw new BadRequestException('account not found');
    }

    // 3) Auto-approve si coincide (comportamiento actual intacto)
    if (amount === account.planPrice) {
      await this.approveAccountPayment(payment.id, 'auto:email');
      return this.prisma.accountPayment.findUnique({
        where: { id: payment.id },
      });
    }

    return payment;
  }

  async approveAccountPayment(id: string, approvedBy?: string) {
    if (!id) throw new BadRequestException('payment id is required');

    const payment = await this.prisma.accountPayment.findUnique({
      where: { id },
    });

    if (!payment) throw new BadRequestException('account payment not found');

    if (payment.status === 'approved')
      throw new BadRequestException('payment already approved');

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.accountPayment.update({
        where: { id },
        data: {
          status: 'approved',
          approvedAt: now,
          approvedBy,
        },
      }),
      this.prisma.account.update({
        where: { id: payment.accountId },
        data: {
          billingStatus: 'active',
          billingStartedAt: now,
        },
      }),
    ]);

    return { success: true };
  }

  async listAccountPayments(status?: string) {
    return this.prisma.accountPayment.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { id: true, name: true } },
      },
    });
  }

  async listAccountsOverview() {
    const accounts = await this.prisma.account.findMany({
      include: {
        users: true,
        accountPayments: {
          where: { status: 'approved' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts.map((acc) => {
      const owner = acc.users.find((u) => u.role === 'owner');

      const totalPaid = acc.accountPayments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0,
      );

      const monthsSubscribed = acc.billingStartedAt
        ? Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(acc.billingStartedAt).getTime()) /
                (1000 * 60 * 60 * 24 * 30),
            ),
          )
        : 0;

      return {
        id: acc.id,
        name: acc.name,
        ownerEmail: owner?.email ?? null,
        ownerPhone: owner?.phone ?? null,
        plan: acc.plan,
        billingStatus: acc.billingStatus,
        createdAt: acc.createdAt,
        monthsSubscribed,
        totalPaid,
      };
    });
  }
}