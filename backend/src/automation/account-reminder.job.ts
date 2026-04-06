import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AccountReminderJob {
  private readonly logger = new Logger(AccountReminderJob.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private aiService: AiService,
  ) {}

  async run() {
    const now = new Date();

    // 🔥 traer config global SaaS
    const platformConfig = await this.prisma.platformBillingConfig.findFirst();

    const accounts = await this.prisma.account.findMany({
      where: {
        OR: [{ billingStatus: 'active' }, { billingStatus: 'past_due' }],
      },
      include: {
        users: true,
      },
    });

    let sent = 0;

    for (const acc of accounts) {
      const owner = acc.users.find((u) => u.role === 'owner');
      if (!owner?.email) continue;

      const due = acc.nextPaymentDueAt;
      if (!due) continue;

      const diffDays = Math.ceil(
        (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      let reminderType: 'before_3d' | 'before_1d' | 'past_due' | null = null;

      if (acc.billingStatus === 'active') {
        if (diffDays === 3) reminderType = 'before_3d';
        if (diffDays === 1) reminderType = 'before_1d';
      }

      if (acc.billingStatus === 'past_due') {
        reminderType = 'past_due';
      }

      if (!reminderType) continue;
      if (acc.lastReminderType === reminderType) continue;

      const ownerName = owner.email;
      const planName =
        acc.plan === 'early_adopter' ? 'Early Adopter' : acc.plan;
      const amount = Number(acc.planPrice ?? 0);
      const dueDate = due.toLocaleDateString('es-CL');

      // 🔥 CONFIG DESDE PLATFORM
      const billingPhone = (platformConfig?.billingPhone ?? '').replace(
        /\D/g,
        '',
      );

      const hasBillingPhone = billingPhone.length > 0;

      const whatsappUrl = hasBillingPhone
        ? `https://wa.me/${billingPhone}?text=${encodeURIComponent(
            'Hola, quiero pagar mi suscripción de RentaControl',
          )}`
        : null;

      const bankName = platformConfig?.billingBankName || 'Por definir';
      const accountType =
        platformConfig?.billingAccountType || 'Por definir';
      const accountNumber =
        platformConfig?.billingAccountNumber || 'Por definir';
      const accountHolder =
        platformConfig?.billingAccountHolder || 'Por definir';
      const accountRut =
        platformConfig?.billingAccountRut || 'Por definir';
      const transferEmail =
        platformConfig?.billingTransferEmail ||
        process.env.EMAIL_FROM ||
        'Por definir';

      const aiEmail = await this.aiService.generateAccountReminderEmail({
        ownerName,
        planName: String(planName || 'Plan'),
        amount,
        dueDate,
        billingStatus: acc.billingStatus,
        reminderType,
      });

      const amountLabel = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
      }).format(amount);

      const html = `
        <div style="margin:0; padding:24px; background:#f8fafc;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:20px; overflow:hidden; font-family:Arial, Helvetica, sans-serif;">
            
            <div style="padding:24px 24px 12px 24px; background:${
              reminderType === 'past_due' ? '#fee2e2' : '#eef2ff'
            }; border-bottom:1px solid ${
        reminderType === 'past_due' ? '#fecaca' : '#c7d2fe'
      };">
              <div style="font-size:12px; font-weight:700; text-transform:uppercase;">
                RentaControl
              </div>
              <h2 style="margin:10px 0 0 0;">
                ${this.escapeHtml(aiEmail.title)}
              </h2>
            </div>

            <div style="padding:24px;">
              <p style="white-space:pre-line;">
                ${this.escapeHtml(aiEmail.message)}
              </p>

              <div style="margin:20px 0;">
                <div><strong>Plan:</strong> ${this.escapeHtml(planName)}</div>
                <div><strong>Monto:</strong> ${this.escapeHtml(amountLabel)}</div>
                <div><strong>Fecha:</strong> ${this.escapeHtml(dueDate)}</div>
              </div>

              ${
                whatsappUrl
                  ? `
              <div style="margin:24px 0;">
                <a href="${whatsappUrl}" style="background:#25d366; color:white; padding:12px 18px; border-radius:999px; text-decoration:none;">
                  💬 Coordinar pago ahora
                </a>
              </div>
              `
                  : `
              <div style="color:red;">
                Falta configurar billingPhone en plataforma
              </div>
              `
              }

              <div style="margin-top:12px;">
                <div><strong>Banco:</strong> ${this.escapeHtml(bankName)}</div>
                <div><strong>Tipo:</strong> ${this.escapeHtml(accountType)}</div>
                <div><strong>N°:</strong> ${this.escapeHtml(accountNumber)}</div>
                <div><strong>Titular:</strong> ${this.escapeHtml(accountHolder)}</div>
                <div><strong>RUT:</strong> ${this.escapeHtml(accountRut)}</div>
                <div><strong>Email:</strong> ${this.escapeHtml(transferEmail)}</div>
              </div>
            </div>
          </div>
        </div>
      `;

    await this.emailService.sendEmail({
      to: owner.email,
      subject: aiEmail.subject,
      html,
      type: reminderType,
      accountId: acc.id,
    });

      await this.prisma.account.update({
        where: { id: acc.id },
        data: {
          lastReminderSentAt: now,
          lastReminderType: reminderType,
        },
      });

      sent++;
    }

    return { sent };
  }

  private escapeHtml(value: string) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}