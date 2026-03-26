import { useId, useState } from 'react';
import { CircleHelp } from 'lucide-react';

export default function FormHelpTooltip({ title, description, example }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipId = useId();

  const showTooltip = () => setIsOpen(true);
  const hideTooltip = () => setIsOpen(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      hideTooltip();
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        className="inline-flex items-center justify-center text-slate-400 transition-colors hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300/70 rounded"
        aria-label={`Help for ${title}`}
        aria-expanded={isOpen}
        aria-describedby={tooltipId}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onKeyDown={handleKeyDown}
      >
        <CircleHelp size={14} />
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-xl border border-white/35 bg-white/30 px-3 py-2 text-left shadow-xl backdrop-blur-md transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-teal-700">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-700">{description}</span>
        {example ? <span className="mt-1 block text-xs font-mono text-slate-600">Example: {example}</span> : null}
      </span>
    </span>
  );
}
