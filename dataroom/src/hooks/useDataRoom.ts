import { useState, useEffect, useCallback } from 'react';
import type { DataRoomItem, BreadcrumbEntry } from '@/types';
import {
  getChildren,
  getItem,
  createItem,
  updateItemName,
  deleteItemTree,
  saveBlob,
} from '@/db/queries';

export function useDataRoom() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [items, setItems] = useState<DataRoomItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbEntry[]>([
    { id: null, name: 'Data Room' },
  ]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const children = await getChildren(currentFolderId);
    children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    setItems(children);
    setLoading(false);
  }, [currentFolderId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const navigateTo = useCallback(
    async (folderId: string | null, name?: string) => {
      if (folderId === null) {
        setCurrentFolderId(null);
        setBreadcrumbs([{ id: null, name: 'Data Room' }]);
        return;
      }
      const folderName = name ?? (await getItem(folderId))?.name ?? 'Folder';
      setBreadcrumbs((prev) => {
        const existing = prev.findIndex((b) => b.id === folderId);
        if (existing !== -1) return prev.slice(0, existing + 1);
        return [...prev, { id: folderId, name: folderName }];
      });
      setCurrentFolderId(folderId);
    },
    [],
  );

  const navigateToBreadcrumb = useCallback((entry: BreadcrumbEntry) => {
    setBreadcrumbs((prev) => {
      const idx = prev.findIndex((b) => b.id === entry.id);
      return idx !== -1 ? prev.slice(0, idx + 1) : prev;
    });
    setCurrentFolderId(entry.id);
  }, []);

  const createFolder = useCallback(
    async (name: string) => {
      await createItem(name, 'folder', currentFolderId, items);
      await refresh();
    },
    [currentFolderId, items, refresh],
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const item = await createItem(
        file.name,
        'file',
        currentFolderId,
        items,
        { mimeType: file.type, size: file.size },
      );
      await saveBlob(item.id, file);
      await refresh();
    },
    [currentFolderId, items, refresh],
  );

  const renameItem = useCallback(
    async (id: string, newName: string) => {
      const siblings = items.filter((i) => i.id !== id);
      await updateItemName(id, newName, siblings);
      await refresh();
    },
    [items, refresh],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await deleteItemTree(id);
      await refresh();
    },
    [refresh],
  );

  return {
    currentFolderId,
    items,
    breadcrumbs,
    loading,
    refresh,
    navigateTo,
    navigateToBreadcrumb,
    createFolder,
    uploadFile,
    renameItem,
    deleteItem,
  };
}
