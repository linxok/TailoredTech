import { useRef, useState } from 'react';
import { FolderPlus, Upload, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ToolbarProps {
  onCreateFolder: (name: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function Toolbar({ onCreateFolder, onUploadFile, searchQuery, onSearchChange }: ToolbarProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    setCreating(true);
    await onCreateFolder(name);
    setCreating(false);
    setFolderName('');
    setFolderDialogOpen(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUploadFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search files and folders…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={() => setFolderDialogOpen(true)}>
        <FolderPlus className="h-4 w-4" />
        New Folder
      </Button>

      <Button size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4" />
        Upload PDF
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim() || creating}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
