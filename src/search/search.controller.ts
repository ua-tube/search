import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { PaginationDto, SearchByTagsDto, SearchDto } from './dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('latest')
  searchLatest(@Query() pagination: PaginationDto) {
    return this.searchService.searchLatest(pagination);
  }

  @Get('related/:videoId')
  searchRelated(
    @Param('videoId', ParseUUIDPipe) videoId: string,
    @Query() pagination: PaginationDto
    ) {
    return this.searchService.searchRelated(videoId, pagination);
  }

  @Get()
  searchByQuery(@Query() query: SearchDto, @Query() pagination: PaginationDto) {
    return this.searchService.searchByQuery(query.q.trim(), pagination);
  }

  @HttpCode(200)
  @Post('by-tags')
  searchByTags(
    @Body() dto: SearchByTagsDto,
    @Body() pagination: PaginationDto,
  ) {
    return this.searchService.searchByTags(dto.tags, pagination);
  }
}
