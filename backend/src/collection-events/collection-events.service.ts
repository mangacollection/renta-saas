import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollectionEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    invoiceId: string;
    message: string;
  }) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: input.invoiceId },
      select: {
        id: true,
        subscription: {
          select: {
            accountId: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const accountId = invoice.subscription.accountId;

    return this.prisma.collectionEvent.create({
      data: {
        message: input.message,
        channel: 'whatsapp',
        account: {
          connect: { id: accountId },
        },
        invoice: {
          connect: { id: input.invoiceId },
        },
      },
    });
  }

  async list(invoiceId: string) {
    return this.prisma.collectionEvent.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'desc' },
    });
  }
}