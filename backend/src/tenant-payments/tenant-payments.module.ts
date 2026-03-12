import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPaymentSendersModule } from '../tenant-payment-senders/tenant-payment-senders.module';
import { TenantPaymentsService } from './tenant-payments.service';
import { TenantPaymentsController } from './tenant-payments.controller';

@Module({
  imports: [TenantPaymentSendersModule],
  controllers: [TenantPaymentsController],
  providers: [TenantPaymentsService, PrismaService],
  exports: [TenantPaymentsService],
})
export class TenantPaymentsModule {}
