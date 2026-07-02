import { useEffect, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlob } from '@/db/queries';
import type { DataRoomItem } from '@/types';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PDFViewerProps {
  item: DataRoomItem | null;
  onClose: () => void;
}

export function PDFViewer({ item, onClose }: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item) return;
    let objUrl: string | null = null;
    setLoading(true);
    setPage(1);

    getBlob(item.id).then((blob) => {
      if (blob) {
        objUrl = URL.createObjectURL(blob);
        setUrl(objUrl);
      }
      setLoading(false);
    });

    return () => {
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [item]);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  }, []);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
        <span className="font-medium truncate max-w-[60%]">{item.name}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setScale((s) => Math.min(3, s + 0.25))}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm w-20 text-center">
            {page} / {numPages || '—'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex justify-center py-6">
        {loading ? (
          <div className="text-white/60 mt-20">Loading…</div>
        ) : url ? (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-white/60 mt-20">Loading PDF…</div>}
            error={<div className="text-red-400 mt-20">Failed to load PDF.</div>}
          >
            <Page
              pageNumber={page}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        ) : (
          <div className="text-white/60 mt-20">File not found.</div>
        )}
      </div>
    </div>
  );
}
