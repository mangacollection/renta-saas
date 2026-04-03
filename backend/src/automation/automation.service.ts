import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type RecommendationAction =
  | 'none'
  | 'send_reminder'
  | 'send_firm_message';

export type RecommendationPriority = 'low' | 'medium' | 'high';

export type AutomationRecommendation = {
  invoiceId: string;
  subscriptionId: string;
  action: RecommendationAction;
  priority: RecommendationPriority;
  label: string;
  reason: string;
  daysLate: number;
  dueDate: string;
  status: string;
  total: number;
};

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendations(input?: { accountId?: string }) {
    const { accountId } = input ?? {};

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: 'pending',
        ...(accountId ? { subscription: { accountId } } : {}),
      },
      orderBy: { dueDate: 'asc' },
    });

    return invoices
      .map((invoice) => this.buildRecommendation(invoice))
      .filter(
        (item): item is AutomationRecommendation =>
          item !== null && item.action !== 'none',
      );
  }

  async runDailyReview(input?: { accountId?: string }) {
    const recommendations = await this.getRecommendations(input);

    const summary = {
      reviewedAt: new Date().toISOString(),
      totalRecommendations: recommendations.length,
      mediumPriority: recommendations.filter((r) => r.priority === 'medium')
        .length,
      highPriority: recommendations.filter((r) => r.priority === 'high').length,
    };

    console.log('[AutomationEngine] daily review summary', summary);

    return {
      ...summary,
      recommendations,
    };
  }

  private buildRecommendation(invoice: {
    id: string;
    subscriptionId: string;
    dueDate: Date;
    status: string;
    total: number;
  }): AutomationRecommendation | null {
    const daysLate = this.getDaysLate(invoice.dueDate);

    if (daysLate < 3) {
      return null;
    }

    if (daysLate >= 7) {
      return {
        invoiceId: invoice.id,
        subscriptionId: invoice.subscriptionId,
        action: 'send_firm_message',
        priority: 'high',
        label: 'Enviar mensaje firme',
        reason: `Factura con ${daysLate} días de atraso`,
        daysLate,
        dueDate: invoice.dueDate.toISOString(),
        status: invoice.status,
        total: Number(invoice.total) || 0,
      };
    }

    return {
      invoiceId: invoice.id,
      subscriptionId: invoice.subscriptionId,
      action: 'send_reminder',
      priority: 'medium',
      label: 'Enviar recordatorio',
      reason: `Factura con ${daysLate} días de atraso`,
      daysLate,
      dueDate: invoice.dueDate.toISOString(),
      status: invoice.status,
      total: Number(invoice.total) || 0,
    };
  }

  private getDaysLate(dueDate: Date) {
    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffMs = today.getTime() - due.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }
}