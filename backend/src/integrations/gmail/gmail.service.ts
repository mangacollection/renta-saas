import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enqueueFromPubSub(payload: any) {
    const msg = payload?.message;
    const dataB64 = msg?.data;

    if (!dataB64) {
      throw new BadRequestException("Missing message.data");
    }

    let decoded: any;
    try {
      const json = Buffer.from(dataB64, "base64").toString("utf8");
      decoded = JSON.parse(json);
    } catch (e) {
      throw new BadRequestException("Invalid PubSub message.data");
    }

    const historyId = decoded?.historyId;
    if (!historyId) {
      this.logger.warn(`PubSub message without historyId: ${JSON.stringify(decoded)}`);
      return;
    }

    await this.prisma.gmailWebhookJob.create({
      data: { historyId: String(historyId) },
    });

    this.logger.log(`Enqueued GmailWebhookJob historyId=${historyId}`);
  }
}
