import { useState, useCallback, useRef } from 'react';
import { useDataRoom } from '@/hooks/useDataRoom';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Toolbar } from '@/components/Toolbar';
import { FileExplorer } from '@/components/FileExplorer';
import { PDFViewer } from '@/components/PDFViewer';
import { ToastContainer, useToast } from '@/components/Toast';
import type { DataRoomItem } from '@/types';
import { Database, Upload } from 'lucide-react';

function App() {
  const {
    items,
    breadcrumbs,
    loading,
    navigateTo,
    navigateToBreadcrumb,
    createFolder,
    uploadFile,
    renameItem,
    deleteItem,
  } = useDataRoom();

  const [searchQuery, setSearchQuery] = useState('');
  const [pdfItem, setPdfItem] = useState<DataRoomItem | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const { toasts, dismiss, success, error } = useToast();

  const handleCreateFolder = async (name: string) => {
    await createFolder(name);
    success(`Folder "${name}" created`);
  };

  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      error('Only PDF files are supported');
      return;
    }
    await uploadFile(file);
    success(`"${file.name}" uploaded`);
  }, [uploadFile, success, error]);

  const handleRename = async (id: string, newName: string) => {
    await renameItem(id, newName);
    success('Renamed successfully');
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    await deleteItem(id);
    success(`"${item?.name ?? 'Item'}" deleted`);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (dragCounter.current === 1) setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleUpload(file);
  };

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600">
          <Database className="h-6 w-6" />
          <span className="text-xl font-bold text-gray-900">DataRoom</span>
        </div>
        <span className="text-gray-300 text-xl font-light">|</span>
        <span className="text-sm text-gray-500">Acme Corp · Due Diligence</span>
      </header>

      <main className="flex-1 px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="mb-4">
          <Breadcrumb entries={breadcrumbs} onNavigate={navigateToBreadcrumb} />
        </div>

        <div className="mb-6">
          <Toolbar
            onCreateFolder={handleCreateFolder}
            onUploadFile={handleUpload}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <FileExplorer
          items={items}
          loading={loading}
          searchQuery={searchQuery}
          onNavigate={navigateTo}
          onOpenFile={setPdfItem}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </main>

      {dragging && (
        <div className="fixed inset-0 z-40 bg-blue-500/10 border-4 border-dashed border-blue-400 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-blue-600">
            <Upload className="h-12 w-12" />
            <p className="text-xl font-semibold">Drop PDF to upload</p>
          </div>
        </div>
      )}

      {pdfItem && (
        <PDFViewer item={pdfItem} onClose={() => setPdfItem(null)} />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;
