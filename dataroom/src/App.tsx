import { useState, useCallback, useRef, useEffect } from 'react';
import { useDataRoom } from '@/hooks/useDataRoom';
import { useAuth } from '@/context/AuthContext';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Toolbar } from '@/components/Toolbar';
import { FileExplorer } from '@/components/FileExplorer';
import { PDFViewer } from '@/components/PDFViewer';
import { ToastContainer, useToast } from '@/components/Toast';
import { AuthPage } from '@/components/AuthPage';
import { GlobalSearch } from '@/components/GlobalSearch';
import type { DataRoomItem } from '@/types';
import { Database, Upload, Search, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DataRoomApp() {
  const { user, logout } = useAuth();
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
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [pdfItem, setPdfItem] = useState<DataRoomItem | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
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

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

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
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-blue-600">
          <Database className="h-6 w-6" />
          <span className="text-xl font-bold text-gray-900">DataRoom</span>
        </div>
        <span className="text-gray-300 text-xl font-light">|</span>
        <span className="text-sm text-gray-500">Acme Corp · Due Diligence</span>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setGlobalSearchOpen(true)}
            className="gap-2 text-gray-500"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search all</span>
            <kbd className="hidden sm:inline text-xs bg-gray-100 border border-gray-200 rounded px-1">⌘K</kbd>
          </Button>

          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <span className="hidden sm:inline font-medium">{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
              <LogOut className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        </div>
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

      <GlobalSearch
        open={globalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
        onNavigateTo={navigateTo}
        onOpenFile={setPdfItem}
      />

      {pdfItem && (
        <PDFViewer item={pdfItem} onClose={() => setPdfItem(null)} />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-blue-600">
          <Database className="h-6 w-6 animate-pulse" />
          <span className="text-lg font-medium text-gray-600">Loading…</span>
        </div>
      </div>
    );
  }

  return user ? <DataRoomApp /> : <AuthPage />;
}

export default App;
