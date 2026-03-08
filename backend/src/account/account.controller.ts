import { Controller, Get, UseGuards } from '@nestjs/common';

import { AccountService } from './account.service';
import { AccountId } from '../auth/account-id.decorator';
import { TenantGuard } from '../auth/tenant.guard';

@UseGuards(TenantGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('plan')
  getPlan(@AccountId() accountId: string) {
    return this.accountService.getPlan(accountId);
  }
}
