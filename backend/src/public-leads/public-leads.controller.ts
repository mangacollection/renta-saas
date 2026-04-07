import { Body, Controller, Post } from '@nestjs/common';
import { CreatePublicLeadDto } from './dto/create-public-lead.dto';
import { PublicLeadsService } from './public-leads.service';

@Controller('public/leads')
export class PublicLeadsController {
  constructor(private readonly publicLeadsService: PublicLeadsService) {}

  @Post()
  create(@Body() dto: CreatePublicLeadDto) {
    return this.publicLeadsService.create(dto);
  }
}