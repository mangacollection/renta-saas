import { Controller, Get, Query, Res, Body, Post } from "@nestjs/common";
import * as express from "express";
import { GmailService } from "./gmail.service";

@Controller("integrations/gmail")
export class GmailController {
  constructor(private readonly gmailService: GmailService) {}

  @Get("oauth/start")
 async startOAuth(@Res() res: express.Response) {
    const url = this.gmailService.getOAuthUrl();
    return res.redirect(url);
  }

  @Get("oauth/callback")
  async oauthCallback(@Query("code") code: string) {
    return this.gmailService.exchangeCodeForTokens(code);
  }

  @Post("webhook")
  async webhook(@Body() body: any) {
    await this.gmailService.enqueueFromPubSub(body);
    return { ok: true };
  }
}