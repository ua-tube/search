import { IsNotEmpty, IsNumber, Max, Min } from "class-validator";
import { Transform } from "class-transformer";

export class SearchTrendingTagsDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number(value))
  maxTagsCount: number;
}
