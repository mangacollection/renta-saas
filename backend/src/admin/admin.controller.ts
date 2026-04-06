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
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(FirebaseAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly accountBillingJob: AccountBillingJob,
    private readonly accountReminderJob: AccountReminderJob,
    private readonly prisma: PrismaService,
  ) {}

  @Get('pricing-stats')
getPricingStats() {
  return this.adminService.getPricingStats();
}

  @Post('pricing')
createPricing(
  @Body()
  body: {
    plan: string;
    pricingCode: string;
    pricingLabel: string;
    price: number;
    isActive?: boolean;
  },
) {
  return this.adminService.createPricing(body);
}

@Get('pricing')
listPricing(@Query('plan') plan?: string) {
  return this.adminService.listPricing(plan);
}
  // 🔴 NUEVO ENDPOINT (WHATSAPP AI)
  @Post('generate-whatsapp-message')
  generateWhatsAppMessage() {
    return this.adminService.generateWhatsAppMessage();
  }

  @Post('run-billing-job')
  runBillingJob() {
    return this.accountBillingJob.run();
  }

  @Post('run-reminder-job')
  runReminderJob() {
    return this.accountReminderJob.run();
  }

  @Get('email-logs')
  getEmailLogs(@Query('status') status?: string, @Query('take') take?: string) {
    return this.prisma.emailLog.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: take ? Number(take) : 50,
    });
  }

  @Get('platform-billing-config')
  getPlatformBillingConfig() {
    return this.adminService.getPlatformBillingConfig();
  }

  @Patch('platform-billing-config')
  updatePlatformBillingConfig(
    @Body()
    body: {
      billingPhone?: string;
      billingBankName?: string;
      billingAccountType?: string;
      billingAccountNumber?: string;
      billingAccountHolder?: string;
      billingAccountRut?: string;
      billingTransferEmail?: string;
    },
  ) {
    return this.adminService.updatePlatformBillingConfig(body);
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

  @Get('accounts/:id/billing-config')
  getBillingConfig(@Param('id') id: string) {
    return this.adminService.getAccountBillingConfig(id);
  }

  @Patch('accounts/:id/billing-config')
  updateBillingConfig(
    @Param('id') id: string,
    @Body()
    body: {
      billingPhone?: string;
      billingBankName?: string;
      billingAccountType?: string;
      billingAccountNumber?: string;
      billingAccountHolder?: string;
      billingAccountRut?: string;
      billingTransferEmail?: string;
    },
  ) {
    return this.adminService.updateAccountBillingConfig(id, body);
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
      firstName?: string;
      lastName?: string;
      billingStatus?: 'trial' | 'active';
      trialDays?: number;
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