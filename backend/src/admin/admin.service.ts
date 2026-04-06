import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async updateBillingStatus(
    id: string,
    billingStatus: 'trial' | 'active' | 'past_due',
    user: any,
  ) {
    const data: any = {
      billingStatus,
    };

    if (billingStatus === 'active') {
      const now = new Date();

      const nextPaymentDueAt = new Date(now);
      nextPaymentDueAt.setMonth(nextPaymentDueAt.getMonth() + 1);

      data.billingStartedAt = now;
      data.nextPaymentDueAt = nextPaymentDueAt;
    }

    return this.prisma.account.update({
      where: {
        id,
      },
      data,
    });
  }

  async getAccountBillingConfig(id: string) {
    if (!id) {
      throw new BadRequestException('account id is required');
    }

    const account = await this.prisma.account.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        billingPhone: true,
        billingBankName: true,
        billingAccountType: true,
        billingAccountNumber: true,
        billingAccountHolder: true,
        billingAccountRut: true,
        billingTransferEmail: true,
      },
    });

    if (!account) {
      throw new BadRequestException('account not found');
    }

    return account;
  }

  async updateAccountBillingConfig(
    id: string,
    input: {
      billingPhone?: string;
      billingBankName?: string;
      billingAccountType?: string;
      billingAccountNumber?: string;
      billingAccountHolder?: string;
      billingAccountRut?: string;
      billingTransferEmail?: string;
    },
  ) {
    if (!id) {
      throw new BadRequestException('account id is required');
    }

    const account = await this.prisma.account.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!account) {
      throw new BadRequestException('account not found');
    }

    const normalizeNullable = (value?: string) => {
      if (value === undefined) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    };

    const normalizePhone = (value?: string) => {
      if (value === undefined) return undefined;
      const digits = value.replace(/\D/g, '');
      return digits.length > 0 ? digits : null;
    };

    const billingTransferEmail = normalizeNullable(input.billingTransferEmail);
    if (
      billingTransferEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingTransferEmail)
    ) {
      throw new BadRequestException('billingTransferEmail is invalid');
    }

    return this.prisma.account.update({
      where: { id },
      data: {
        billingPhone: normalizePhone(input.billingPhone),
        billingBankName: normalizeNullable(input.billingBankName),
        billingAccountType: normalizeNullable(input.billingAccountType),
        billingAccountNumber: normalizeNullable(input.billingAccountNumber),
        billingAccountHolder: normalizeNullable(input.billingAccountHolder),
        billingAccountRut: normalizeNullable(input.billingAccountRut),
        billingTransferEmail,
      },
      select: {
        id: true,
        name: true,
        billingPhone: true,
        billingBankName: true,
        billingAccountType: true,
        billingAccountNumber: true,
        billingAccountHolder: true,
        billingAccountRut: true,
        billingTransferEmail: true,
      },
    });
  }

async getPlatformBillingConfig() {
  let config = await this.prisma.platformBillingConfig.findFirst();

  if (!config) {
    config = await this.prisma.platformBillingConfig.create({
      data: {},
    });
  }

  return config;
}

async updatePlatformBillingConfig(input: {
  billingPhone?: string;
  billingBankName?: string;
  billingAccountType?: string;
  billingAccountNumber?: string;
  billingAccountHolder?: string;
  billingAccountRut?: string;
  billingTransferEmail?: string;
}) {
  let config = await this.prisma.platformBillingConfig.findFirst();

  if (!config) {
    config = await this.prisma.platformBillingConfig.create({
      data: {},
    });
  }

  const normalizeNullable = (value?: string) => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const normalizePhone = (value?: string) => {
    if (value === undefined) return undefined;
    const digits = value.replace(/\D/g, '');
    return digits.length > 0 ? digits : null;
  };

  const billingTransferEmail = normalizeNullable(input.billingTransferEmail);
  if (
    billingTransferEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingTransferEmail)
  ) {
    throw new BadRequestException('billingTransferEmail is invalid');
  }

  return this.prisma.platformBillingConfig.upsert({
    where: { id: config.id },
   update: {
  billingPhone: normalizePhone(input.billingPhone),
  billingBankName: normalizeNullable(input.billingBankName),
  billingAccountType: normalizeNullable(input.billingAccountType),
  billingAccountNumber: normalizeNullable(input.billingAccountNumber),
  billingAccountHolder: normalizeNullable(input.billingAccountHolder),
  billingAccountRut: normalizeNullable(input.billingAccountRut),
  billingTransferEmail,
},
create: {
  billingPhone: normalizePhone(input.billingPhone),
  billingBankName: normalizeNullable(input.billingBankName),
  billingAccountType: normalizeNullable(input.billingAccountType),
  billingAccountNumber: normalizeNullable(input.billingAccountNumber),
  billingAccountHolder: normalizeNullable(input.billingAccountHolder),
  billingAccountRut: normalizeNullable(input.billingAccountRut),
  billingTransferEmail,
},
  });
}

