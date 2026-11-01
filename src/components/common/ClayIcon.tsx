import React from 'react';

interface ClayIconProps {
  icon: React.ReactNode;
  variant?: 'purple' | 'mint' | 'blue' | 'peach' | 'amber' | 'lavender';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ClayIcon: React.FC<ClayIconProps> = ({
  icon,
  variant = 'purple',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-3xl',
  };

  const variantStyles = {
    purple: {
      bg: 'bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE]',
      border: 'border-[#C4B5FD]',
      text: 'text-[#6D28D9]',
    },
    mint: {
      bg: 'bg-gradient-to-br from-[#E6F8F0] to-[#C9F3DE]',
      border: 'border-[#A7F3D0]',
      text: 'text-[#059669]',
    },
    blue: {
      bg: 'bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE]',
      border: 'border-[#BFDBFE]',
      text: 'text-[#2563EB]',
    },
    peach: {
      bg: 'bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5]',
      border: 'border-[#FED7AA]',
      text: 'text-[#EA580C]',
    },
    amber: {
      bg: 'bg-gradient-to-br from-[#FEFCE8] to-[#FEF08A]',
      border: 'border-[#FDE047]',
      text: 'text-[#CA8A04]',
    },
    lavender: {
      bg: 'bg-gradient-to-br from-[#FAF8FF] to-[#F1EEFB]',
      border: 'border-[#E4DDF7]',
      text: 'text-[#5B21B6]',
    },
  }[variant];

  return (
    <div
      className={`inline-flex items-center justify-center border shadow-clay-sm select-none flex-shrink-0 transition-transform active:scale-95 ${sizeMap[size]} ${variantStyles.bg} ${variantStyles.border} ${variantStyles.text} ${className}`}
    >
      {icon}
    </div>
  );
};
