import { Module } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [TenantGuard, AuthService],
  exports: [TenantGuard],
})
export class AuthModule {}