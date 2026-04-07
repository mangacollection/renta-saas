import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../email/email.service';
import { PublicLeadsController } from './public-leads.controller';
import { PublicLeadsService } from './public-leads.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicLeadsController],
  providers: [PublicLeadsService, EmailService],
})
export class PublicLeadsModule {}