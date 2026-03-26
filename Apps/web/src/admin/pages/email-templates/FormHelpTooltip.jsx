import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp } from 'lucide-react';

export default function FormHelpTooltip({ title, description, example }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();
  const triggerRef = useRef(null);
  const canUsePortal = typeof document !== 'undefined';
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    transform: 'translateX(-50%)',
    placeAbove: false,
  });

  const updateTooltipPosition = () => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 288;
    const edgePadding = 12;
    const halfWidth = tooltipWidth / 2;
    const canPlaceBelow = rect.bottom + 10 + 130 < window.innerHeight - edgePadding;

    let left = rect.left + (rect.width / 2);
    let transform = 'translateX(-50%)';

    if (left - halfWidth < edgePadding) {
      left = edgePadding;
      transform = 'translateX(0)';
    } else if (left + halfWidth > window.innerWidth - edgePadding) {
      left = window.innerWidth - edgePadding;
      transform = 'translateX(-100%)';
    }

    setTooltipPosition({
      top: canPlaceBelow ? rect.bottom + 10 : rect.top - 10,
      left,
      transform,
      placeAbove: !canPlaceBelow,
    });
  };

  const showTooltip = () => {
    updateTooltipPosition();
    setIsOpen(true);
  };
  const hideTooltip = () => setIsOpen(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => {
        if (prev) {
          return false;
        }

        updateTooltipPosition();
        return true;
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateTooltipPosition();

    const handleWindowChange = () => {
      updateTooltipPosition();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen]);

  return (
    <span className="relative inline-flex items-center" onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center text-slate-400 transition-colors hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300/70 rounded"
        aria-label={`Help for ${title}`}
        aria-expanded={isOpen}
        aria-describedby={tooltipId}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onKeyDown={handleKeyDown}
      >
        <CircleHelp size={14} />
      </button>

      {canUsePortal
        ? createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              transform: `${tooltipPosition.transform} ${tooltipPosition.placeAbove ? 'translateY(-100%)' : 'translateY(0)'}`,
            }}
            className={`pointer-events-none fixed z-[9999] w-72 rounded-xl border border-white/50 bg-white/85 px-3 py-2 text-left shadow-xl backdrop-blur-md transition-opacity duration-150 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-teal-700">{title}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-700">{description}</span>
            {example ? <span className="mt-1 block text-xs font-mono text-slate-600">Example: {example}</span> : null}
          </span>,
          document.body,
        )
        : null}
    </span>
  );
}
