import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}
 async listPending(accountId?: string) {
  return this.prisma.ledgerEntry.findMany({
    where: {
      status: 'pending_payout',
      ...(accountId ? { accountId } : {}),
    },
    orderBy: { createdAt: 'asc' },
  });
}
  async markPaidOut(input: { ledgerEntryId: string; reference?: string; paidOutAt?: string }) {
    const { ledgerEntryId, reference, paidOutAt } = input;
    if (!ledgerEntryId) throw new BadRequestException('ledgerEntryId is required');

    const existing = await this.prisma.ledgerEntry.findUnique({ where: { id: ledgerEntryId } });
    if (!existing) throw new NotFoundException('LedgerEntry not found');

    return this.prisma.ledgerEntry.update({
      where: { id: ledgerEntryId },
      data: {
        status: 'paid_out',
        reference: reference || null,
        paidOutAt: paidOutAt ? new Date(paidOutAt) : new Date(),
      },
    });
  }
}
