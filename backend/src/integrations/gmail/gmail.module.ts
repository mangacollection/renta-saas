import { Module } from "@nestjs/common";
import { GmailController } from "./gmail.controller";
import { GmailService } from "./gmail.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [GmailController],
  providers: [GmailService, PrismaService],
})
export class GmailModule {}
