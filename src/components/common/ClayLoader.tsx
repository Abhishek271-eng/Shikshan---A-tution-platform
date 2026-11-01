import React from 'react';

interface ClayLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ClayLoader: React.FC<ClayLoaderProps> = ({
  message = 'Loading verified mentors...',
  size = 'md',
  className = '',
}) => {
  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 select-none ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`${dotSizes} rounded-full bg-[#7C3AED] shadow-clay-sm animate-bounce [animation-delay:-0.3s]`} />
        <div className={`${dotSizes} rounded-full bg-[#A78BFA] shadow-clay-sm animate-bounce [animation-delay:-0.15s]`} />
        <div className={`${dotSizes} rounded-full bg-[#38BDF8] shadow-clay-sm animate-bounce`} />
      </div>
      {message && (
        <p className="text-xs font-bold text-[#686487] tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