async createAccountManual(input: {
  email: string;
  phone?: string;
  rut?: string;
  plan: string;
  planPrice: number;
  firstName?: string;
  lastName?: string;
}) {
  const { email, phone, plan, planPrice, firstName, lastName } = input;

  if (!email) {
    throw new BadRequestException('email is required');
  }

  const existing = await this.prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new BadRequestException('Email already exists');
  }

  const now = new Date();

  const fullName =
    [firstName?.trim(), lastName?.trim()]
      .filter(Boolean)
      .join(' ') || email;

  return this.prisma.account.create({
    data: {
      name: fullName, // 👈 AQUÍ usamos nombre real
      plan,
      planPrice,
      billingStatus: 'trial',
      trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      users: {
        create: {
          email,
          role: 'owner',
          phone: phone || null,
        },
      },
    },
    include: { users: true },
  });
}

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
    if (!amount || amount <= 0) {
      throw new BadRequestException('amount must be greater than 0');
    }
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

    const fullText = `${from}\n${subject ?? ''}\n${body ?? ''}`;

    let extractedEmail: string | null = null;

    const emailAfterLabel = fullText.match(/correo[:\s]+([^\s]+)/i);
    if (emailAfterLabel) {
      extractedEmail = emailAfterLabel[1].trim().toLowerCase();
    }

    if (!extractedEmail) {
      const emailMatch = fullText.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
      );
      if (emailMatch) {
        extractedEmail = emailMatch[0].trim().toLowerCase();
      }
    }

    const rutMatch = fullText.match(/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/);
    const extractedRut = rutMatch?.[0]?.trim() ?? null;
    void extractedRut;

    const amountMatches = fullText.match(/(?:CLP|\$)\s*([\d\.,]+)/gi);

    if (!amountMatches || amountMatches.length === 0) {
      throw new BadRequestException('amount not found in email body');
    }

    const cleaned = amountMatches[0]
      .replace(/CLP|\$/gi, '')
      .replace(/[^\d]/g, '');

    const amount = parseInt(cleaned, 10);

    if (!amount || amount <= 0) {
      throw new BadRequestException('invalid amount');
    }

    if (!extractedEmail) {
      throw new BadRequestException(
        'email not found in email body for SaaS matching',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { email: extractedEmail },
      include: {
        account: {
          select: {
            id: true,
            planPrice: true,
            billingStatus: true,
          },
        },
      },
    });

    if (!user || !user.accountId || !user.account) {
      throw new BadRequestException('no matching user found from email');
    }

    const accountId = user.accountId;
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

    const payment = await this.prisma.accountPayment.create({
      data: {
        accountId,
        amount,
        method: 'transferencia',
        channel: 'email',
        reference: referenceKey,
        status: 'received',
      },
    });

    if (user.account.planPrice === amount) {
      const now = new Date();
      const nextPaymentDueAt = new Date(now);
      nextPaymentDueAt.setMonth(nextPaymentDueAt.getMonth() + 1);

      await this.prisma.$transaction(async (tx) => {
        await tx.accountPayment.update({
          where: { id: payment.id },
          data: {
            status: 'approved',
            approvedAt: now,
            approvedBy: 'auto-email',
          },
        });

        await tx.account.update({
          where: { id: accountId },
          data: {
            billingStatus: 'active',
            billingStartedAt: now,
            lastPaymentAt: now,
            nextPaymentDueAt,
          },
        });
      });

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

    if (payment.status === 'approved') {
      throw new BadRequestException('payment already approved');
    }

    const now = new Date();
    const nextPaymentDueAt = new Date(now);
    nextPaymentDueAt.setMonth(nextPaymentDueAt.getMonth() + 1);

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
          lastPaymentAt: now,
          nextPaymentDueAt,
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