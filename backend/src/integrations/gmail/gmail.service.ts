import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { google } from "googleapis";

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  getOAuthUrl() {
    const clientId = process.env.TENANT_GMAIL_CLIENT_ID;
    const clientSecret = process.env.TENANT_GMAIL_CLIENT_SECRET;
    const redirectUri =
      process.env.TENANT_GMAIL_REDIRECT_URI ||
      "https://api.rentacontrol.cl/integrations/gmail/oauth/callback";

    if (!clientId || !clientSecret) {
      throw new BadRequestException("Missing TENANT_GMAIL OAuth client env variables");
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    });
  }

  async exchangeCodeForTokens(code: string) {
    if (!code) {
      throw new BadRequestException("Missing code");
    }

    const clientId = process.env.TENANT_GMAIL_CLIENT_ID;
    const clientSecret = process.env.TENANT_GMAIL_CLIENT_SECRET;
    const redirectUri =
      process.env.TENANT_GMAIL_REDIRECT_URI ||
      "https://api.rentacontrol.cl/integrations/gmail/oauth/callback";

    if (!clientId || !clientSecret) {
      throw new BadRequestException("Missing TENANT_GMAIL OAuth client env variables");
    }

    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri,
    );

    const { tokens } = await oauth2Client.getToken(code);

    return {
      ok: true,
      hasRefreshToken: Boolean(tokens.refresh_token),
      refreshToken: tokens.refresh_token ?? null,
      scope: tokens.scope ?? null,
      expiryDate: tokens.expiry_date ?? null,
    };
  }

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