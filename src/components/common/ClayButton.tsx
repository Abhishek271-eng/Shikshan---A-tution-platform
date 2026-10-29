import React from 'react';
import { Loader2 } from 'lucide-react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm rounded-xl min-h-[40px]';
      case 'lg':
        return 'px-6 py-4 text-base md:text-lg rounded-2xl min-h-[54px]';
      case 'md':
      default:
        return 'px-5 py-3 text-base rounded-2xl min-h-[48px]';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'clay-button-secondary text-blue-800';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-md active:translate-y-0.5';
      case 'ghost':
        return 'bg-transparent hover:bg-blue-50 text-slate-700 active:bg-blue-100';
      case 'primary':
      default:
        return 'clay-button-primary text-white';
    }
  };

  return (
    <button
      className={`font-semibold inline-flex items-center justify-center gap-2 transition-all duration-200 select-none ${getSizeClasses()} ${getVariantClasses()} ${
        fullWidth ? 'w-full' : ''
      } ${disabled || isLoading ? 'opacity-60 cursor-not-allowed transform-none shadow-none' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
