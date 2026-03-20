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
    <>
      <div
        className={`fixed inset-0 z-[95] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={canClose ? onClose : undefined}
        aria-hidden={!isOpen}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Edit User Panel"
        className={`fixed right-0 top-0 z-[100] h-screen w-full md:w-[60%] lg:w-[40%] bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
            <button
              type="button"
              onClick={canClose ? onClose : undefined}
              className="rounded-md p-2 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close Panel"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 overflow-y-auto px-6 py-6">
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}
