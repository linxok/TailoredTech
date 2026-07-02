import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbEntry } from '@/types';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  entries: BreadcrumbEntry[];
  onNavigate: (entry: BreadcrumbEntry) => void;
}

export function Breadcrumb({ entries, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 min-w-0">
      {entries.map((entry, idx) => {
        const isLast = idx === entries.length - 1;
        return (
          <span key={entry.id ?? 'root'} className="flex items-center gap-1 min-w-0">
            {idx > 0 && <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />}
            {isLast ? (
              <span className="font-medium text-gray-900 truncate max-w-[200px]">
                {idx === 0 && <Home className="inline h-4 w-4 mr-1 -mt-0.5" />}
                {entry.name}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(entry)}
                className={cn(
                  'hover:text-blue-600 hover:underline truncate max-w-[160px] transition-colors',
                  idx === 0 && 'flex items-center gap-1',
                )}
              >
                {idx === 0 && <Home className="h-4 w-4 shrink-0" />}
                {entry.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
