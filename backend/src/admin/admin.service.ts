import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createOwnerAccount(input: {
    accountName: string;
    ownerEmail: string;
    maxSubscriptions?: number;
  }) {
    const { accountName, ownerEmail, maxSubscriptions } = input;

    const existing = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    return this.prisma.account.create({
      data: {
        name: accountName,
        maxSubscriptions: maxSubscriptions ?? 5,
        users: {
          create: {
            email: ownerEmail,
            role: 'owner',
          },
        },
      },
      include: { users: true },
    });
  }

  async onboardUser(input: { email: string; accountId: string }) {
    const { email, accountId } = input;

    if (!email) throw new BadRequestException('email is required');
    if (!accountId) throw new BadRequestException('accountId is required');

    return this.prisma.user.upsert({
      where: { email },
      update: {
        accountId,
      },
      create: {
        email,
        accountId,
        role: 'owner',
      },
    });
  }
}
