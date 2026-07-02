import { openDB, type IDBPDatabase } from 'idb';
import type { DataRoomItem } from '@/types';

const DB_NAME = 'dataroom-db';
const DB_VERSION = 1;
const ITEMS_STORE = 'items';
const BLOBS_STORE = 'blobs';

export interface DataRoomDB {
  [ITEMS_STORE]: {
    key: string;
    value: DataRoomItem;
    indexes: { 'by-parentId': string | null };
  };
  [BLOBS_STORE]: {
    key: string;
    value: { id: string; blob: Blob };
  };
}

let dbInstance: IDBPDatabase<DataRoomDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DataRoomDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<DataRoomDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const itemsStore = db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
      itemsStore.createIndex('by-parentId', 'parentId');
      db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
    },
  });
  return dbInstance;
}
