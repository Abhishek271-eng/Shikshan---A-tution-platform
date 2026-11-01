import React from 'react';
import { Check } from 'lucide-react';

interface ClayCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  subLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const ClayCheckbox: React.FC<ClayCheckboxProps> = ({
  checked,
  onChange,
  label,
  subLabel,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-start gap-3 select-none cursor-pointer group ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          if (!disabled) onChange(!checked);
        }}
        className={`w-5 h-5 mt-0.5 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0 cursor-pointer ${
          checked
            ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-button-primary scale-100'
            : 'bg-white border-2 border-[#E5DFF8] shadow-clay-sm hover:border-[#C4B5FD]'
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </div>

      {(label || subLabel) && (
        <div className="text-left leading-snug">
          {label && <div className="text-xs font-bold text-[#1C1938]">{label}</div>}
          {subLabel && <div className="text-[11px] text-[#686487] mt-0.5">{subLabel}</div>}
        </div>
      )}
    </label>
  );
};
