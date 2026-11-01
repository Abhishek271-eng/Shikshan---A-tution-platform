import React from 'react';

interface AcademicHeroIllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AcademicHeroIllustration: React.FC<AcademicHeroIllustrationProps> = ({
  className = '',
  size = 'md',
}) => {
  const dimensions = {
    sm: 'w-24 h-20',
    md: 'w-36 h-28 sm:w-44 sm:h-32',
    lg: 'w-48 h-36 sm:w-56 sm:h-40',
  }[size];

  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 220 160"
        className={`${dimensions} drop-shadow-md overflow-visible`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Ambient Glow */}
          <radialGradient id="acadAmbientGlow" cx="50%" cy="60%" r="55%">
            <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#DDD6FE" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#DDD6FE" stopOpacity="0" />
          </radialGradient>

          {/* Deep Indigo Book Cover Gradient */}
          <linearGradient id="bookBottomGrad" x1="20" y1="110" x2="200" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="50%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>

          {/* Periwinkle Mid Book Gradient */}
          <linearGradient id="bookMidGrad" x1="30" y1="90" x2="190" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>

          {/* Pages Edge Cream Gradient */}
          <linearGradient id="pagesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Golden Bookmark Ribbon */}
          <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Golden Pencil Gradient */}
          <linearGradient id="pencilWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Soft Drop Shadow Filter */}
          <filter id="softShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#312E81" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Ambient Warm Glow behind books */}
        <ellipse cx="110" cy="115" rx="85" ry="32" fill="url(#acadAmbientGlow)" />

        {/* Shadow under foundation book */}
        <ellipse cx="110" cy="140" rx="76" ry="10" fill="#DFD8F3" fillOpacity="0.8" />

        {/* ================= FOUNDATION BOOK (Deep Indigo) ================= */}
        <g filter="url(#softShadow)">
          {/* Bottom cover spine & base */}
          <path
            d="M 34 122 C 60 114 96 114 110 120 C 124 114 160 114 186 122 L 182 136 C 158 128 124 128 110 134 C 96 128 62 128 38 136 Z"
            fill="url(#bookBottomGrad)"
          />
          {/* Page block edge */}
          <path
            d="M 38 120 C 62 112 96 112 110 118 C 124 112 158 112 182 120 L 180 127 C 156 120 124 120 110 125 C 96 120 64 120 40 127 Z"
            fill="url(#pagesGrad)"
          />
        </g>

        {/* ================= MIDDLE BOOK (Periwinkle & Violet) ================= */}
        <g filter="url(#softShadow)">
          {/* Spine and bottom edge */}
          <path
            d="M 42 102 C 66 95 96 95 110 100 C 124 95 154 95 178 102 L 174 114 C 152 107 124 107 110 112 C 96 107 68 107 46 114 Z"
            fill="url(#bookMidGrad)"
          />
          {/* Pages */}
          <path
            d="M 45 100 C 68 93 96 93 110 98 C 124 93 152 93 175 100 L 172 106 C 150 100 124 100 110 105 C 96 100 70 100 48 106 Z"
            fill="url(#pagesGrad)"
          />
        </g>

        {/* ================= TOP OPEN BOOK (White & Lavender with Gold Bookmark) ================= */}
        <g filter="url(#softShadow)">
          {/* Hardcover Backing */}
          <path
            d="M 42 78 C 66 70 98 72 110 79 C 122 72 154 70 178 78 L 174 91 C 152 83 124 85 110 91 C 96 85 68 83 46 91 Z"
            fill="#312E81"
          />

          {/* Left Open Page (Gentle Curve) */}
          <path
            d="M 44 75 C 68 66 98 68 110 76 L 110 88 C 98 81 68 79 46 87 Z"
            fill="#FFFFFF"
          />
          {/* Left Page Soft Shadow / Crease */}
          <path
            d="M 104 74 C 107 75 109 75 110 76 L 110 88 C 109 87 107 86 104 86 Z"
            fill="#C7D2FE"
            fillOpacity="0.4"
          />
          {/* Text lines on left page */}
          <line x1="56" y1="74" x2="96" y2="72" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="78.5" x2="90" y2="76.5" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="56" y1="83" x2="84" y2="81" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />

          {/* Right Open Page (Gentle Curve) */}
          <path
            d="M 110 76 C 122 68 152 66 176 75 L 174 87 C 152 79 122 81 110 88 Z"
            fill="#F8FAFC"
          />
          {/* Right Page Crease */}
          <path
            d="M 110 76 C 111 75 113 75 116 74 L 116 86 C 113 86 111 87 110 88 Z"
            fill="#CBD5E1"
            fillOpacity="0.35"
          />
          {/* Text lines on right page */}
          <line x1="124" y1="72" x2="164" y2="74" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
          <line x1="124" y1="76.5" x2="158" y2="78.5" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="124" y1="81" x2="152" y2="83" stroke="#CBD5E1" strokeWidth="1.6" strokeLinecap="round" />

          {/* Golden Bookmark Ribbon Hanging down */}
          <path
            d="M 108 76 L 108 98 L 110 95 L 112 98 L 112 76 Z"
            fill="url(#ribbonGrad)"
          />
        </g>

        {/* ================= FLOATING GOLDEN PENCIL ================= */}
        <g transform="rotate(32 155 42)" filter="url(#softShadow)">
          {/* Pencil Body */}
          <rect x="145" y="24" width="8" height="34" rx="2" fill="url(#pencilWood)" />
          {/* Eraser Ferrule (Silver) */}
          <rect x="145" y="22" width="8" height="4" fill="#94A3B8" />
          {/* Eraser (Soft Coral/Pink) */}
          <rect x="145" y="18" width="8" height="4" rx="1.5" fill="#F43F5E" />
          {/* Sharpened Cone Tip (Wood) */}
          <polygon points="145,58 153,58 149,67" fill="#FDE68A" />
          {/* Graphite Lead Tip */}
          <polygon points="147.5,63.5 150.5,63.5 149,67" fill="#1E293B" />
        </g>

        {/* ================= WISDOM SPARKS & STAR PARTICLES ================= */}
        {/* Main Golden Star Spark */}
        <path
          d="M 110 32 L 112.5 42 L 122.5 44.5 L 112.5 47 L 110 57 L 107.5 47 L 97.5 44.5 L 107.5 42 Z"
          fill="#F59E0B"
        />
        <circle cx="110" cy="44.5" r="2" fill="#FEF08A" />

        {/* Periwinkle Accent Spark Left */}
        <path
          d="M 52 46 L 53.5 51 L 58.5 52.5 L 53.5 54 L 52 59 L 50.5 54 L 45.5 52.5 L 50.5 51 Z"
          fill="#6366F1"
        />

        {/* Amber Spark Right */}
        <path
          d="M 176 50 L 177.5 54 L 181.5 55.5 L 177.5 57 L 176 61 L 174.5 57 L 170.5 55.5 L 174.5 54 Z"
          fill="#F59E0B"
        />

        {/* Floating knowledge dots */}
        <circle cx="40" cy="62" r="2.5" fill="#A78BFA" opacity="0.8" />
        <circle cx="186" cy="42" r="2.2" fill="#FBBF24" opacity="0.9" />
        <circle cx="128" cy="26" r="1.8" fill="#818CF8" opacity="0.75" />
      </svg>
    </div>
  );
};
