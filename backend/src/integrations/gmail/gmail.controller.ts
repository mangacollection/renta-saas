import { Body, Controller, Post } from "@nestjs/common";
import { GmailService } from "./gmail.service";

@Controller("integrations/gmail")
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Post("webhook")
  async webhook(@Body() body: any) {
    await this.gmailService.enqueueFromPubSub(body);
    return { ok: true };
  }
}
