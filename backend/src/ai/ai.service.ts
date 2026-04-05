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

    // 1️⃣ Intento con Gemini
    try {
      const message = await this.geminiProvider.generateText(prompt);
      return { message };
    } catch (error) {
      this.logger.warn('Gemini failed, trying OpenAI...');
    }

    // 2️⃣ Fallback a OpenAI
    try {
      const message = await this.openAiProvider.generateText(prompt);
      return { message };
    } catch (error) {
      this.logger.error('OpenAI fallback failed');
    }

    // 3️⃣ Fallback final seguro
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

  // 🚀 NUEVO: generación de email de cobranza con IA
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
- Máximo 120 palabras en el mensaje
- No usar markdown
- No usar listas
- No sonar robótico ni legalista
- Debe invitar a pagar ahora

Debes devolver JSON válido con:
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
Fecha de vencimiento: ${input.dueDate}
Estado: ${input.billingStatus}
Tipo de recordatorio: ${input.reminderType}

Reglas adicionales:
- Si es past_due → más directo
- Si es before → más preventivo
- CTA debe ser corto (ej: "Pagar ahora")
- transferNote debe invitar a transferencia como alternativa

Entrega SOLO el JSON.
`;

    // 1️⃣ Intento Gemini
    try {
      const raw = await this.geminiProvider.generateText(prompt);
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (error) {
      this.logger.warn('Gemini email failed, trying OpenAI...');
    }

    // 2️⃣ Fallback OpenAI
    try {
      const raw = await this.openAiProvider.generateText(prompt);
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (error) {
      this.logger.error('OpenAI email fallback failed');
    }

    // 3️⃣ Fallback seguro (CRÍTICO)
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

Te recomendamos regularizarlo para evitar interrupciones.`,
      ctaLabel: 'Pagar ahora',
      transferNote:
        'También puedes pagar mediante transferencia bancaria indicando tu cuenta.',
    };
  }
}