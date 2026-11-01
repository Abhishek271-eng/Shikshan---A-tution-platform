import React from 'react';

interface ClayCharacterPeekingProps {
  className?: string;
}

export const ClayCharacterPeeking: React.FC<ClayCharacterPeekingProps> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-end justify-center select-none pointer-events-none ${className}`}>
      {/* 3D Claymorphic Character Illustration */}
      <svg
        viewBox="0 0 200 130"
        className="w-36 h-24 sm:w-44 sm:h-28 drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Hair Gradient */}
          <linearGradient id="hairGrad" x1="50" y1="10" x2="150" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A2E18" />
            <stop offset="50%" stopColor="#36200F" />
            <stop offset="100%" stopColor="#241408" />
          </linearGradient>

          {/* Skin Gradient */}
          <radialGradient id="skinGrad" cx="100" cy="65" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFDFD0" />
            <stop offset="70%" stopColor="#F5C6B0" />
            <stop offset="100%" stopColor="#E5B29B" />
          </radialGradient>

          {/* Blush Gradient */}
          <radialGradient id="blushGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FF7A8A" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FF7A8A" stopOpacity="0" />
          </radialGradient>

          {/* Hoodie Lavender Gradient */}
          <linearGradient id="hoodieGrad" x1="40" y1="70" x2="160" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B39DDB" />
            <stop offset="50%" stopColor="#9575CD" />
            <stop offset="100%" stopColor="#7E57C2" />
          </linearGradient>

          {/* Shadow Filter */}
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#312E81" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Back Hair Bun */}
        <ellipse cx="100" cy="24" rx="22" ry="18" fill="url(#hairGrad)" filter="url(#softShadow)" />
        <ellipse cx="100" cy="22" rx="16" ry="13" fill="#5A381E" opacity="0.6" />

        {/* Lavender Hoodie Shoulders & Sleeves */}
        <path
          d="M35 125 C40 85 70 80 100 80 C130 80 160 85 165 125 Z"
          fill="url(#hoodieGrad)"
          filter="url(#softShadow)"
        />

        {/* Hoodie Collar Fold */}
        <path
          d="M72 82 C85 96 115 96 128 82 C120 90 80 90 72 82 Z"
          fill="#673AB7"
          opacity="0.7"
        />

        {/* Face */}
        <ellipse cx="100" cy="62" rx="36" ry="32" fill="url(#skinGrad)" filter="url(#softShadow)" />

        {/* Left Ear */}
        <ellipse cx="64" cy="64" rx="6" ry="8" fill="#F5C6B0" />
        {/* Right Ear */}
        <ellipse cx="136" cy="64" rx="6" ry="8" fill="#F5C6B0" />

        {/* Cheeks / Blush */}
        <circle cx="78" cy="70" r="8" fill="url(#blushGrad)" />
        <circle cx="122" cy="70" r="8" fill="url(#blushGrad)" />

        {/* Front Hair Bangs */}
        <path
          d="M66 50 C75 32 95 30 100 42 C105 30 125 32 134 50 C128 40 115 36 100 48 C85 36 72 40 66 50 Z"
          fill="url(#hairGrad)"
        />
        <path
          d="M64 54 C60 68 62 78 65 84 C66 76 68 65 67 56 Z"
          fill="url(#hairGrad)"
        />
        <path
          d="M136 54 C140 68 138 78 135 84 C134 76 132 65 133 56 Z"
          fill="url(#hairGrad)"
        />

        {/* Left Eye: Big cute anime sparkle eye */}
        <ellipse cx="84" cy="58" rx="6.5" ry="7.5" fill="#1E1B4B" />
        <circle cx="82" cy="56" r="2.5" fill="#FFFFFF" />
        <circle cx="86" cy="62" r="1.2" fill="#FFFFFF" />

        {/* Right Eye: Playful wink curve */}
        <path
          d="M112 60 Q118 54 124 60"
          stroke="#1E1B4B"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Eyebrows */}
        <path
          d="M78 48 Q84 45 90 49"
          stroke="#36200F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M110 49 Q116 45 122 48"
          stroke="#36200F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cute Smile / Mouth */}
        <path
          d="M93 72 Q100 79 107 72"
          stroke="#1E1B4B"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="#E11D48"
        />

        {/* Left Hand Resting On Card Edge */}
        <g filter="url(#softShadow)">
          <ellipse cx="80" cy="116" rx="14" ry="10" fill="url(#skinGrad)" transform="rotate(-8 80 116)" />
          {/* Cute Knuckles */}
          <ellipse cx="73" cy="115" rx="3.5" ry="5" fill="#F0B8A0" />
          <ellipse cx="79" cy="113" rx="3.5" ry="5.5" fill="#F0B8A0" />
          <ellipse cx="85" cy="115" rx="3.5" ry="5" fill="#F0B8A0" />
        </g>

        {/* Right Arm Supporting Chin (Posed like Image 3!) */}
        <g filter="url(#softShadow)">
          <ellipse cx="120" cy="116" rx="14" ry="10" fill="url(#skinGrad)" transform="rotate(8 120 116)" />
          {/* Cute Knuckles */}
          <ellipse cx="115" cy="115" rx="3.5" ry="5" fill="#F0B8A0" />
          <ellipse cx="121" cy="113" rx="3.5" ry="5.5" fill="#F0B8A0" />
          <ellipse cx="127" cy="115" rx="3.5" ry="5" fill="#F0B8A0" />
        </g>

        {/* Lavender Hoodie Sleeve Cuffs */}
        <ellipse cx="64" cy="118" rx="12" ry="7" fill="url(#hoodieGrad)" transform="rotate(-15 64 118)" />
        <ellipse cx="136" cy="118" rx="12" ry="7" fill="url(#hoodieGrad)" transform="rotate(15 136 118)" />
      </svg>
    </div>
  );
};
