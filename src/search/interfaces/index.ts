export interface VideosIndex {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  previewThumbnailUrl: string;
  lengthSeconds: number;
  creatorId: string;
  metrics: {
    viewsCount: string;
    viewsCountUpdatedAt?: Date;
  };
  status: string;
  visibility: string;
  createdAt: Date;
}

export interface CreatorsIndex {
  id: string;
  displayName: string;
  nickname: string;
  thumbnailUrl?: string;
}
