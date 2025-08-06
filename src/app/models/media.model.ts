export interface MediaAttachment {
  id?: string;
  externalId: string;
  type: 'image' | 'video';
  category?: 'IMAGE' | 'FLOOR_PLAN' | 'VIDEO';
  url: string;
  isTitleImage?: boolean;
  isAltTitleImage?: boolean;
  description?: string;
  uploadDate?: string;
  sortOrder?: number;
}
