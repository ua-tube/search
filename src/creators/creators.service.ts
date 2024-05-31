import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UpsertCreatorDto } from './dto';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import { Index, Meilisearch } from 'meilisearch';
import { CreatorsIndex } from '../search/interfaces';

@Injectable()
export class CreatorsService implements OnModuleInit {
  private readonly logger = new Logger(CreatorsService.name);
  private index: Index<CreatorsIndex>;

  constructor(
    @InjectMeiliSearch()
    private readonly meiliSearch: Meilisearch,
  ) {}

  onModuleInit(): void {
    this.index = this.meiliSearch.index<CreatorsIndex>('creators');
  }

  async upsertCreator(payload: UpsertCreatorDto) {
    try {
      await this.index.getDocument(payload.id);
      await this.index.updateDocuments([payload]);
      this.logger.log(`Creator (${payload.id}) update is enqueued`);
    } catch {
      await this.index.addDocuments([
        {
          id: payload.id,
          displayName: payload.displayName,
          nickname: payload.nickname,
          thumbnailUrl: payload.thumbnailUrl,
        },
      ]);
      this.logger.log(`Creator (${payload.id}) create is enqueued`);
    }
  }
}
