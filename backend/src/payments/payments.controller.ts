import { Body, Controller, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly service: PaymentsService) {}

  @Post()
  register(@Body() body: {
    invoiceId: string;
    method: 'transferencia' | 'link_pago' | 'efectivo';
    amount: number;
    note?: string;
    platformFee?: number;
  }) {
    return this.service.registerPayment(body);
  }
}
