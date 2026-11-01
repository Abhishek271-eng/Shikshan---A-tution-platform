import React from 'react';

interface ClaySwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  subLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const ClaySwitch: React.FC<ClaySwitchProps> = ({
  checked,
  onChange,
  label,
  subLabel,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-between select-none ${className}`}>
      {(label || subLabel) && (
        <div className="text-left leading-snug">
          {label && <div className="text-xs font-bold text-[#1C1938]">{label}</div>}
          {subLabel && <div className="text-[11px] text-[#686487]">{subLabel}</div>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer relative shadow-inner ${
          checked ? 'bg-[#7C3AED]' : 'bg-[#E5DFF8]'
        } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <div
          className={`w-6 h-6 rounded-full bg-white shadow-clay-button transition-transform duration-200 ease-in-out flex items-center justify-center ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              checked ? 'bg-[#7C3AED]' : 'bg-[#C4B5FD]'
            }`}
          />
        </div>
      </button>
    </div>
  );
};
