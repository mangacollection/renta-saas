import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { AccountBillingJob } from '../automation/account-billing.job';
import { AccountReminderJob } from '../automation/account-reminder.job';

@UseGuards(FirebaseAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly accountBillingJob: AccountBillingJob,
    private readonly accountReminderJob: AccountReminderJob,
  ) {}

  @Post('run-billing-job')
  runBillingJob() {
    return this.accountBillingJob.run();
  }

  @Post('run-reminder-job')
  runReminderJob() {
    return this.accountReminderJob.run();
  }

  @Patch('accounts/:id/billing')
  updateBillingStatus(
    @Param('id') id: string,
    @Body() body: { billingStatus: 'trial' | 'active' | 'past_due' },
    @Req() req: any,
  ) {
    return this.adminService.updateBillingStatus(
      id,
      body.billingStatus,
      req.user,
    );
  }

  @Post('accounts')
  createAccount(
    @Body()
    body: {
      email: string;
      phone?: string;
      rut?: string;
      plan: string;
      planPrice: number;
    },
  ) {
    return this.adminService.createAccountManual(body);
  }

  @Post('users/onboard')
  onboardUser(@Body() body: { email: string; accountId: string }) {
    return this.adminService.onboardUser(body);
  }

  @Get('accounts')
  listAccounts() {
    return this.adminService.listAccounts();
  }

  @Post('owners')
  createOwner(
    @Body()
    body: {
      accountName: string;
      ownerEmail: string;
      maxSubscriptions?: number;
      ownerPhone?: string;
    },
  ) {
    return this.adminService.createOwnerAccount(body);
  }

  @Post('account-payments')
  createAccountPayment(
    @Body()
    body: {
      accountId: string;
      amount: number;
      method: string;
      channel?: string;
      reference?: string;
    },
  ) {
    return this.adminService.createAccountPayment(body);
  }

  @Post('account-payments/from-email')
  createAccountPaymentFromEmail(
    @Body() body: { from: string; subject: string; body: string },
  ) {
    return this.adminService.createAccountPaymentFromEmail(body);
  }

  @Patch('account-payments/:id/approve')
  approveAccountPayment(@Param('id') id: string) {
    return this.adminService.approveAccountPayment(id);
  }

  @Get('account-payments')
  listAccountPayments(@Query('status') status?: string) {
    return this.adminService.listAccountPayments(status);
  }

  @Get('accounts/overview')
  getAccountsOverview() {
    return this.adminService.listAccountsOverview();
  }
}