import { Folder } from 'lucide-react';
import type { DataRoomItem } from '@/types';
import { formatDate } from '@/lib/utils';

interface FolderCardProps {
  item: DataRoomItem;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function FolderCard({ item, onOpen, onContextMenu }: FolderCardProps) {
  return (
    <div
      className="group relative flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 cursor-pointer select-none hover:border-blue-300 hover:shadow-md transition-all"
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      title={`Double-click to open "${item.name}"`}
    >
      <Folder className="h-12 w-12 text-blue-400 fill-blue-50 group-hover:text-blue-500 transition-colors" />
      <span className="text-sm font-medium text-gray-800 text-center break-all line-clamp-2 leading-tight">
        {item.name}
      </span>
      <span className="text-xs text-gray-400">{formatDate(item.updatedAt)}</span>
    </div>
  );
}
