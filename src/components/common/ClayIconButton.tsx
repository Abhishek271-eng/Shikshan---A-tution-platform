import React from 'react';
import { LucideIcon } from 'lucide-react';

export type ClayIconButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger' | 'ghost';
export type ClayIconButtonSize = 'sm' | 'md' | 'lg';

interface ClayIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: ClayIconButtonVariant;
  size?: ClayIconButtonSize;
  badge?: number | string;
  tooltip?: string;
}

export const ClayIconButton: React.FC<ClayIconButtonProps> = ({
  icon: Icon,
  variant = 'secondary',
  size = 'md',
  badge,
  tooltip,
  className = '',
  disabled = false,
  ...rest
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-button-primary hover:from-[#6D28D9] hover:to-[#5B21B6]',
    secondary:
      'bg-white border border-[#E5DFF8] shadow-clay-sm text-[#1C1938] hover:text-[#7C3AED] hover:border-[#C4B5FD] hover:bg-[#FAF9FE]',
    subtle:
      'bg-[#EDE9FE] text-[#7C3AED] border border-[#DDD6FE] hover:bg-[#DDD6FE]',
    danger:
      'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FCA5A5]/40',
    ghost:
      'bg-transparent text-[#686487] hover:bg-black/5 hover:text-[#1C1938]',
  };

  return (
    <button
      type="button"
      title={tooltip}
      disabled={disabled}
      className={`relative inline-flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      <Icon className={`${iconSizes[size]} stroke-[2.2]`} />
      {Boolean(badge) && (
        <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] rounded-full bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
          {badge}
        </span>
      )}
    </button>
  );
};
