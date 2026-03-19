import { useEffect, useRef, useState } from 'react';

const ANIMATION_MS = 180;

/*
  Reuse guide:
  1) Import this component and wrap your form JSX in it.
  2) Control visibility with isOpen and wire onClose to your local close handler.
  3) Pass canClose={!isSubmitting} to prevent closing while submit is in progress.
  4) Provide title/eyebrow/ariaLabel to match each form context.
  5) Use panelClassName (for example, max-w-md or max-w-xl) to adjust panel width.

  Example:
  <AdminSlideInPanel
    isOpen={isOpen}
    onClose={handleClose}
    canClose={!isSubmitting}
    title="Create User"
    ariaLabel="Create user form panel"
  >
    <form onSubmit={handleSubmit}>...</form>
  </AdminSlideInPanel>
*/

export default function AdminSlideInPanel({
  isOpen,
  onClose,
  canClose = true,
  title,
  eyebrow = 'Admin Portal',
  ariaLabel = 'Admin slide-in panel',
  panelClassName = 'max-w-md',
  children,
}) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);

      const frameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    setIsVisible(false);

    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false);
    }, ANIMATION_MS);

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender || !canClose) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canClose, onClose, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={canClose ? onClose : undefined}
        disabled={!canClose}
        className={`absolute inset-0 bg-slate-900/35 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl transition duration-200 ease-out sm:p-8 ${panelClassName} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p>
            ) : null}
            <h2 className="mt-2 text-xl font-bold text-slate-900">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
