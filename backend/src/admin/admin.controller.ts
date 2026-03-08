import { Body, Controller, Get, Post, Patch, Param } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService } from './admin.service';
import { UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { Query } from '@nestjs/common';
@UseGuards(FirebaseAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
@Get("accounts/overview")
getAccountsOverview() {
  return this.adminService.listAccountsOverview();
}
}
