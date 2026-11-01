import React from 'react';

interface ShikshanLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  variant?: 'color' | 'light';
}

/**
 * Official Shikshan (ಶಿಕ್ಷಣ) Logo Emblem
 * Visual Identity: Plant Sprout Growing from an Open Book of Knowledge
 * Tagline: "Learn with confidence. Grow with guidance." (ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ. ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.)
 */
export const ShikshanLogo: React.FC<ShikshanLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
  variant = 'color',
}) => {
  const dimMap = {
    xs: { box: 'w-7 h-7', iconSize: 28, text: 'text-sm', sub: 'text-[8px]' },
    sm: { box: 'w-9 h-9', iconSize: 36, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-11 h-11', iconSize: 44, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', iconSize: 56, text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', iconSize: 80, text: 'text-3xl', sub: 'text-sm' },
  };

  const current = dimMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Emblem: Plant growing from open book */}
      <div
        className={`${current.box} rounded-2xl bg-gradient-to-br from-[#2E1065] via-[#4338CA] to-[#6366F1] p-1.5 flex items-center justify-center shadow-clay-button flex-shrink-0 border border-white/50 relative overflow-hidden`}
      >
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-amber-300/20 pointer-events-none" />

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-sm"
          aria-hidden="true"
        >
          {/* Foundation: Open Book Hardcover Base */}
          <path
            d="M8 48C16 43 26 43 32 46C38 43 48 43 56 48L53 53C46 49 38 49 32 52C26 49 18 49 11 53L8 48Z"
            fill="#1E1B4B"
          />

          {/* Book Spine Center Notch */}
          <path
            d="M31 46.5V52C31.5 52.2 32.5 52.2 33 52V46.5C32.5 46.3 31.5 46.3 31 46.5Z"
            fill="#F59E0B"
          />

          {/* Left Book Page Spread (Gentle Curve) */}
          <path
            d="M10 46C17 41 26 41 32 45L32 38C26 34 17 34 10 39V46Z"
            fill="#FFFFFF"
          />
          <path
            d="M11 44C18 39.5 25 39.5 31 43V38.5C25 35 18 35 11 39.5V44Z"
            fill="#F8FAFC"
          />
          {/* Left Page Text Lines */}
          <line x1="15" y1="40" x2="27" y2="39" stroke="#A5B4FC" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="15" y1="43" x2="25" y2="42" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />

          {/* Right Book Page Spread (Gentle Curve) */}
          <path
            d="M32 45C38 41 47 41 54 46V39C47 34 38 34 32 38V45Z"
            fill="#F1F5F9"
          />
          <path
            d="M33 43C39 39.5 46 39.5 53 44V39.5C46 35 39 35 33 38.5V43Z"
            fill="#FFFFFF"
          />
          {/* Right Page Text Lines */}
          <line x1="37" y1="39" x2="49" y2="40" stroke="#A5B4FC" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="39" y1="42" x2="49" y2="43" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />

          {/* ================= PLANT SPROUT GROWING UPWARD ================= */}
          {/* Sprout Root / Base in book spine */}
          <circle cx="32" cy="41" r="2" fill="#047857" />

          {/* Main Growing Stem */}
          <path
            d="M32 41 C32 35 31.5 29 32 23"
            stroke="#10B981"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M32 38 C32 32 32 26 32 24"
            stroke="#34D399"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Left Tender Leaf (Emerging and arching up) */}
          <path
            d="M32 31 C25 29 20 22 23 16 C29 17 31 23 32 27 Z"
            fill="#10B981"
          />
          <path
            d="M30 28 C26 26 23 21 24 18 C28 19 30 23 31 26 Z"
            fill="#34D399"
          />
          {/* Left Leaf Vein */}
          <path
            d="M31 27 C28 24 26 21 24 18"
            stroke="#ECFDF5"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Right Tender Leaf (Sprouting outward & reaching sun) */}
          <path
            d="M32 28 C39 26 44 19 41 13 C35 14 33 20 32 24 Z"
            fill="#059669"
          />
          <path
            d="M32 26 C38 24 42 18 40 15 C35 16 33 20 32 23 Z"
            fill="#10B981"
          />
          {/* Right Leaf Vein */}
          <path
            d="M32 25 C35 22 38 18 40 15"
            stroke="#D1FAE5"
            strokeWidth="0.9"
            strokeLinecap="round"
          />

          {/* Young Apex Leaf Bud (New growth at tip) */}
          <path
            d="M32 22 C30 18 31 14 32 12 C33 14 34 18 32 22 Z"
            fill="#6EE7B7"
          />

          {/* ================= GOLDEN GUIDANCE SPARKS & SUNLIGHT ================= */}
          {/* Central Apex Guidance Star */}
          <path
            d="M32 6 L33.2 9.5 L36.5 10.5 L33.2 11.5 L32 15 L30.8 11.5 L27.5 10.5 L30.8 9.5 Z"
            fill="#FBBF24"
          />
          <circle cx="32" cy="10.5" r="1.2" fill="#FFFBEB" />

          {/* Left Sparkle Dot */}
          <circle cx="20" cy="12" r="1.5" fill="#FDE68A" />

          {/* Right Sparkle Dot */}
          <circle cx="45" cy="9" r="1.3" fill="#FDE68A" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-1.5">
            <h1
              className={`${current.text} font-black ${
                variant === 'light' ? 'text-white' : 'text-slate-900'
              } tracking-tight leading-none m-0 inline-block`}
            >
              Shikshan
            </h1>
            <span
              className={`text-[11px] font-bold ${
                variant === 'light' ? 'text-purple-200' : 'text-[#7C3AED]'
              } font-kannada leading-none`}
            >
              ಶಿಕ್ಷಣ
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`${current.sub} ${
                variant === 'light' ? 'text-purple-100/80' : 'text-slate-500'
              } font-medium tracking-tight mt-1 leading-tight`}
            >
              Learn with confidence. Grow with guidance.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
