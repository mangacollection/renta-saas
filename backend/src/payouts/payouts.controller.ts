import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly service: PayoutsService) {}

  @Get('pending')
  listPending(@Query('accountId') accountId?: string) {
    return this.service.listPending(accountId);
  }

  @Patch('paid-out')
  markPaidOut(@Body() body: { ledgerEntryId: string; reference?: string; paidOutAt?: string }) {
    return this.service.markPaidOut(body);
  }
}
