import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface ClayDropdownProps {
  label?: string;
  subLabel?: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ClayDropdown: React.FC<ClayDropdownProps> = ({
  label,
  subLabel,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1.5 text-left relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[#1C1938] px-1">
          {label}
          {subLabel && <span className="font-kannada text-[#7C3AED] ml-1.5 font-normal">({subLabel})</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm text-xs font-semibold text-[#1C1938] hover:border-[#C4B5FD] transition-all cursor-pointer select-none active:scale-[0.99]"
      >
        <span className={selectedOption ? 'text-[#1C1938]' : 'text-[#9CA3AF]'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#7C3AED] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-1.5 rounded-2xl bg-white border border-[#E5DFF8] shadow-xl max-h-56 overflow-y-auto space-y-0.5 animate-fadeIn">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#EDE9FE] text-[#7C3AED] font-black' : 'text-[#1C1938] hover:bg-[#FAF9FE]'
                }`}
              >
                <div>
                  <div>{opt.label}</div>
                  {opt.subtitle && <div className="text-[10px] text-[#686487] font-normal">{opt.subtitle}</div>}
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#7C3AED]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
