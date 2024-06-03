import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateVideoDto, UnregisterVideo, UpdateVideoDto } from './dto';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { Index, Meilisearch } from 'meilisearch';
import { VideosIndex } from '../search/interfaces';

@Injectable()
export class VideoManagerService implements OnModuleInit {
  private readonly logger = new Logger(VideoManagerService.name);
  private index: Index<VideosIndex>;

  constructor(
    @InjectMeiliSearch()
    private readonly meiliSearch: Meilisearch,
  ) {}

  onModuleInit(): void {
    this.index = this.meiliSearch.index<VideosIndex>('videos');
  }

  async createVideo(payload: CreateVideoDto) {
    this.logger.log(`Video (${payload.id}) create is called`);

    await this.index.addDocuments([
      {
        ...payload,
        metrics: { viewsCount: '0' },
      },
    ]);

    this.logger.log(`Video (${payload.id}) create is enqueued`);
  }

  async updateVideo(payload: UpdateVideoDto) {
    this.logger.log(`Video (${payload.id}) update is called`);

    try {
      const video = await this.index.getDocument(payload.id);

      if (video.status === 'Unregistered') {
        this.logger.warn(`Video (${payload.id} is unregistered`);
        return;
      }
    } catch {
      this.logger.warn(`Video (${payload.id}) does not exists`);
      return;
    }

    await this.index.updateDocuments([payload]);
    this.logger.log(`Video (${payload.id}) update is enqueued`);
  }

  async unregisterVideo(payload: UnregisterVideo) {
    this.logger.log(`Video (${payload.videoId}) unregister is called`);

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
      { id: payload.videoId, status: 'Unregistered' },
    ]);
    this.logger.log(`Video (${payload.videoId}) unregister is enqueued`);
  }
}
