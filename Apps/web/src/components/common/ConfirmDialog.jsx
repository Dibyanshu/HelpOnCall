import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Trash2, PowerOff, CheckCircle2, XCircle } from 'lucide-react';

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
    icon: <Trash2 className="w-8 h-8" />,
    tone: 'rose',
  },
  warning: {
    icon: <AlertTriangle className="w-8 h-8" />,
    tone: 'gray',
  },
  deactivate: {
    icon: <PowerOff className="w-8 h-8" />,
    tone: 'rose',
  },
  approve: {
    icon: <CheckCircle2 className="w-8 h-8" />,
    tone: 'teal',
  },
  reject: {
    icon: <XCircle className="w-8 h-8" />,
    tone: 'rose',
  },
  info: {
    icon: <ShieldAlert className="w-8 h-8" />,
    tone: 'teal',
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
      type: options.type || 'info', // danger, warning, deactivate, approve, reject, info
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
  const toneClass = `confirm-tone-${dialogStyles.tone || 'teal'}`;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {config && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleClose(false)}
              className="confirm-backdrop"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)', transition: { duration: 0.2 } }}
              className={`confirm-modal ${toneClass}`}
            >
              <div className="confirm-body">
                <button
                  onClick={() => handleClose(false)}
                  className="confirm-close"
                >
                  <X size={20} />
                </button>

                <div className="confirm-content">
                  <div className="confirm-icon-wrap">
                    {dialogStyles.icon}
                  </div>
                  
                  <h3 className="confirm-title">
                    {config.title}
                  </h3>
                  
                  <p className="confirm-message">
                    {config.message}
                  </p>

                  <div className="confirm-actions">
                    <button
                      type="button"
                      onClick={() => handleClose(false)}
                      className="confirm-cancel-btn"
                    >
                      {config.cancelText}
                    </button>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => handleClose(true)}
                      className="confirm-confirm-btn"
                    >
                      {config.confirmText}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};
