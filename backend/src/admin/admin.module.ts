import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountBillingJob } from '../automation/account-billing.job';
import { AccountReminderJob } from '../automation/account-reminder.job';
import { EmailService } from '../email/email.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AccountBillingJob,
    AccountReminderJob,
    EmailService,
  ],
  exports: [AdminService],
})
export class AdminModule {}