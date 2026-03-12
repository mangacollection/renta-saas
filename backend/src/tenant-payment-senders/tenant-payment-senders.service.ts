import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantPaymentSendersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(input: { accountId: string; email: string }) {
    const { accountId, email } = input;

    const normalizedEmail = email.trim().toLowerCase();

    return this.prisma.tenantPaymentSender.findFirst({
      where: {
        accountId,
        email: normalizedEmail,
      },
      include: {
        tenant: {
          include: {
            subscription: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
