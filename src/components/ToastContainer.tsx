import React from 'react';
import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStudyVault();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {toast.tone === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : toast.tone === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          )}
          <span className="flex-1 text-xs font-medium">{toast.text}</span>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
