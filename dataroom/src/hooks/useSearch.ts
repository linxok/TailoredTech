import { useState, useCallback } from 'react';
import { pdfjs } from 'react-pdf';
import type { DataRoomItem, SearchResult, BreadcrumbEntry } from '@/types';
import { getBlob, getAllItems } from '@/db/queries';
import { getItem } from '@/db/queries';

async function extractPdfText(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const texts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    texts.push(pageText);
  }
  return texts.join('\n');
}

function getSnippet(text: string, query: string, contextLen = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - contextLen / 2);
  const end = Math.min(text.length, idx + query.length + contextLen / 2);
  const snippet = text.slice(start, end).trim();
  return (start > 0 ? '…' : '') + snippet + (end < text.length ? '…' : '');
}

async function buildPath(item: DataRoomItem): Promise<BreadcrumbEntry[]> {
  const path: BreadcrumbEntry[] = [{ id: null, name: 'Data Room' }];
  let current: DataRoomItem | undefined = item;
  const ancestors: BreadcrumbEntry[] = [];

  while (current.parentId !== null) {
    const parent = await getItem(current.parentId);
    if (!parent) break;
    ancestors.unshift({ id: parent.id, name: parent.name });
    current = parent;
  }

  return [...path, ...ancestors];
}

export type SearchScope = 'name' | 'content' | 'both';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (query: string, scope: SearchScope = 'both') => {
    const q = query.trim();
    if (!q) { setResults([]); return; }

    setSearching(true);
    const all = await getAllItems();
    const found: SearchResult[] = [];

    for (const item of all) {
      const nameMatch = scope !== 'content' && item.name.toLowerCase().includes(q.toLowerCase());

      if (nameMatch) {
        const path = await buildPath(item);
        found.push({ item, matchType: 'name', path });
        continue;
      }

      if (scope !== 'name' && item.type === 'file') {
        const blob = await getBlob(item.id);
        if (!blob) continue;
        try {
          const text = await extractPdfText(blob);
          if (text.toLowerCase().includes(q.toLowerCase())) {
            const snippet = getSnippet(text, q);
            const path = await buildPath(item);
            found.push({ item, matchType: 'content', snippet, path });
          }
        } catch {
          // skip unreadable PDF
        }
      }
    }

    setResults(found);
    setSearching(false);
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, searching, search, clear };
}
