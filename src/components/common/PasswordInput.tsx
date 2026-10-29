import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

interface PasswordInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  showRequirements?: boolean;
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
  value,
  onChange,
  required = true,
  showRequirements = true,
  error,
  placeholder = 'Enter secure password',
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
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </span>
          {value.length > 0 && showRequirements && (
            <span
              className={`text-xs font-semibold ${
                isValid ? 'text-emerald-600' : metCount >= 3 ? 'text-amber-600' : 'text-red-500'
              }`}
            >
              {isValid ? 'Strong Password' : `${metCount}/5 Requirements`}
            </span>
          )}
        </label>
      )}

      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className={`clay-input pl-11 pr-12 ${error ? 'clay-input-error' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-requirements`}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Strength Progress Bar */}
      {showRequirements && value.length > 0 && (
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}
            style={{ width: `${(metCount / 5) * 100}%` }}
          />
        </div>
      )}

      {/* Interactive Requirements Checklist */}
      {showRequirements && (isFocused || value.length > 0) && (
        <div
          id={`${id}-requirements`}
          className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 mt-1 space-y-1.5 text-xs select-none"
        >
          <p className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
            Password Must Contain:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {requirements.map((req) => (
              <div
                key={req.id}
                className={`flex items-center gap-1.5 transition-colors ${
                  req.met ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                }`}
              >
                {req.met ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 stroke-[3]" />
                ) : (
                  <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-300 flex-shrink-0">
                    <X className="w-3 h-3 stroke-[2]" />
                  </span>
                )}
                <span className="text-[11px] leading-tight">{req.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 mt-0.5 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};
