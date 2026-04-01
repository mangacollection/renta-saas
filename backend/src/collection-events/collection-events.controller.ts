import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CollectionEventsService } from './collection-events.service';

@Controller('collection-events')
export class CollectionEventsController {
  constructor(
    private readonly collectionEventsService: CollectionEventsService,
  ) {}

  @Post()
  async create(
    @Body()
    body: {
      invoiceId: string;
      message: string;
    },
  ) {
    return this.collectionEventsService.create({
      invoiceId: body.invoiceId,
      message: body.message,
    });
  }

  @Get()
  async list(@Query('invoiceId') invoiceId: string) {
    return this.collectionEventsService.list(invoiceId);
  }
}