import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { parseBankAmount } from '../../common/utils/parse-bank-amount';
import { TenantPaymentSendersService } from '../../tenant-payment-senders/tenant-payment-senders.service';
import { TenantPaymentsService } from '../../tenant-payments/tenant-payments.service';
import { createTenantGmailClient } from './gmail.client';

function decodeGmailBody(data?: string | null) {
  if (!data) return '';

  return Buffer.from(
    data.replace(/-/g, '+').replace(/_/g, '/'),
    'base64',
  ).toString('utf8');
}

function extractPlainTextFromPayload(payload: any): string {
  if (!payload) return '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeGmailBody(payload.body.data);
  }

  if (payload.parts?.length) {
    for (const part of payload.parts) {
      const text = extractPlainTextFromPayload(part);
      if (text) return text;
    }
  }

  if (payload.body?.data) {
    return decodeGmailBody(payload.body.data);
  }

  return '';
}

function normalizeEmailAddress(value?: string | null) {
  if (!value) return null;

  const match = value.match(/<([^>]+)>/);
  const email = (match?.[1] ?? value).trim().toLowerCase();

  return email || null;
}

function buildRawMessageText(input: {
  from?: string | null;
  to?: string | null;
  deliveredTo?: string | null;
  subject?: string | null;
  body?: string | null;
}) {
  return [
    `From: ${input.from ?? ''}`,
    `To: ${input.to ?? ''}`,
    `Delivered-To: ${input.deliveredTo ?? ''}`,
    `Subject: ${input.subject ?? ''}`,
    '',
    input.body ?? '',
  ].join('\n');
}

@Injectable()
export class GmailWorker {
  private readonly logger = new Logger(GmailWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantPaymentSendersService: TenantPaymentSendersService,
    private readonly tenantPaymentsService: TenantPaymentsService,
  ) {}

