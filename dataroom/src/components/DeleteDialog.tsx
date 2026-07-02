import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DataRoomItem } from '@/types';

interface DeleteDialogProps {
  open: boolean;
  item: DataRoomItem | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteDialog({ open, item, onConfirm, onClose }: DeleteDialogProps) {
  const isFolder = item?.type === 'folder';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {isFolder ? 'Folder' : 'File'}</DialogTitle>
          <DialogDescription>
            {isFolder
              ? `Are you sure you want to delete "${item?.name}" and all its contents? This cannot be undone.`
              : `Are you sure you want to delete "${item?.name}"? This cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={async () => { await onConfirm(); onClose(); }}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
