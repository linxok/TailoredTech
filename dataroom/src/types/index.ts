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

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SearchResult {
  item: DataRoomItem;
  matchType: 'name' | 'content';
  snippet?: string;
  path: BreadcrumbEntry[];
}
