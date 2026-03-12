import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPaymentSendersService } from '../tenant-payment-senders/tenant-payment-senders.service';

@Injectable()
export class TenantPaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPaymentSendersService: TenantPaymentSendersService,
  ) {}

  async listByAccount(accountId: string) {
  if (!accountId) {
    throw new BadRequestException('accountId is required');
  }

  return this.prisma.tenantPayment.findMany({
    where: { accountId },
    include: {
      tenant: true,
      subscription: true,
      invoice: true,
    },
    orderBy: [
      { paidAt: 'desc' },
      { createdAt: 'desc' },
    ],
  });
}

  async register(input: {
    accountId: string;
    tenantId: string;
    amount: number;
    channel: string;
    reference?: string;
    rawMessage?: string;
    paidAt?: string;
  }) {
    const { accountId, tenantId, amount, channel, reference, rawMessage, paidAt } = input;

    if (!accountId) throw new BadRequestException('accountId is required');
    if (!tenantId) throw new BadRequestException('tenantId is required');
    if (amount == null || Number.isNaN(amount)) {
      throw new BadRequestException('amount is required');
    }
    if (!channel) throw new BadRequestException('channel is required');

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        subscription: true,
      },
    });

    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }

    if (tenant.accountId !== accountId) {
      throw new BadRequestException('Tenant does not belong to account');
    }

    const normalizedAmount = Math.trunc(amount);
    const paymentDate = paidAt ? new Date(paidAt) : new Date();

    const pendingInvoice = await this.prisma.invoice.findFirst({
      where: {
        subscriptionId: tenant.subscriptionId,
        status: 'pending',
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        payments: true,
      },
    });

    const tenantPayment = await this.prisma.tenantPayment.create({
      data: {
        accountId,
        tenantId: tenant.id,
        subscriptionId: tenant.subscriptionId,
        invoiceId: pendingInvoice?.id ?? null,
        amount: normalizedAmount,
        currency: 'CLP',
        channel,
        reference: reference ?? null,
        rawMessage: rawMessage ?? null,
        paidAt: paymentDate,
        status: 'received',
      },
    });

    if (!pendingInvoice) {
      return {
        tenantPayment,
        applied: false,
        reason: 'no_pending_invoice',
      };
    }

    const paidSoFar = pendingInvoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = pendingInvoice.total - paidSoFar;

    if (remaining <= 0) {
      return {
        tenantPayment,
        applied: false,
        reason: 'invoice_already_covered',
        invoice: pendingInvoice,
      };
    }

          if (normalizedAmount > remaining) {
      const updatedTenantPayment = await this.prisma.tenantPayment.update({
        where: { id: tenantPayment.id },
        data: {
          status: 'overpayment',
          invoiceId: pendingInvoice.id,
        },
      });

      return {
        tenantPayment: updatedTenantPayment,
        applied: false,
        reason: 'overpayment',
        invoice: pendingInvoice,
        paidSoFar,
        remaining,
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: pendingInvoice.id,
          method: 'transferencia',
          amount: normalizedAmount,
          paidAt: paymentDate,
          note: reference ?? `Tenant payment via ${channel}`,
        },
      });

      const newPaidTotal = paidSoFar + normalizedAmount;
      const invoiceStatus = newPaidTotal >= pendingInvoice.total ? 'paid' : 'pending';
      const tenantPaymentStatus =
        newPaidTotal >= pendingInvoice.total ? 'applied' : 'partial_applied';

      const invoice = await tx.invoice.update({
        where: { id: pendingInvoice.id },
        data: { status: invoiceStatus },
      });

      const updatedTenantPayment = await tx.tenantPayment.update({
        where: { id: tenantPayment.id },
        data: {
          status: tenantPaymentStatus,
          invoiceId: pendingInvoice.id,
        },
      });

      return {
        payment,
        invoice,
        tenantPayment: updatedTenantPayment,
        paidSoFar,
        remainingBeforePayment: remaining,
        remainingAfterPayment: Math.max(pendingInvoice.total - newPaidTotal, 0),
      };
    });

    return {
      ...result,
      applied: true,
      partial: result.tenantPayment.status === 'partial_applied',
    };
  }

  async registerFromBankEmail(input: {
    accountId: string;
    from: string;
    amount: number;
    reference?: string;
    rawMessage?: string;
    paidAt?: string;
  }) {
    const { accountId, from, amount, reference, rawMessage, paidAt } = input;

    if (!accountId) throw new BadRequestException('accountId is required');
    if (!from) throw new BadRequestException('from is required');
    if (amount == null || Number.isNaN(amount)) {
      throw new BadRequestException('amount is required');
    }

    const sender = await this.tenantPaymentSendersService.findByEmail({
      accountId,
      email: from,
    });

    if (!sender) {
      throw new BadRequestException('Tenant payment sender not found');
    }

    return this.register({
      accountId,
      tenantId: sender.tenantId,
      amount,
      channel: 'bank_email',
      reference,
      rawMessage,
      paidAt,
    });
  }
}