import { Controller, Get, Query } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { AutomationJob } from './automation.job';

@Controller('automation')
export class AutomationController {
  constructor(
    private readonly service: AutomationService,
    private readonly job: AutomationJob,
  ) {}

  @Get('recommendations')
  getRecommendations(@Query('accountId') accountId?: string) {
    return this.service.getRecommendations({ accountId });
  }

  @Get('run-daily')
  runDaily(@Query('accountId') accountId?: string) {
    return this.service.runDailyReview({ accountId });
  }

  @Get('run-daily-job')
  async runDailyJobNow() {
    await this.job.handleDailyAutomation();
    return { ok: true };
  }
}