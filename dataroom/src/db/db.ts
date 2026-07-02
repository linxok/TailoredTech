import { openDB, type IDBPDatabase } from 'idb';
import type { DataRoomItem, User } from '@/types';

const DB_NAME = 'dataroom-db';
const DB_VERSION = 2;
const ITEMS_STORE = 'items';
const BLOBS_STORE = 'blobs';
const USERS_STORE = 'users';

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
  [USERS_STORE]: {
    key: string;
    value: User;
    indexes: { 'by-email': string };
  };
}

let dbInstance: IDBPDatabase<DataRoomDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<DataRoomDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<DataRoomDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const itemsStore = db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        itemsStore.createIndex('by-parentId', 'parentId');
        db.createObjectStore(BLOBS_STORE, { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        usersStore.createIndex('by-email', 'email', { unique: true });
      }
    },
  });
  return dbInstance;
}
