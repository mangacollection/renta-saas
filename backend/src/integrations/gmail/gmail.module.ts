import { Module } from "@nestjs/common";
import { GmailController } from "./gmail.controller";
import { GmailService } from "./gmail.service";
import { GmailWorker } from "./gmail.worker";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantPaymentSendersModule } from "../../tenant-payment-senders/tenant-payment-senders.module";
import { TenantPaymentsModule } from "../../tenant-payments/tenant-payments.module";

@Module({
  imports: [TenantPaymentSendersModule, TenantPaymentsModule],
  controllers: [GmailController],
  providers: [GmailService, GmailWorker, PrismaService],
})
export class GmailModule {}