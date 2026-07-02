import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RenameDialogProps {
  open: boolean;
  currentName: string;
  onConfirm: (newName: string) => Promise<void>;
  onClose: () => void;
}

export function RenameDialog({ open, currentName, onConfirm, onClose }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setName(currentName);
  }, [open, currentName]);

  const handleConfirm = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await onConfirm(trimmed);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!name.trim() || saving}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
