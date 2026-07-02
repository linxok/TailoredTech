import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium min-w-[260px] max-w-sm',
        toast.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-red-50 border border-red-200 text-red-800',
      )}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
      )}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, dismiss, success: (msg: string) => addToast('success', msg), error: (msg: string) => addToast('error', msg) };
}
