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
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-800 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
          {kannadaLabel && (
            <span className="text-xs font-normal text-slate-500 font-kannada">
              {kannadaLabel}
            </span>
          )}
        </label>

        <div className="relative w-full">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`clay-input ${icon ? 'pl-11' : 'pl-4'} ${error ? 'clay-input-error' : ''} ${className}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>

        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-slate-500 mt-0.5">
            {hint}
          </p>
        )}

        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-red-600 mt-0.5 flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';
