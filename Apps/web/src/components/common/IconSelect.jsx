import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const uniqueIcons = new Map();
Object.keys(LucideIcons).forEach((key) => {
  if (
    /^[A-Z]/.test(key) &&
    typeof LucideIcons[key] !== 'string' &&
    key !== 'Icon' &&
    key !== 'LucideIcon'
  ) {
    const component = LucideIcons[key];
    const existingKey = uniqueIcons.get(component);

    if (!existingKey) {
      uniqueIcons.set(component, key);
    } else {
      const existingIsAlias = existingKey.startsWith('Lucide') || existingKey.endsWith('Icon');
      const newIsAlias = key.startsWith('Lucide') || key.endsWith('Icon');

      if (existingIsAlias && !newIsAlias) {
        uniqueIcons.set(component, key);
      } else if (!existingIsAlias && !newIsAlias && key.length < existingKey.length) {
        uniqueIcons.set(component, key);
      }
    }
  }
});

export const availableIcons = Array.from(uniqueIcons.values()).sort();

export default function IconSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  const filteredIcons = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return availableIcons.slice(0, 50);
    return availableIcons.filter(name => name.toLowerCase().includes(q)).slice(0, 50);
  }, [search]);

  const SelectedIcon = value && LucideIcons[value] ? LucideIcons[value] : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
      >
        <div className="flex items-center gap-2 truncate">
          {SelectedIcon && typeof SelectedIcon !== 'string' ? (
            <SelectedIcon size={18} className="text-teal-700 shrink-0" />
          ) : (
            <div className="h-4 w-4 shrink-0 rounded-full bg-slate-100 border border-slate-200" />
          )}
          <span className={`truncate ${value ? "text-slate-900" : "text-slate-400"}`}>
            {value || "Select an icon..."}
          </span>
        </div>
        <ChevronDown size={16} className="text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-80 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName) => {
                const IconComponent = LucideIcons[iconName];
                const isSelected = value === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors ${isSelected ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <IconComponent size={18} className={`shrink-0 ${isSelected ? "text-teal-700" : "text-slate-500"}`} />
                      <span className="truncate">{iconName}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-teal-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 italic">No icons found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
