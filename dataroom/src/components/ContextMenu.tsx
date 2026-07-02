import { useEffect, useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, onRename, onDelete, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const style = {
    position: 'fixed' as const,
    top: y,
    left: x,
    zIndex: 9999,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="w-40 rounded-lg border border-gray-200 bg-white shadow-lg py-1 text-sm"
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700"
      >
        <Pencil className="h-4 w-4" />
        Rename
      </button>
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="flex w-full items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
}
