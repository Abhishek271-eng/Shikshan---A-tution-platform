import React from 'react';
import { Phone, CheckCircle2 } from 'lucide-react';

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
  placeholder?: string;
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
  placeholder,
}) => {
  const digitsOnly = (value || '').replace(/\D/g, '').slice(0, 10);
  const isComplete = digitsOnly.length === 10;
  const isValidIndianPrefix = digitsOnly.length > 0 ? /^[6-9]/.test(digitsOnly) : true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const clean = raw.slice(0, 10);
    onChange(clean);
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full text-left ${className}`}>
      {/* Persistent Label */}
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-[#1C1938] flex items-center justify-between">
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

      {/* Two Separate Visual Areas: Country Code Container + Separate Phone Input */}
      <div
        className={`flex items-center w-full rounded-2xl bg-white border transition-all shadow-xs ${
          error || (!isValidIndianPrefix && digitsOnly.length > 0)
            ? 'border-red-500 bg-red-50/20 ring-1 ring-red-200'
            : 'border-[#DFD8F3] focus-within:border-[#4136CA] focus-within:ring-2 focus-within:ring-[#EDE9FE]'
        }`}
      >
        {/* Visual Area 1: Separate Country Code Badge */}
        <div className="flex items-center gap-1 px-3 py-3 bg-[#F4F1FA] border-r border-[#DFD8F3] text-[#1C1938] font-bold text-xs select-none flex-shrink-0 rounded-l-[15px]">
          <Phone className="w-3.5 h-3.5 text-[#4136CA]" />
          <span>+91</span>
        </div>

        {/* Visual Area 2: Independent Text Input - No overlapping positioning */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          placeholder={placeholder || undefined}
          value={digitsOnly}
          onChange={handleChange}
          maxLength={10}
          className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm font-semibold text-[#1C1938] placeholder:text-[#9CA3AF] focus:outline-none tracking-wider font-mono disabled:text-gray-400 disabled:cursor-not-allowed"
          aria-invalid={Boolean(error || (!isValidIndianPrefix && digitsOnly.length > 0))}
          aria-describedby={`${id}-feedback`}
        />

        {/* Visual Area 3: Live Digit Counter & Verification Checkmark */}
        <div className="pr-3 flex items-center gap-1 text-xs select-none flex-shrink-0">
          {isComplete && isValidIndianPrefix ? (
            <span className="text-emerald-600 flex items-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          ) : (
            <span
              className={`font-mono text-[11px] font-bold ${
                digitsOnly.length > 0 && !isValidIndianPrefix
                  ? 'text-red-500'
                  : digitsOnly.length === 0
                  ? 'text-[#9CA3AF]'
                  : 'text-[#4136CA]'
              }`}
            >
              {digitsOnly.length}/10
            </span>
          )}
        </div>
      </div>

      {/* Validation Feedback & Hints */}
      {digitsOnly.length > 0 && !isValidIndianPrefix && (
        <p id={`${id}-feedback`} className="text-[11px] font-medium text-red-600 flex items-center gap-1">
          <span>•</span> Valid Indian mobile numbers must begin with 6, 7, 8, or 9
        </p>
      )}

      {error && (
        <p id={`${id}-feedback`} className="text-[11px] font-medium text-red-600 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-[11px] text-[#686487]">
          {hint}
        </p>
      )}
    </div>
  );
};
