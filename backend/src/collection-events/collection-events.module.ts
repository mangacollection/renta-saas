import { Module } from '@nestjs/common';
import { CollectionEventsService } from './collection-events.service';
import { CollectionEventsController } from './collection-events.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [CollectionEventsService, PrismaService],
  controllers: [CollectionEventsController],
})
export class CollectionEventsModule {}