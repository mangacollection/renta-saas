import { google } from "googleapis";

export function createTenantGmailClient() {
  const clientId = process.env.TENANT_GMAIL_CLIENT_ID;
  const clientSecret = process.env.TENANT_GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.TENANT_GMAIL_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing TENANT_GMAIL OAuth env variables");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}
