import React from 'react';

interface ClayChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  count?: number | string;
  icon?: React.ReactNode;
  kannadaLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const ClayChip: React.FC<ClayChipProps> = ({
  label,
  isActive = false,
  onClick,
  count,
  icon,
  kannadaLabel,
  size = 'md',
  className = '',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs rounded-xl min-h-[32px]'
      : 'px-4 py-2 text-xs sm:text-sm rounded-2xl min-h-[40px]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 font-bold whitespace-nowrap transition-all select-none border active:scale-95 cursor-pointer ${sizeClasses} ${
        isActive
          ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white border-[#6D28D9] shadow-button-primary'
          : 'bg-white/95 text-[#4A4668] hover:bg-[#F9F7FE] hover:text-[#6D28D9] hover:border-[#C4B5FD] border-[#E5DFF8] shadow-clay-sm'
      } ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {kannadaLabel && (
        <span
          className={`text-[10px] font-normal font-kannada ${
            isActive ? 'text-white/80' : 'text-[#7C7799]'
          }`}
        >
          {kannadaLabel}
        </span>
      )}
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            isActive ? 'bg-white/20 text-white' : 'bg-[#EDE9FE] text-[#6D28D9]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
