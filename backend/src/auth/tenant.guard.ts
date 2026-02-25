import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firebaseAdmin } from './firebase';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '').trim();

    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decoded;

    const email = decoded?.email;
    if (!email) throw new UnauthorizedException('Token has no email');

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new ForbiddenException('User not onboarded in platform');

    req.accountId = user.accountId;
    return true;
  }
}
