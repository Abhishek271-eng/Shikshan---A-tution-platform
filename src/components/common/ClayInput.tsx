import React from 'react';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  kannadaLabel?: string;
}

export const ClayInput = React.forwardRef<HTMLInputElement, ClayInputProps>(
  ({ label, error, hint, icon, kannadaLabel, required, id, className = '', ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/[^a-z0-9]/g, '-');

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {/* Persistent Label */}
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold text-[#1C1938] flex items-center justify-between">
            <span>
              {label} {required && <span className="text-red-500 font-bold">*</span>}
            </span>
            {kannadaLabel && (
              <span className="text-[11px] font-normal text-[#686487] font-kannada">
                {kannadaLabel}
              </span>
            )}
          </label>
        )}

        {/* Unified Flexbox Input Container — Guaranteeing Zero Overlapping */}
        <div
          className={`flex items-center w-full rounded-2xl bg-white border transition-all shadow-xs ${
            error
              ? 'border-red-500 bg-red-50/20 ring-1 ring-red-200'
              : 'border-[#DFD8F3] focus-within:border-[#4136CA] focus-within:ring-2 focus-within:ring-[#EDE9FE]'
          }`}
        >
          {icon && (
            <div className="pl-3.5 pr-1 flex items-center pointer-events-none text-[#6D28D9] flex-shrink-0">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`flex-1 min-w-0 bg-transparent px-3 py-3 text-xs sm:text-sm font-semibold text-[#1C1938] placeholder:text-[#9CA3AF] focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-[11px] text-[#686487]">
            {hint}
          </p>
        )}

        {error && (
          <p id={`${inputId}-error`} className="text-[11px] font-medium text-red-600 flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';
