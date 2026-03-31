import { Body, Controller, Get, Post, Query, Headers, ForbiddenException } from '@nestjs/common';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly service: InvoicesService) {}

  @Post('generate-month')
  generateMonth(@Body() body: { period: string; accountId?: string }) {
    return this.service.generateForMonth(body);
  }

  @Post()
  create(@Body() body: { subscriptionId: string; period: string; dueDate?: string }) {
    return this.service.createFromSubscription(body);
  }

  @Get()
  list(@Query('subscriptionId') subscriptionId: string) {
    return this.service.listBySubscription(subscriptionId);
  }

  @Post('generate-month-auto')
  generateMonthAuto(
    @Body() body: { accountId?: string },
    @Headers('x-billing-secret') secret: string,
  ) {
    if (!secret || secret !== process.env.BILLING_SECRET) {
      throw new ForbiddenException('Invalid billing secret');
    }

    return this.service.generateMonthlyAuto(body);
  }
}