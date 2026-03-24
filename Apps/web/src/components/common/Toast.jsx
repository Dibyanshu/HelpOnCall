import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_TYPES = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-teal-500" />,
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    glow: 'shadow-teal-500/20',
  },
  error: {
    icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    glow: 'shadow-rose-500/20',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    glow: 'shadow-amber-500/20',
  },
  info: {
    icon: <Info className="w-5 h-5 text-teal-600" />,
    border: 'border-teal-600/30',
    bg: 'bg-teal-600/10',
    glow: 'shadow-teal-600/20',
  },
};

const ToastItem = ({ toast, onRemove }) => {
  const { id, message, type = 'info', duration = 5000 } = toast;
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9, y: 10, transition: { duration: 0.15 } }}
      className={`relative group flex items-start gap-3 p-4 min-w-[320px] max-w-md rounded-2xl border ${config.border} ${config.bg} backdrop-blur-[12px] shadow-2xl ${config.glow}`}
    >
      {/* Dynamic Glow Layer */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Premium Highlight Refraction */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-tr from-white/5 via-white/10 to-transparent opacity-60 pointer-events-none" />

      <div className="relative shrink-0 mt-0.5">
        <div className="absolute -inset-2 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        {config.icon}
      </div>

      <div className="relative flex-1">
        <p className="text-sm font-semibold tracking-tight text-slate-900 drop-shadow-sm leading-snug">
          {message}
        </p>
      </div>

      <button
        onClick={() => onRemove(id)}
        className="relative shrink-0 p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/20 transition-all active:scale-90"
      >
        <X size={16} strokeWidth={2.5} />
      </button>

      {/* Progress Bar (Liquid Gradient Style) */}
      <div className="absolute bottom-0 left-0 h-1 bg-black/5 rounded-b-2xl overflow-hidden w-full">
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          style={{ originX: 0 }}
          className={`h-full w-full bg-linear-to-r from-transparent via-white/60 to-white/90`}
        />
      </div>
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, ...options }]);
    return id;
  }, []);

  const contextValue = useMemo(() => ({
    success: (msg, opts) => showToast(msg, 'success', opts),
    error: (msg, opts) => showToast(msg, 'error', opts),
    info: (msg, opts) => showToast(msg, 'info', opts),
    warning: (msg, opts) => showToast(msg, 'warning', opts),
    remove: removeToast,
  }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none max-w-md">
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
};
