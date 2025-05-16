export interface MediaAttachment {
  id?: string;
  externalId: string;
  type: 'image' | 'video'; // → Dateiformat
  category?: 'IMAGE' | 'FLOOR_PLAN' | 'VIDEO'; // → Zweck des Mediums
  url: string;
  isTitleImage?: boolean;
  description?: string;
  uploadDate?: string;
}
