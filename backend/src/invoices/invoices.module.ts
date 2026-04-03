import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { AutomationService } from '../automation/automation.service';
import { AutomationController } from '../automation/automation.controller';
import { AutomationJob } from '../automation/automation.job';

@Module({
  providers: [InvoicesService, AutomationService, AutomationJob],
  controllers: [InvoicesController, AutomationController],
  exports: [InvoicesService, AutomationService],
})
export class InvoicesModule {}