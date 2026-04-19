import { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Global toast notification component.
 * @param {{ toasts: Array<{id, message, type}>, removeToast: (id) => void }} props
 *   type: 'success' | 'error' | 'info'
 */
export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none" id="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  // Auto-dismiss after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'bg-emerald-500/90', border: 'border-emerald-400/30' },
    error:   { icon: AlertTriangle, bg: 'bg-red-500/90', border: 'border-red-400/30' },
    info:    { icon: Info, bg: 'bg-blue-500/90', border: 'border-blue-400/30' },
  };

  const c = config[toast.type] || config.info;
  const Icon = c.icon;

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl ${c.bg} border ${c.border}
                     text-white text-sm font-medium shadow-lg backdrop-blur-sm toast-enter min-w-[260px] max-w-[400px]`}>
      <Icon className="w-4.5 h-4.5 flex-shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/** Helper hook — use in App.jsx to manage toast state. */
let toastCounter = 0;
export function createToast(message, type = 'info') {
  return { id: ++toastCounter, message, type };
}
