import React from 'react';

export type ClayBadgeVariant = 'purple' | 'blue' | 'green' | 'amber' | 'rose' | 'neutral';

interface ClayBadgeProps {
  children: React.ReactNode;
  variant?: ClayBadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.FC<{ className?: string }>;
  className?: string;
}

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  children,
  variant = 'purple',
  size = 'md',
  icon: Icon,
  className = '',
}) => {
  const variantStyles = {
    purple: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]',
    blue: 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]',
    green: 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]',
    amber: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
    rose: 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]',
    neutral: 'bg-[#FAF9FE] text-[#4A4668] border-[#E5DFF8]',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-lg',
    md: 'text-xs px-2.5 py-1 rounded-xl',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border shadow-xs select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 stroke-[2.4]" />}
      <span>{children}</span>
    </span>
  );
};
