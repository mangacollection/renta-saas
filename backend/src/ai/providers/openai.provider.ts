import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);

  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
  });

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: 'gpt-4.1-mini',
        input: prompt,
      });

      return response.output_text;
    } catch (error) {
      this.logger.error('OpenAI error', error);
      throw error;
    }
  }
}