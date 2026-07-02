import { FileText } from 'lucide-react';
import type { DataRoomItem } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';

interface FileCardProps {
  item: DataRoomItem;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function FileCard({ item, onOpen, onContextMenu }: FileCardProps) {
  return (
    <div
      className="group relative flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 cursor-pointer select-none hover:border-blue-300 hover:shadow-md transition-all"
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
      title={`Double-click to open "${item.name}"`}
    >
      <FileText className="h-12 w-12 text-red-400 fill-red-50 group-hover:text-red-500 transition-colors" />
      <span className="text-sm font-medium text-gray-800 text-center break-all line-clamp-2 leading-tight">
        {item.name}
      </span>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{formatDate(item.updatedAt)}</span>
        {item.size !== undefined && (
          <>
            <span>·</span>
            <span>{formatFileSize(item.size)}</span>
          </>
        )}
      </div>
    </div>
  );
}
