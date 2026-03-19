import { useRef, useEffect, useState } from 'react';
import { Check, ChevronDown, Info, X } from 'lucide-react';

const serviceGroups = [
  {
    label: 'Nursing Services',
    options: ['Home Care', 'Post-Op Care', 'Palliative Care', 'Wound Care'],
  },
  {
    label: 'Hospitality Services',
    options: ['Corporate Housing', 'Elderly Concierge', 'Short-Term Stay', 'Long-Term Stay'],
  },
];

/**
 * ServiceCategorySelect
 *
 * Props:
 *  - value: string[]          — currently selected service categories
 *  - onChange: (next: string[]) => void  — called with the updated selection
 *  - fieldStyles: string      — shared input class string from the parent form
 */
export default function ServiceCategorySelect({ value = [], onChange, fieldStyles = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const next = value.includes(option)
      ? value.filter((item) => item !== option)
      : [...value, option];
    onChange(next);
  };

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        <Info className="h-3.5 w-3.5 text-teal-600/70" />
        Service Category
      </label>

      <div className="relative">
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`${fieldStyles} flex min-h-[52px] bg-white items-center justify-between text-left cursor-pointer`}
        >
          <div className="flex flex-wrap gap-1.5">
            {value.length === 0 ? (
              <span className="text-gray-400">Select services...</span>
            ) : (
              value.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-700 border border-teal-100/50"
                >
                  {cat}
                  <X
                    className="h-3 w-3 hover:text-teal-900 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(cat);
                    }}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute z-20 mt-2 w-full max-h-80 overflow-y-auto rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
            {serviceGroups.map((group) => (
              <div key={group.label} className="mb-4 last:mb-0">
                <h3 className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400/80">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.options.map((option) => {
                    const isSelected = value.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleOption(option)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${isSelected
                            ? 'bg-teal-50 text-teal-700 font-bold'
                            : 'text-gray-700 hover:bg-gray-50/80'
                          }`}
                      >
                        {option}
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
