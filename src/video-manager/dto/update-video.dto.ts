import { VideosIndex } from '../../search/interfaces';

export class UpdateVideoDto implements Partial<VideosIndex> {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  previewThumbnailUrl: string;
  visibility: string;
  status: string;
  lengthSeconds: number;
}
