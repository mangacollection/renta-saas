import { Injectable, Logger } from '@nestjs/common';
import { GenerateCollectionMessageInput } from './ai.types';
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
}