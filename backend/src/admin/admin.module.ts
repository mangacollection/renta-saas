import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountBillingJob } from '../automation/account-billing.job';
import { AccountReminderJob } from '../automation/account-reminder.job';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, AccountBillingJob, AccountReminderJob],
  exports: [AdminService],
})
export class AdminModule {}