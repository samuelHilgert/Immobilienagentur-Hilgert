export interface MediaAttachment {
  id?: string;           // Optional, da möglicherweise nicht immer vorhanden
  externalId: string;    // Pflichtfeld
  type: 'image' | 'video';
  url: string;
  isTitleImage?: boolean; // Optional
  description?:string;
  uploadDate?: string; 
}