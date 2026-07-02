import { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Folder, Loader2, ChevronRight } from 'lucide-react';
import { useSearch, type SearchScope } from '@/hooks/useSearch';
import type { DataRoomItem, BreadcrumbEntry } from '@/types';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
  onNavigateTo: (folderId: string | null, name?: string) => void;
  onOpenFile: (item: DataRoomItem) => void;
}

export function GlobalSearch({ open, onClose, onNavigateTo, onOpenFile }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('both');
  const { results, searching, search, clear } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      clear();
    }
  }, [open, clear]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { clear(); return; }
    debounceRef.current = setTimeout(() => search(query, scope), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, scope, search, clear]);

  if (!open) return null;

  const handleResultClick = (item: DataRoomItem, path: BreadcrumbEntry[]) => {
    if (item.type === 'folder') {
      onNavigateTo(item.id, item.name);
    } else {
      const parent = path[path.length - 1];
      onNavigateTo(parent?.id ?? null, parent?.name);
      onOpenFile(item);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          {searching
            ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin shrink-0" />
            : <Search className="h-5 w-5 text-gray-400 shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders…"
            className="flex-1 text-base outline-none text-gray-900 placeholder:text-gray-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-1">
            <kbd className="text-xs bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">Esc</kbd>
          </button>
        </div>

        <div className="flex gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50">
          {(['both', 'name', 'content'] as SearchScope[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                scope === s
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-200',
              )}
            >
              {s === 'both' ? 'Name & Content' : s === 'name' ? 'Name only' : 'Content only'}
            </button>
          ))}
        </div>

        <div className="max-h-[50vh] overflow-y-auto">
          {!query && (
            <div className="py-12 text-center text-gray-400 text-sm">
              Start typing to search across all files and folders
            </div>
          )}

          {query && !searching && results.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No results for <span className="font-medium text-gray-600">"{query}"</span>
            </div>
          )}

          {results.map((result) => (
            <button
              key={result.item.id}
              onClick={() => handleResultClick(result.item, result.path)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0"
            >
              {result.item.type === 'folder'
                ? <Folder className="h-5 w-5 text-blue-400 fill-blue-50 shrink-0 mt-0.5" />
                : <FileText className="h-5 w-5 text-red-400 fill-red-50 shrink-0 mt-0.5" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 truncate">{result.item.name}</span>
                  {result.matchType === 'content' && (
                    <span className="text-xs bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 shrink-0">
                      content match
                    </span>
                  )}
                </div>
                {result.snippet && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {result.snippet}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  {result.path.map((p, i) => (
                    <span key={p.id ?? 'root'} className="flex items-center gap-1">
                      {i > 0 && <ChevronRight className="h-3 w-3" />}
                      <span>{p.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
