import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { PayoutsModule } from './payouts/payouts.module';
import { AuthModule } from './auth/auth.module';
import { TenantGuard } from './auth/tenant.guard';
@Module({
  imports: [PrismaModule, AdminModule, SubscriptionsModule, InvoicesModule, PaymentsModule, PayoutsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, TenantGuard],
})
export class AppModule {}
