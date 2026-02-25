import { Body, Controller, Get, Post, Query } from '@nestjs/common';
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
}
