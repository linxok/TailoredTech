import { useState, useCallback, useMemo } from 'react';
import { FolderCard } from './FolderCard';
import { FileCard } from './FileCard';
import { ContextMenu } from './ContextMenu';
import { RenameDialog } from './RenameDialog';
import { DeleteDialog } from './DeleteDialog';
import type { DataRoomItem } from '@/types';
import { FolderOpen } from 'lucide-react';

interface ContextMenuState {
  x: number;
  y: number;
  item: DataRoomItem;
}

interface FileExplorerProps {
  items: DataRoomItem[];
  loading: boolean;
  searchQuery: string;
  onNavigate: (id: string, name: string) => void;
  onOpenFile: (item: DataRoomItem) => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function FileExplorer({
  items,
  loading,
  searchQuery,
  onNavigate,
  onOpenFile,
  onRename,
  onDelete,
}: FileExplorerProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [renameTarget, setRenameTarget] = useState<DataRoomItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataRoomItem | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, item: DataRoomItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <FolderOpen className="h-16 w-16 mb-4 text-gray-200" />
        <p className="text-lg font-medium">
          {searchQuery ? 'No results found' : 'This folder is empty'}
        </p>
        <p className="text-sm mt-1">
          {searchQuery ? `No items match "${searchQuery}"` : 'Create a folder or upload a PDF to get started'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4">
        {filtered.map((item) =>
          item.type === 'folder' ? (
            <FolderCard
              key={item.id}
              item={item}
              onOpen={() => onNavigate(item.id, item.name)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            />
          ) : (
            <FileCard
              key={item.id}
              item={item}
              onOpen={() => onOpenFile(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            />
          ),
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => setRenameTarget(contextMenu.item)}
          onDelete={() => setDeleteTarget(contextMenu.item)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <RenameDialog
        open={!!renameTarget}
        currentName={renameTarget?.name ?? ''}
        onConfirm={async (newName) => {
          if (renameTarget) await onRename(renameTarget.id, newName);
        }}
        onClose={() => setRenameTarget(null)}
      />

      <DeleteDialog
        open={!!deleteTarget}
        item={deleteTarget}
        onConfirm={async () => {
          if (deleteTarget) await onDelete(deleteTarget.id);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
