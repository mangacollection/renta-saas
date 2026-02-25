import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const CurrentAccountId = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const firebaseUser = req.user;
    const email: string | undefined = firebaseUser?.email;

    if (!email) throw new UnauthorizedException('Token has no email');

    // PrismaService lo tenemos en req.app (Nest container)
    const prisma: PrismaService = req.app.get(PrismaService);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new ForbiddenException('User not onboarded in platform');

    return user.accountId;
  },
);
