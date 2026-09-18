import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const type = toast.type || 'info';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md ${
                type === 'success'
                  ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-300'
                  : type === 'error'
                  ? 'bg-slate-900/95 border-rose-500/30 text-rose-300'
                  : type === 'warning'
                  ? 'bg-slate-900/95 border-amber-500/30 text-amber-300'
                  : 'bg-slate-900/95 border-cyan-500/30 text-cyan-300'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-100 leading-snug">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
