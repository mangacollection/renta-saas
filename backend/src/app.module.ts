import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TenantGuard } from './auth/tenant.guard';
import { InvoicesModule } from './invoices/invoices.module';
import { PaymentsModule } from './payments/payments.module';
import { TenantPaymentsModule } from './tenant-payments/tenant-payments.module';
import { PayoutsModule } from './payouts/payouts.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { GmailModule } from './integrations/gmail/gmail.module';
import { AiModule } from './ai/ai.module';
import { CollectionEventsModule } from './collection-events/collection-events.module';


// ✅ NUEVO
import { EmailService } from './email/email.service';
import { AccountReminderJob } from './automation/account-reminder.job';

import { PublicLeadsModule } from './public-leads/public-leads.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AdminModule,
    AccountModule,
    SubscriptionsModule,
    InvoicesModule,
    PaymentsModule,
    TenantPaymentsModule,
    PayoutsModule,
    AuthModule,
    GmailModule,
    AiModule,
    CollectionEventsModule,
    PublicLeadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantGuard,

    // ✅ NUEVO
    EmailService,
    AccountReminderJob,
  ],
})
export class AppModule {}