import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantPaymentsService } from './tenant-payments.service';
import { TenantGuard } from '../auth/tenant.guard';
import { AccountId } from '../auth/account-id.decorator';

@UseGuards(TenantGuard)
@Controller('tenant-payments')
export class TenantPaymentsController {
  constructor(private readonly service: TenantPaymentsService) {}
  
  @Get()
list(@AccountId() accountId: string) {
  return this.service.listByAccount(accountId);
}

  @Post('test')
  async testPayment(
    @Body()
    body: {
      accountId: string;
      tenantId: string;
      amount: number;
      channel: string;
      reference?: string;
    },
  ) {
    return this.service.register({
      accountId: body.accountId,
      tenantId: body.tenantId,
      amount: body.amount,
      channel: body.channel,
      reference: body.reference,
    });
  }

  @Post('from-bank-email')
  async fromBankEmail(
    @Body()
    body: {
      accountId: string;
      from: string;
      amount: number;
      reference?: string;
      rawMessage?: string;
    },
  ) {
    return this.service.registerFromBankEmail({
      accountId: body.accountId,
      from: body.from,
      amount: body.amount,
      reference: body.reference,
      rawMessage: body.rawMessage,
    });
  }
}