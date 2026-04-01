import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('collection-message')
  generateCollectionMessage(@Body() body: any) {
    return this.aiService.generateCollectionMessage(body);
  }
}