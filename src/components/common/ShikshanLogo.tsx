import React from 'react';

export interface ShikshanLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  variant?: 'color' | 'light';
  logoOnly?: boolean;
}

/**
 * Official Shikshan (ಶಿಕ್ಷಣ) Application Logo Component
 * Uses the official logo from public/images/logo.png
 * Preserves original aspect ratio with object-contain without stretching or cropping.
 */
export const ShikshanLogo: React.FC<ShikshanLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
  variant = 'color',
  logoOnly = false,
}) => {
  const dimMap: Record<string, { img: string; text: string; sub: string }> = {
    xs: { img: 'w-7 h-7', text: 'text-sm', sub: 'text-[8px]' },
    sm: { img: 'w-9 h-9', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-11 h-11', text: 'text-lg', sub: 'text-[10px]' },
    lg: { img: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
    '2xl': { img: 'w-28 h-28', text: 'text-4xl', sub: 'text-base' },
  };

  const current = dimMap[size] || dimMap.md;

  const logoImage = (
    <img
      src="/images/logo.png"
      alt="Shikshan (ಶಿಕ್ಷಣ)"
      className={`${current.img} object-contain flex-shrink-0 select-none`}
      loading="eager"
    />
  );

  if (logoOnly || !showText) {
    return <div className={`inline-flex items-center ${className}`}>{logoImage}</div>;
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {logoImage}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline gap-1.5">
          <h1
            className={`${current.text} font-display font-black ${
              variant === 'light' ? 'text-white' : 'text-[#1C1938]'
            } tracking-tight leading-none`}
          >
            Shikshan
          </h1>
          <span
            className={`text-xs font-bold ${
              variant === 'light' ? 'text-purple-200' : 'text-[#4136CA]'
            } font-kannada leading-none`}
          >
            ಶಿಕ್ಷಣ
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`${current.sub} ${
              variant === 'light' ? 'text-purple-100/80' : 'text-[#686487]'
            } font-medium tracking-tight mt-0.5 leading-tight`}
          >
            Karnataka Micro-Batch Learning
          </span>
        )}
      </div>
    </div>
  );
};
