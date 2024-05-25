import { Module } from '@nestjs/common';
import { VideoManagerService } from './video-manager.service';
import { VideoManagerController } from './video-manager.controller';

@Module({
  controllers: [VideoManagerController],
  providers: [VideoManagerService],
})
export class VideoManagerModule {}
