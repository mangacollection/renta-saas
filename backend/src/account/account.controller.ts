import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';
import { AccountId } from '../auth/account-id.decorator';
import { TenantGuard } from '../auth/tenant.guard';
import { CurrentFirebaseUser } from '../auth/current-firebase-user.decorator';

@UseGuards(TenantGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('plan')
  getPlan(@AccountId() accountId: string) {
    return this.accountService.getPlan(accountId);
  }

  @Get('profile')
  getProfile(@CurrentFirebaseUser() firebaseUser: { email?: string }) {
    return this.accountService.getProfile(firebaseUser?.email ?? '');
  }

  @Patch('profile')
  updateProfile(
    @CurrentFirebaseUser() firebaseUser: { email?: string },
    @Body('phone') phone?: string,
  ) {
    return this.accountService.updateProfile(firebaseUser?.email ?? '', phone);
  }
}