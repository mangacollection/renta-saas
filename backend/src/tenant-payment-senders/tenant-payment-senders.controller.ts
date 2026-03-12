import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantGuard } from '../auth/tenant.guard';
import { AccountId } from '../auth/account-id.decorator';

@UseGuards(TenantGuard)
@Controller('tenant-payment-senders')
export class TenantPaymentSendersController {
  constructor(private readonly prisma: PrismaService) {}

@Post()
async create(
  @AccountId() accountId: string,
  @Body()
  body: {
    tenantId: string;
    email: string;
    bank?: string;
  },
) {
  const normalizedEmail = body.email.trim().toLowerCase();

  const sender = await this.prisma.tenantPaymentSender.create({
    data: {
      accountId,
      tenantId: body.tenantId,
      email: normalizedEmail,
      bank: body.bank ?? null,
    },
  });

  return sender;
}
}
