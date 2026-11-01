import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Check } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

interface PasswordInputProps {
  id?: string;
  label?: string;
  kannadaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  showRequirements?: boolean;
  showStrengthIndicator?: boolean;
  error?: string | null;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  requirements: PasswordRequirement[];
  metCount: number;
} {
  const requirements: PasswordRequirement[] = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'At least one uppercase letter (A–Z)', met: /[A-Z]/.test(password) },
    { id: 'lower', label: 'At least one lowercase letter (a–z)', met: /[a-z]/.test(password) },
    { id: 'number', label: 'At least one number (0–9)', met: /[0-9]/.test(password) },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const isValid = metCount === requirements.length;

  return { isValid, requirements, metCount };
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id = 'password-input',
  label = 'Password',
  kannadaLabel,
  value,
  onChange,
  required = true,
  showRequirements = false,
  showStrengthIndicator,
  error,
  placeholder,
  autoComplete = 'new-password',
  className = '',
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { isValid, requirements, metCount } = validatePasswordStrength(value);

  const getStrengthBarColor = () => {
    if (metCount <= 2) return 'bg-red-500';
    if (metCount <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
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
          {value.length > 0 && showRequirements && (
            <span
              className={`text-[10px] font-bold ${
                isValid ? 'text-emerald-600' : metCount >= 3 ? 'text-amber-600' : 'text-red-500'
              }`}
            >
              {isValid ? 'Strong Password' : `${metCount}/5 Requirements`}
            </span>
          )}
        </label>
      )}

      {/* Non-overlapping Flexbox Container */}
      <div
        className={`flex items-center w-full rounded-2xl bg-white border transition-all shadow-xs ${
          error
            ? 'border-red-500 bg-red-50/20 ring-1 ring-red-200'
            : 'border-[#DFD8F3] focus-within:border-[#4136CA] focus-within:ring-2 focus-within:ring-[#EDE9FE]'
        }`}
      >
        <div className="pl-3.5 pr-1 flex items-center pointer-events-none text-[#6D28D9] flex-shrink-0">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder || undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="flex-1 min-w-0 bg-transparent px-3 py-3 text-xs sm:text-sm font-semibold text-[#1C1938] placeholder:text-[#9CA3AF] focus:outline-none"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-requirements`}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="pr-3.5 pl-1 flex items-center text-[#8B5CF6] hover:text-[#6D28D9] focus:outline-none cursor-pointer flex-shrink-0"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength Bar */}
      {value.length > 0 && (showStrengthIndicator || showRequirements) && (
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-[#E6E1F7] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}
              style={{ width: `${(metCount / 5) * 100}%` }}
            />
          </div>

          {/* Detailed requirements checklist if focused or weak */}
          {(isFocused || (!isValid && value.length > 0)) && showRequirements && (
            <div
              id={`${id}-requirements`}
              className="p-3 rounded-2xl bg-[#F4F1FA] border border-[#DFD8F3] space-y-1 animate-fadeIn"
            >
              <p className="text-[10px] font-bold text-[#4A4668] uppercase tracking-wider">
                Password Security Checklist
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center gap-1.5 ${
                      req.met ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] flex-shrink-0 ${
                        req.met ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {req.met ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                    </span>
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-red-600 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};
