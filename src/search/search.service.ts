import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaginationDto } from './dto';
import { InjectMeiliSearch } from 'nestjs-meilisearch';
import {
  Index,
  Meilisearch,
  ResourceResults,
  SearchResponse,
} from 'meilisearch';
import { CreatorsIndex, VideosIndex } from './interfaces';

@Injectable()
export class SearchService implements OnModuleInit {
  private videosIndex: Index<VideosIndex>;
  private creatorsIndex: Index<CreatorsIndex>;

  constructor(
    @InjectMeiliSearch()
    private readonly meiliSearch: Meilisearch,
  ) {}

  private async setupIndex<T>(
    name: string,
    cfg: {
      searchable: string[];
      sortable: string[];
      filterable: string[];
    },
  ) {
    await this.meiliSearch.createIndex(name, { primaryKey: 'id' });
    const index = this.meiliSearch.index<T>(name);
    await Promise.all([
      index.updateSearchableAttributes(cfg.searchable),
      index.updateSortableAttributes(cfg.sortable),
      index.updateFilterableAttributes(cfg.filterable),
      index.updateRankingRules([
        'words',
        'exactness',
        'typo',
        'proximity',
        'attribute',
        'sort',
      ]),
    ]);
    return index;
  }

  async onModuleInit(): Promise<void> {
    // Setup videos index
    this.videosIndex = await this.setupIndex('videos', {
      searchable: ['id', 'title', 'description', 'tags', 'creatorId'],
      filterable: [
        'id',
        'tags',
        'creatorId',
        'status',
        'visibility',
        'createdAt',
      ],
      sortable: ['createdAt'],
    });

    // Setup creators index
    this.creatorsIndex = await this.setupIndex('creators', {
      searchable: [],
      filterable: ['id'],
      sortable: [],
    });
  }

  async searchLatest(pagination: PaginationDto) {
    const videoResponse = await this.videosIndex.search(null, {
      sort: ['createdAt:desc'],
      filter: ["status != 'Unregistered'", "visibility = 'Public'"],
      page: pagination?.page ?? 1,
      hitsPerPage: pagination?.perPage ?? 20,
      facets: ['tags'],
    });

    return this.mapCreatorsToVideosResponse(videoResponse);
  }

  async searchByQuery(query: string, pagination: PaginationDto) {
    const videosResponse = await this.videosIndex.search(query, {
      page: pagination?.page ?? 1,
      hitsPerPage: pagination?.perPage ?? 20,
      facets: ['tags'],
      filter: ["status != 'Unregistered'", "visibility = 'Public'"],
    });

    return this.mapCreatorsToVideosResponse(videosResponse);
  }

  async searchByTags(tags: string[], pagination: PaginationDto) {
    const videosResource = await this.videosIndex.getDocuments({
      filter: [
        `tags IN [${tags.map((tag) => tag.trim()).join(', ')}]`,
        "status != 'Unregistered'",
        "visibility = 'Public'",
      ],
      offset: ((pagination?.page ?? 1) - 1) * (pagination?.perPage ?? 20),
      limit: pagination?.perPage ?? 20,
    });

    return this.mapCreatorsToVideoResource(videosResource);
  }

  private async mapCreatorsToVideoResource(
    videoResource: ResourceResults<VideosIndex[]>,
  ) {
    const creatorsResponse = await this.creatorsIndex.getDocuments({
      filter: [
        `id IN [${videoResource.results.map((result) => result.creatorId).join(', ')}]`,
      ],
    });

    if (videoResource.total > 0) {
      videoResource.results = videoResource.results.map((vh) => ({
        ...vh,
        creator:
          creatorsResponse.results.find((ch) => vh.creatorId === ch.id) || {},
      }));
    }

    return videoResource;
  }

  private async mapCreatorsToVideosResponse(
    videosResponse: SearchResponse<VideosIndex>,
  ) {
    const creatorsResponse = await this.creatorsIndex.getDocuments({
      filter: [
        `id IN [${videosResponse.hits.map((hit) => hit.creatorId).join(', ')}]`,
      ],
    });

    if (videosResponse.totalHits > 0) {
      videosResponse.hits = videosResponse.hits.map((vh) => ({
        ...vh,
        creator:
          creatorsResponse.results.find((ch) => vh.creatorId === ch.id) || {},
      }));
    }

    return videosResponse;
  }
}
