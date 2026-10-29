import React from 'react';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';

interface PhoneInputProps {
  id?: string;
  label?: string;
  kannadaLabel?: string;
  value: string; // 10 digits string without +91
  onChange: (value: string) => void;
  required?: boolean;
  error?: string | null;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id = 'phone-input',
  label = 'Mobile Number',
  kannadaLabel = 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
  value,
  onChange,
  required = true,
  error,
  hint,
  disabled = false,
  className = '',
}) => {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
  const isComplete = digitsOnly.length === 10;
  const isValidIndianPrefix = digitsOnly.length > 0 ? /^[6-9]/.test(digitsOnly) : true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const clean = raw.slice(0, 10);
    onChange(clean);
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
          {kannadaLabel && (
            <span className="text-xs font-normal text-slate-500 font-kannada">
              {kannadaLabel}
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {/* +91 Country Badge fixed inside the input container */}
        <div className="absolute inset-y-0 left-0 pl-3.5 pr-2.5 flex items-center pointer-events-none border-r border-[#DFD8F3] text-[#1C1938] font-bold text-sm bg-[#F4F1FA] rounded-l-[16px]">
          <span className="text-[#A7AAE5] mr-1.5">
            <Phone className="w-3.5 h-3.5 inline" />
          </span>
          <span>+91</span>
        </div>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          placeholder="98765 43210"
          value={digitsOnly}
          onChange={handleChange}
          maxLength={10}
          className={`clay-input pl-24 pr-16 font-mono tracking-wide ${
            error || (!isValidIndianPrefix && digitsOnly.length > 0) ? 'clay-input-error' : ''
          }`}
          aria-invalid={Boolean(error || (!isValidIndianPrefix && digitsOnly.length > 0))}
          aria-describedby={`${id}-feedback`}
        />

        {/* Live digit counter & check indicator */}
        <div className="absolute right-3 flex items-center gap-1.5 text-xs pointer-events-none">
          {isComplete && isValidIndianPrefix ? (
            <span className="text-emerald-600 flex items-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          ) : (
            <span
              className={`font-mono text-[11px] font-semibold ${
                digitsOnly.length > 0 && !isValidIndianPrefix
                  ? 'text-red-500'
                  : digitsOnly.length === 0
                  ? 'text-slate-400'
                  : 'text-blue-600'
              }`}
            >
              {digitsOnly.length}/10
            </span>
          )}
        </div>
      </div>

      {/* Inline Feedback */}
      <div id={`${id}-feedback`} className="min-h-[18px]">
        {error ? (
          <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : digitsOnly.length > 0 && !isValidIndianPrefix ? (
          <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Indian mobile numbers must start with 6, 7, 8, or 9.</span>
          </p>
        ) : hint ? (
          <p className="text-xs text-slate-500 mt-0.5">{hint}</p>
        ) : null}
      </div>
    </div>
  );
};
