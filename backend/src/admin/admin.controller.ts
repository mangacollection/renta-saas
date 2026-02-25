import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('users/onboard')
  onboardUser(@Body() body: { email: string; accountId: string }) {
    return this.adminService.onboardUser(body);
  }

  @Post('owners')
  createOwner(
    @Body()
    body: { accountName: string; ownerEmail: string; maxSubscriptions?: number },
  ) {
    return this.adminService.createOwnerAccount(body);
  }
}
