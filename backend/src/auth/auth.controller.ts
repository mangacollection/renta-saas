import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const email = req.user?.email;

    const user = await this.authService.getUserByEmail(email);

    return user;
  }
}