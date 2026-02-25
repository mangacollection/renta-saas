import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { TenantGuard } from '../auth/tenant.guard';
import { AccountId } from '../auth/account-id.decorator';

@UseGuards(TenantGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get()
  list(@AccountId() accountId: string) {
    return this.service.listByAccount(accountId);
  }

  @Post()
  create(
    @AccountId() accountId: string,
    @Body()
    body: {
      tenantName: string;
      tenantRut?: string;
      tenantEmail?: string;
      billingDay?: number;
      startDate?: string;
    },
  ) {
    return this.service.createSubscription({ accountId, ...body });
  }

  @Post('items')
  addItem(
    @Body()
    body: {
      subscriptionId: string;
      type: string;
      name: string;
      amount: number;
    },
  ) {
    return this.service.addItem(body);
  }

  @Patch('activate')
  activate(@Body() body: { subscriptionId: string }) {
    return this.service.activate(body.subscriptionId);
  }
}
