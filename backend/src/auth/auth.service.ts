import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        role: true,
        accountId: true,
      },
    });
  }
}