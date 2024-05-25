import { VideosIndex } from '../../search/interfaces';

export class CreateVideoDto implements Omit<VideosIndex, 'metrics'> {
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
  createdAt: Date;
}
