import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
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

  @Get()
  async list(@AccountId() accountId: string) {
    return this.prisma.tenantPaymentSender.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @AccountId() accountId: string,
    @Body()
    body: {
      email?: string;
      bank?: string;
    },
  ) {
    if (!id) throw new BadRequestException('id is required');

    const existing = await this.prisma.tenantPaymentSender.findFirst({
      where: {
        id,
        accountId,
      },
    });

    if (!existing) {
      throw new BadRequestException('Sender not found');
    }

    return this.prisma.tenantPaymentSender.update({
      where: { id },
      data: {
        email: body.email
          ? body.email.trim().toLowerCase()
          : existing.email,
        bank: body.bank ?? existing.bank,
      },
    });
  }
      @Delete(':id')
    async remove(
      @Param('id') id: string,
      @AccountId() accountId: string,
    ) {
      if (!id) throw new BadRequestException('id is required');

      const existing = await this.prisma.tenantPaymentSender.findFirst({
        where: {
          id,
          accountId,
        },
      });

      if (!existing) {
        throw new BadRequestException('Sender not found');
      }

      await this.prisma.tenantPaymentSender.delete({
        where: { id },
      });

      return { ok: true };
    }
}