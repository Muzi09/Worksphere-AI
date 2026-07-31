import React from 'react';
import { useToast } from './use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.variant === 'success';
          const isError = toast.variant === 'destructive' || toast.variant === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all ${
                isSuccess
                  ? 'bg-zinc-900/95 border-emerald-500/40 text-white shadow-emerald-950/20'
                  : isError
                  ? 'bg-zinc-900/95 border-rose-500/40 text-white shadow-rose-950/20'
                  : 'bg-zinc-900/95 border-white/15 text-white'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isError ? (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                ) : (
                  <Info className="w-5 h-5 text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-2">
                {toast.title && (
                  <h4 className="text-sm font-semibold text-gray-100 tracking-tight leading-tight">
                    {toast.title}
                  </h4>
                )}
                {toast.description && (
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed break-words">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
