export type ItemType = 'folder' | 'file';

export interface DataRoomItem {
  id: string;
  parentId: string | null;
  name: string;
  type: ItemType;
  createdAt: number;
  updatedAt: number;
  mimeType?: string;
  size?: number;
}

export interface BreadcrumbEntry {
  id: string | null;
  name: string;
}
