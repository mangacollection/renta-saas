import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerPayment(input: {
    invoiceId: string;
    method: 'transferencia' | 'link_pago' | 'efectivo';
    amount: number;
    note?: string;
    platformFee?: number; // opcional MVP
  }) {
    const { invoiceId, method, amount, note, platformFee } = input;

    if (!invoiceId) throw new BadRequestException('invoiceId is required');
    if (!method) throw new BadRequestException('method is required');
    if (amount == null || Number.isNaN(amount)) throw new BadRequestException('amount is required');

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { subscription: true },
    });

    if (!invoice) throw new BadRequestException('Invoice not found');

    // Pago + actualizar invoice + ledger en una transacción
    const fee = Math.trunc(platformFee ?? 0);
    const gross = Math.trunc(amount);
    const net = gross - fee;

    if (net < 0) throw new BadRequestException('platformFee cannot exceed amount');

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          method,
          amount: gross,
          note: note || null,
        },
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'paid' },
      });

      const ledger = await tx.ledgerEntry.create({
        data: {
          accountId: invoice.subscription.accountId,
          invoiceId: invoiceId,
          grossAmount: gross,
          platformFee: fee,
          netAmount: net,
          status: 'pending_payout',
        },
      });

      return { payment, invoice: updatedInvoice, ledger };
    });
  }
}
