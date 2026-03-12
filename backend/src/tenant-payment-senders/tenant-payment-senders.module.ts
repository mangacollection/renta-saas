import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantPaymentSendersService } from './tenant-payment-senders.service';
import { TenantPaymentSendersController } from './tenant-payment-senders.controller';

@Module({
  controllers: [TenantPaymentSendersController],
  providers: [TenantPaymentSendersService, PrismaService],
  exports: [TenantPaymentSendersService],
})
export class TenantPaymentSendersModule {}
