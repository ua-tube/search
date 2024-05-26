import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UpdateVideoMetrics } from './dto';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { Index, Meilisearch } from 'meilisearch';
import { VideosIndex } from '../search/interfaces';

@Injectable()
export class HistoryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(HistoryService.name);
  private index: Index<VideosIndex>;

  constructor(
    @InjectMeiliSearch()
    private readonly meiliSearch: Meilisearch,
  ) {}

  onApplicationBootstrap(): void {
    this.index = this.meiliSearch.index<VideosIndex>('videos');
  }

  async updateVideoViewsMetrics(payload: UpdateVideoMetrics) {
    try {
      const video = await this.index.getDocument(payload.videoId);

      if (video.status === 'Unregistered') {
        this.logger.warn(`Video (${payload.videoId} is unregistered`);
        return;
      }
    } catch {
      this.logger.warn(`Video (${payload.videoId}) does not exists`);
      return;
    }

    await this.index.updateDocuments([
      {
        id: payload.videoId,
        metrics: { viewsCount: `${payload.viewsCount}` },
      },
    ]);
    this.logger.log(`Metrics update enqueued for video (${payload.videoId})`);
  }
}
