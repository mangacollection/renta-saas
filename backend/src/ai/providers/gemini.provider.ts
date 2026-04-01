import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiProvider {
  private readonly logger = new Logger(GeminiProvider.name);

  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

  async generateText(prompt: string): Promise<string> {
    try {
      //throw new Error('FORCE GEMINI FAIL');
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      const text = response.text();

      return text;
    } catch (error) {
      this.logger.error('Gemini error', error);
      throw error;
    }
  }
}