import React from 'react';

interface ClayRadioButtonProps {
  selected: boolean;
  onSelect: () => void;
  label?: React.ReactNode;
  subLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const ClayRadioButton: React.FC<ClayRadioButtonProps> = ({
  selected,
  onSelect,
  label,
  subLabel,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      onClick={() => {
        if (!disabled) onSelect();
      }}
      className={`inline-flex items-start gap-3 select-none cursor-pointer group ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <div
        className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
          selected
            ? 'border-2 border-[#7C3AED] bg-white shadow-button-primary'
            : 'border-2 border-[#E5DFF8] bg-white shadow-clay-sm group-hover:border-[#C4B5FD]'
        }`}
      >
        {selected && (
          <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] animate-scaleIn" />
        )}
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
