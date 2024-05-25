import { Controller } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { UpdateVideoMetrics } from './dto';
import { ackMessage } from '../common/utils';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @EventPattern('update_video_metrics')
  async handleUpdateVideoMetrics(
    @Payload() payload: UpdateVideoMetrics,
    @Ctx() context: RmqContext,
  ) {
    await this.historyService.updateVideoMetrics(payload);
    ackMessage(context);
  }
}
