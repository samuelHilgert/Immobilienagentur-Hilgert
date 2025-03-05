export interface MediaAttachment {
  id?: number;           // Optional, da möglicherweise nicht immer vorhanden
  externalId: string;    // Pflichtfeld
  type: 'image' | 'video';
  url: string;
  isTitleImage?: boolean; // Optional
}