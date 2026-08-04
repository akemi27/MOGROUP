import { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isOk = toast.type === 'success';
  return createPortal(
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-2xl border max-w-sm text-sm font-medium
        ${isOk
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-red-50 border-red-200 text-red-800'
        }`}
    >
      <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isOk ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {isOk
          ? <CheckCircle className="w-3.5 h-3.5 text-white" />
          : <AlertCircle className="w-3.5 h-3.5 text-white" />}
      </div>
      <span className="flex-1 leading-snug">{toast.msg}</span>
      <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>,
    document.body
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };
  return { toast, showToast, clearToast: () => setToast(null) };
}
