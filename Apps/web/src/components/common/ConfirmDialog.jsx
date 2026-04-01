import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Trash2, PowerOff } from 'lucide-react';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

const TYPE_CONFIG = {
  danger: {
    icon: <Trash2 className="w-8 h-8 text-rose-500" />,
    btnClass: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
    accent: 'bg-rose-500/10',
    titleColor: 'text-rose-900',
  },
  warning: {
    icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
    accent: 'bg-amber-500/10',
    titleColor: 'text-amber-900',
  },
  deactivate: {
    icon: <PowerOff className="w-8 h-8 text-slate-700" />,
    btnClass: 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-500/20',
    accent: 'bg-slate-100',
    titleColor: 'text-slate-900',
  },
  info: {
    icon: <ShieldAlert className="w-8 h-8 text-teal-600" />,
    btnClass: 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-500/20',
    accent: 'bg-teal-500/10',
    titleColor: 'text-teal-900',
  },
};

export const ConfirmProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [resolver, setResolver] = useState(null);

  const confirm = useCallback((options) => {
    setConfig({
      title: options.title || 'Are you sure?',
      message: options.message || 'Verification is required to continue.',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      type: options.type || 'info', // danger, warning, deactivate, info
    });

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = useCallback((value) => {
    if (resolver) {
      resolver(value);
    }
    setConfig(null);
    setResolver(null);
  }, [resolver]);

  const dialogStyles = config ? TYPE_CONFIG[config.type] || TYPE_CONFIG.info : TYPE_CONFIG.info;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {config && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop with Liquid Glass Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)', transition: { duration: 0.2 } }}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/70 backdrop-blur-2xl shadow-2xl"
            >
              {/* Glossy Top Shine */}
              <div className="absolute top-0 inset-x-0 h-32 bg-linear-to-b from-white/30 to-transparent pointer-events-none" />
              
              <div className="relative p-8 pt-10">
                <button
                  onClick={() => handleClose(false)}
                  className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-all"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className={`mb-6 p-5 rounded-[1.5rem] shadow-sm ${dialogStyles.accent}`}>
                    {dialogStyles.icon}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 tracking-tight ${dialogStyles.titleColor}`}>
                    {config.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed font-medium mb-8">
                    {config.message}
                  </p>

                  <div className="flex flex-col w-full gap-3 sm:flex-row sm:gap-4">
                    <button
                      type="button"
                      onClick={() => handleClose(false)}
                      className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-all active:scale-95"
                    >
                      {config.cancelText}
                    </button>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => handleClose(true)}
                      className={`flex-1 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all active:scale-95 ${dialogStyles.btnClass}`}
                    >
                      {config.confirmText}
                    </button>
                  </div>
                </div>
              </div>

              {/* Liquid Gloss Reflection Layer */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/5 blur-[100px] pointer-events-none rounded-full" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/5 blur-[100px] pointer-events-none rounded-full" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
