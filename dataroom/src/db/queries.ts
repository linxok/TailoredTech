import { getDB } from './db';
import type { DataRoomItem, ItemType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function getChildren(parentId: string | null): Promise<DataRoomItem[]> {
  const db = await getDB();
  if (parentId === null) {
    const all = await db.getAll('items');
    return all.filter((item) => item.parentId === null);
  }
  return db.getAllFromIndex('items', 'by-parentId', parentId);
}

export async function getAllItems(): Promise<DataRoomItem[]> {
  const db = await getDB();
  return db.getAll('items');
}

export async function getItem(id: string): Promise<DataRoomItem | undefined> {
  const db = await getDB();
  return db.get('items', id);
}

export async function createItem(
  name: string,
  type: ItemType,
  parentId: string | null,
  siblings: DataRoomItem[],
  extra?: Partial<DataRoomItem>,
): Promise<DataRoomItem> {
  const db = await getDB();
  const uniqueName = resolveUniqueName(name, siblings);
  const now = Date.now();
  const item: DataRoomItem = {
    id: uuidv4(),
    parentId,
    name: uniqueName,
    type,
    createdAt: now,
    updatedAt: now,
    ...extra,
  };
  await db.put('items', item);
  return item;
}

export async function updateItemName(id: string, newName: string, siblings: DataRoomItem[]): Promise<DataRoomItem> {
  const db = await getDB();
  const item = await db.get('items', id);
  if (!item) throw new Error('Item not found');
  const others = siblings.filter((s) => s.id !== id);
  const uniqueName = resolveUniqueName(newName, others);
  const updated: DataRoomItem = { ...item, name: uniqueName, updatedAt: Date.now() };
  await db.put('items', updated);
  return updated;
}

export async function deleteItemTree(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('items', id);
  if (!item) return;

  if (item.type === 'folder') {
    const children = await db.getAllFromIndex('items', 'by-parentId', id);
    for (const child of children) {
      await deleteItemTree(child.id);
    }
  } else {
    await db.delete('blobs', id);
  }

  await db.delete('items', id);
}

export async function saveBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put('blobs', { id, blob });
}

export async function getBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  const record = await db.get('blobs', id);
  return record?.blob ?? null;
}

function resolveUniqueName(name: string, siblings: DataRoomItem[]): string {
  const existingNames = new Set(siblings.map((s) => s.name));
  if (!existingNames.has(name)) return name;

  const ext = name.includes('.') ? '.' + name.split('.').pop() : '';
  const base = ext ? name.slice(0, name.length - ext.length) : name;

  let counter = 1;
  while (existingNames.has(`${base} (${counter})${ext}`)) {
    counter++;
  }
  return `${base} (${counter})${ext}`;
}
