import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Delete,
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

      @Delete('items/:id')
    deleteItem(
      @Param('id') id: string,
      @AccountId() accountId: string,
    ) {
      return this.service.deleteItem(id, accountId);
    }

      @Patch('items/:id')
    updateItem(
      @Param('id') id: string,
      @AccountId() accountId: string,
      @Body() body: { name?: string; amount?: number },
    ) {
      return this.service.updateItem(id, body, accountId);
    }

  @Patch('activate')
  activate(@Body() body: { subscriptionId: string }) {
    return this.service.activate(body.subscriptionId);
  }
}