  @Cron('*/30 * * * * *')
  async processPendingJobs() {
    this.logger.debug('GmailWorker tick');
    this.logger.log('GmailWorker tick');

    const job = await this.prisma.gmailWebhookJob.findFirst({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });

    if (!job) {
      return;
    }

    try {
      const gmail = createTenantGmailClient();

      this.logger.log(
        `Initialized tenant Gmail client for historyId=${job.historyId}`,
      );

      await this.prisma.gmailWebhookJob.update({
        where: { id: job.id },
        data: {
          status: 'processing',
          attempts: { increment: 1 },
          lastError: null,
        },
      });

      this.logger.log(
        `Marked GmailWebhookJob as processing id=${job.id} historyId=${job.historyId}`,
      );

      const historyResponse = await gmail.users.history.list({
        userId: 'me',
        startHistoryId: job.historyId,
        historyTypes: ['messageAdded'],
      });

      const historyEntries = historyResponse.data.history ?? [];
      const addedMessages = historyEntries.flatMap((entry) =>
        (entry.messagesAdded ?? []).map((item) => item.message).filter(Boolean),
      );

      const messageIds = Array.from(
        new Set(
          addedMessages
            .map((message) => message?.id)
            .filter((id): id is string => Boolean(id)),
        ),
      );

      this.logger.log(
        `Gmail history fetched historyId=${job.historyId} entries=${historyEntries.length} messages=${addedMessages.length} uniqueMessageIds=${messageIds.length}`,
      );

      for (const messageId of messageIds) {
        try {
          const alreadyProcessed =
            await this.prisma.gmailProcessedMessage.findUnique({
              where: { messageId },
            });

          if (alreadyProcessed) {
            this.logger.log(
              `Skipping already processed Gmail messageId=${messageId}`,
            );
            continue;
          }

          const messageResponse = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full',
          });

          const message = messageResponse.data;
          const headers = message.payload?.headers ?? [];

          const getHeader = (name: string) =>
            headers.find(
              (header) => header.name?.toLowerCase() === name.toLowerCase(),
            )?.value ?? null;

          const fromHeader = getHeader('From');
          const toHeader = getHeader('To');
          const deliveredToHeader = getHeader('Delivered-To');
          const subjectHeader = getHeader('Subject');
          const rawBody = extractPlainTextFromPayload(message.payload);
          const bodyPreview = rawBody.replace(/\s+/g, ' ').trim().slice(0, 200);

          const targetAlias = (
            process.env.TENANT_GMAIL_TARGET_ALIAS ??
            'pagos.arriendos@rentacontrol.cl'
          ).toLowerCase();

          const headerTargets = [toHeader, deliveredToHeader]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase());

          const matchesTenantAlias = headerTargets.some((value) =>
            value.includes(targetAlias),
          );

          this.logger.log(
            `Fetched Gmail messageId=${messageId} from=${fromHeader ?? '-'} to=${toHeader ?? '-'} deliveredTo=${deliveredToHeader ?? '-'} subject=${subjectHeader ?? '-'} bodyPreview=${bodyPreview || '-'} tenantAliasMatch=${matchesTenantAlias ? 'yes' : 'no'}`,
          );

          if (!matchesTenantAlias) {
            this.logger.log(
              `Skipping Gmail messageId=${messageId} because alias does not match tenant inbox`,
            );
            continue;
          }

          const normalizedFrom = normalizeEmailAddress(fromHeader);
          const parsedAmount = parseBankAmount(rawBody);
          const rawMessage = buildRawMessageText({
            from: fromHeader,
            to: toHeader,
            deliveredTo: deliveredToHeader,
            subject: subjectHeader,
            body: rawBody,
          });

          this.logger.log(
            `Parsed Gmail messageId=${messageId} normalizedFrom=${normalizedFrom ?? '-'} parsedAmount=${parsedAmount ?? '-'} rawMessageLength=${rawMessage.length}`,
          );

          if (!normalizedFrom) {
            this.logger.warn(
              `Skipping Gmail messageId=${messageId} because sender email could not be normalized`,
            );
            continue;
          }

          const senderMapping =
            await this.tenantPaymentSendersService.findByEmail({
              accountId: 'cmm12342c0000pgkjk2myqgrz',
              email: normalizedFrom,
            });

          this.logger.log(
            `Sender mapping lookup messageId=${messageId} found=${senderMapping ? 'yes' : 'no'} accountId=${senderMapping?.accountId ?? '-'} tenantId=${senderMapping?.tenantId ?? '-'}`,
          );

          if (!senderMapping) {
            this.logger.warn(
              `Skipping Gmail messageId=${messageId} because no sender mapping exists`,
            );
            continue;
          }

          if (!parsedAmount) {
            this.logger.warn(
              `Skipping Gmail messageId=${messageId} because no bank amount could be parsed`,
            );
            continue;
          }

          const paymentResult =
            await this.tenantPaymentsService.registerFromBankEmail({
              accountId: senderMapping.accountId,
              from: normalizedFrom,
              amount: parsedAmount,
              reference: `gmail-message-${messageId}`,
              rawMessage,
            });

                   this.logger.log(
            `Tenant payment applied messageId=${messageId} applied=${paymentResult.applied ? 'yes' : 'no'} status=${paymentResult.tenantPayment.status}`,
          );

          await this.prisma.gmailProcessedMessage.create({
            data: {
              id: messageId,
              messageId,
            },
          });

          this.logger.log(
            `Marked GmailProcessedMessage messageId=${messageId}`,
          );
        } catch (error: any) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);

          this.logger.error(
            `Failed processing Gmail messageId=${messageId}: ${errorMessage}`,
          );

          await this.prisma.gmailWebhookJob.update({
            where: { id: job.id },
            data: {
              lastError: `messageId=${messageId}: ${errorMessage}`.slice(0, 1000),
            },
          });
        }
      }

      await this.prisma.gmailWebhookJob.update({
        where: { id: job.id },
        data: {
          status: 'done',
        },
      });

      this.logger.log(
        `Processed GmailWebhookJob id=${job.id} historyId=${job.historyId}`,
      );
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.prisma.gmailWebhookJob.update({
        where: { id: job.id },
        data: {
          status: 'pending',
          lastError: errorMessage.slice(0, 1000),
        },
      });

      this.logger.error(
        `Failed GmailWebhookJob id=${job.id} historyId=${job.historyId}: ${errorMessage}`,
      );
    }
  }
}