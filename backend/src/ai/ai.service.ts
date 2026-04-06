import { Injectable, Logger } from '@nestjs/common';
import {
  GenerateCollectionMessageInput,
  GenerateAccountReminderEmailInput,
  GenerateAccountReminderEmailResult,
} from './ai.types';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly openAiProvider: OpenAiProvider,
  ) {}

  async generateCollectionMessage(
    input: GenerateCollectionMessageInput,
  ): Promise<{ message: string }> {
    this.logger.log('generateCollectionMessage called');

    const prompt = `
Eres un asistente de cobranza para arriendos en Chile.

Genera un mensaje de WhatsApp claro, humano y fácil de leer.

Reglas:
- Español chileno
- Tono cordial pero firme
- Máximo 90 palabras
- Sin markdown
- No usar listas
- Usar saltos de línea para dar aire (máx 3 párrafos)
- Sonar como una persona real, no como carta formal

Datos:
Nombre: ${input.tenantName}
Monto: ${input.amount}
Días de atraso: ${input.daysLate}
Fecha de vencimiento: ${input.dueDate}
Propiedad: ${input.propertyName}

Si daysLate > 0:
mensaje directo por atraso

Si daysLate <= 0:
recordatorio amable

Entrega SOLO el mensaje final.
`;

    try {
      const message = await this.geminiProvider.generateText(prompt);
      return { message };
    } catch {
      this.logger.warn('Gemini failed, trying OpenAI...');
    }

    try {
      const message = await this.openAiProvider.generateText(prompt);
      return { message };
    } catch {
      this.logger.error('OpenAI fallback failed');
    }

    const fallback = `Hola ${input.tenantName},

Te escribo por el arriendo de ${input.propertyName}.

El monto de $${input.amount} ${
      input.daysLate > 0
        ? `presenta ${input.daysLate} días de atraso`
        : `vence el ${input.dueDate}`
    }.

Por favor, revisa y me confirmas. Gracias.`;

    return { message: fallback };
  }

  // 🔴 NUEVO MÉTODO (WHATSAPP SAAS)
  async generateWhatsAppPaymentMessage(): Promise<{ message: string }> {
    this.logger.log('generateWhatsAppPaymentMessage called');

    const prompt = `
Eres un asistente de cobranza SaaS en Chile.

Genera un mensaje de WhatsApp para cobrar una suscripción.

Reglas:
- Español chileno
- Tono cercano pero profesional
- Máximo 60 palabras
- Sin markdown
- No listas
- Debe invitar a pagar ahora
- Sonar humano (no robot)

Entrega SOLO el mensaje.
`;

    // 1️⃣ Gemini
    try {
      const message = await this.geminiProvider.generateText(prompt);
      if (message && message.length > 10) {
        return { message };
      }
    } catch {
      this.logger.warn('Gemini WhatsApp failed, trying OpenAI...');
    }

    // 2️⃣ OpenAI
    try {
      const message = await this.openAiProvider.generateText(prompt);
      if (message && message.length > 10) {
        return { message };
      }
    } catch {
      this.logger.error('OpenAI WhatsApp fallback failed');
    }

    // 3️⃣ Fallback seguro
    return {
      message: `Hola 👋

Tu suscripción de RentaControl está pendiente de pago.

Puedes regularizarla ahora por transferencia o escribirme por aquí.

Gracias 🙌`,
    };
  }

  async generateAccountReminderEmail(
    input: GenerateAccountReminderEmailInput,
  ): Promise<GenerateAccountReminderEmailResult> {
    this.logger.log('generateAccountReminderEmail called');

    const prompt = `
Eres un asistente de cobranza SaaS en Chile.

Genera el contenido de un correo de cobranza claro, humano y orientado a acción.

Reglas:
- Español chileno
- Tono cordial pero firme
- Máximo 120 palabras
- No markdown
- No listas
- Debe invitar a pagar ahora

Devuelve JSON:
{
  "subject": "...",
  "title": "...",
  "message": "...",
  "ctaLabel": "...",
  "transferNote": "..."
}

Datos:
Nombre: ${input.ownerName}
Plan: ${input.planName}
Monto: ${input.amount}
Fecha: ${input.dueDate}
Estado: ${input.billingStatus}
Tipo: ${input.reminderType}

Entrega SOLO JSON.
`;

    try {
      const raw = await this.geminiProvider.generateText(prompt);
      return JSON.parse(raw);
    } catch {
      this.logger.warn('Gemini email failed, trying OpenAI...');
    }

    try {
      const raw = await this.openAiProvider.generateText(prompt);
      return JSON.parse(raw);
    } catch {
      this.logger.error('OpenAI email fallback failed');
    }

    return {
      subject:
        input.reminderType === 'past_due'
          ? 'Pago pendiente - acción requerida'
          : 'Recordatorio de suscripción',
      title:
        input.reminderType === 'past_due'
          ? 'Tu suscripción está vencida'
          : 'Tu suscripción está por vencer',
      message: `Hola ${input.ownerName},

Tu plan ${input.planName} tiene un monto de $${input.amount} ${
        input.reminderType === 'past_due'
          ? 'pendiente de pago'
          : `con vencimiento el ${input.dueDate}`
      }.

Te recomendamos regularizarlo.`,
      ctaLabel: 'Pagar ahora',
      transferNote:
        'También puedes pagar mediante transferencia bancaria.',
    };
  }
}