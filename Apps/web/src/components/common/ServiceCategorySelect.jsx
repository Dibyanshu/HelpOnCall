import { useRef, useEffect, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * ServiceCategorySelect
 *
 * Props:
 *  - value: string[]          — currently selected labels
 *  - onChange: (next: string[]) => void  — called with the updated selection
 *  - fieldStyles: string      — shared input class string from the parent form
 *  - disabled: boolean
 *  - label: string            — optional label above input fields
 *  - icon: LucideIcon component — optional icon for label
 *  - placeholder: string
 *  - required: boolean
 */
export default function ServiceCategorySelect({
  value = [],
  onChange,
  fieldStyles = '',
  disabled = false,
  label,
  icon: LabelIcon,
  placeholder = "Select options",
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceGroups, setServiceGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/services`);
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        setServiceGroups(data);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

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
      {label && (
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-700 mb-1">
          {LabelIcon && <LabelIcon className="h-3.5 w-3.5 text-teal-600/70" />}
          <span>{label} {required && <span className="text-rose-500">*</span>}</span>
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`${fieldStyles} flex min-h-[80px] bg-white items-center justify-between text-left ${disabled ? 'opacity-50 cursor-not-allowed grayscale bg-slate-50' : 'cursor-pointer'}`}
        >
          <div className="flex flex-wrap gap-1.5">
            {value.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              value.map((val) => (
                <span
                  key={val}
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 border border-teal-100/50 shadow-sm"
                >
                  {val}
                  <X
                    className="h-3 w-3 hover:text-teal-900 cursor-pointer ml-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(val);
                    }}
                  />
                </span>
              ))
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-[70] mt-2 w-full max-h-80 overflow-y-auto rounded-xl bg-white p-2 shadow-2xl ring-1 ring-black/5">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LucideIcons.Loader2 className="h-6 w-6 animate-spin text-teal-600/50" />
              </div>
            ) : serviceGroups.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No options available</p>
            ) : (
              serviceGroups.map((group) => (
                <div key={group.categoryId} className="mb-4 last:mb-0">
                  <h3 className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-50 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400/80">
                      {group.title}
                    </span>
                  </h3>
                  <div className="space-y-1">
                    {group.features.map((option) => {
                      const isSelected = value.includes(option.label);
                      const IconComponent = LucideIcons[option.icon] || LucideIcons.HelpCircle;

                      return (
                        <button
                          key={option.serviceId}
                          type="button"
                          onClick={() => toggleOption(option.label)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer ${isSelected
                            ? 'bg-teal-50 text-teal-700 font-bold'
                            : 'text-gray-700 hover:bg-gray-50/80'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-1.5 rounded-md ${isSelected ? 'bg-teal-100/50' : 'bg-gray-100/50'}`}>
                              <IconComponent className={`h-4 w-4 shrink-0 ${isSelected ? 'text-teal-600' : 'text-gray-400'}`} />
                            </div>
                            <span>{option.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
