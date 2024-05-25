import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class SearchByTagsDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
