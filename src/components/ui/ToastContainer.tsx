import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 bg-[#FAF8F5] border border-charcoal-800 shadow-xl transition-all animate-slide-up',
            toast.type === 'error' && 'border-red-600 bg-red-50/90 text-red-950',
            toast.type === 'success' && 'border-moss-800 bg-[#FAF8F5] text-charcoal-900',
            toast.type === 'info' && 'border-sand-400 bg-sand-50 text-charcoal-900'
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-moss-800 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sand-700 shrink-0 mt-0.5" />}

          <div className="flex-1">
            {toast.title && (
              <h5 className="font-serif text-sm font-semibold tracking-tight leading-tight">
                {toast.title}
              </h5>
            )}
            <p className="text-xs text-charcoal-700 mt-0.5 leading-normal">{toast.message}</p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-charcoal-400 hover:text-charcoal-900 p-0.5"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
