import React from 'react';

// Premium 3D Clay Educational Illustrations in Pure SVG with Soft Depth & Gradients

/**
 * Compact 3D Clay Welcome Mascot (Open Book with glowing pages, pencil & friendly aura)
 * Ideal for Student Home welcome section.
 */
export const ClayWelcomeMascot: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 88,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Ambient Clay Glow */}
          <radialGradient id="clayWelcomeAura" cx="60" cy="65" r="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#EDE9FE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F5F3FF" stopOpacity="0" />
          </radialGradient>

          {/* Book Spine & Cover */}
          <linearGradient id="bookCoverGrad" x1="20" y1="35" x2="100" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>

          {/* Left Page Gradient (3D curved highlight) */}
          <linearGradient id="leftPageGrad" x1="25" y1="40" x2="58" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F3EFFC" />
            <stop offset="100%" stopColor="#DDD6FE" />
          </linearGradient>

          {/* Right Page Gradient */}
          <linearGradient id="rightPageGrad" x1="62" y1="40" x2="95" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F5F3FF" />
            <stop offset="100%" stopColor="#E9D5FF" />
          </linearGradient>

          {/* Golden Bookmark */}
          <linearGradient id="goldRibbonGrad" x1="60" y1="35" x2="60" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* 3D Clay Pencil */}
          <linearGradient id="pencilBodyGrad" x1="85" y1="20" x2="105" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
          <linearGradient id="pencilTipGrad" x1="75" y1="45" x2="85" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* Ambient Backing Circle */}
        <circle cx="60" cy="62" r="48" fill="url(#clayWelcomeAura)" />

        {/* Floating Sparkles */}
        <path
          d="M30 24L32 30L38 32L32 34L30 40L28 34L22 32L28 30Z"
          fill="#F59E0B"
          opacity="0.9"
        />
        <path
          d="M92 78L93.5 82L97.5 83.5L93.5 85L92 89L90.5 85L86.5 83.5L90.5 82Z"
          fill="#A78BFA"
          opacity="0.8"
        />
        <circle cx="28" cy="74" r="2.5" fill="#10B981" opacity="0.8" />
        <circle cx="96" cy="28" r="2.5" fill="#60A5FA" opacity="0.8" />

        {/* Book Base Cover (Curved 3D Book Silhouette) */}
        <path
          d="M18 52C26 50 48 48 58 54L60 92C50 86 28 88 18 90Z"
          fill="url(#bookCoverGrad)"
          filter="drop-shadow(0 4px 6px rgba(109, 40, 217, 0.25))"
        />
        <path
          d="M102 52C94 50 72 48 62 54L60 92C70 86 92 88 102 90Z"
          fill="url(#bookCoverGrad)"
          filter="drop-shadow(0 4px 6px rgba(109, 40, 217, 0.25))"
        />

        {/* Left Open Page with clay depth */}
        <path
          d="M22 50C32 46 50 46 59 52L59 87C49 82 31 82 22 86Z"
          fill="url(#leftPageGrad)"
        />
        {/* Subtle page lines left */}
        <line x1="30" y1="58" x2="50" y2="57" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="65" x2="48" y2="64" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="72" x2="44" y2="71" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />

        {/* Right Open Page with clay depth */}
        <path
          d="M98 50C88 46 70 46 61 52L61 87C71 82 89 82 98 86Z"
          fill="url(#rightPageGrad)"
        />
        {/* Subtle page lines right */}
        <line x1="70" y1="57" x2="90" y2="58" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
        <line x1="72" y1="64" x2="90" y2="65" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
        <line x1="76" y1="71" x2="90" y2="72" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />

        {/* Golden Ribbon Bookmark */}
        <path
          d="M58 50C58 48 62 48 62 50L62 76L60 73L58 76Z"
          fill="url(#goldRibbonGrad)"
        />

        {/* 3D Clay Floating Pencil */}
        <g transform="rotate(15 90 32)">
          {/* Pencil Body */}
          <rect x="80" y="22" width="10" height="26" rx="5" fill="url(#pencilBodyGrad)" />
          {/* Pencil Tip */}
          <path d="M80 48L85 58L90 48Z" fill="url(#pencilTipGrad)" />
          <path d="M83.5 54.5L85 58L86.5 54.5Z" fill="#1E1B4B" />
          {/* Eraser Band */}
          <rect x="80" y="20" width="10" height="4" rx="2" fill="#E2E8F0" />
        </g>
      </svg>
    </div>
  );
};

/**
 * 3D Clay Empty State Illustration (Searching/Learning Partner On The Way)
 */
export const ClayEmptyStateIllustration: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 140,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        <defs>
          <radialGradient id="emptyAura" cx="80" cy="85" r="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#F5F3FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="searchRimGrad" x1="45" y1="45" x2="95" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>
          <linearGradient id="searchLensGrad" x1="50" y1="50" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="bookStack1" x1="40" y1="95" x2="120" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="bookStack2" x1="45" y1="80" x2="115" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="80" cy="85" r="65" fill="url(#emptyAura)" />

        {/* Bottom Stack Book 1 */}
        <rect x="42" y="112" width="76" height="15" rx="6" fill="url(#bookStack1)" />
        <rect x="46" y="115" width="68" height="4" rx="2" fill="#BAE6FD" opacity="0.6" />

        {/* Middle Stack Book 2 */}
        <rect x="48" y="96" width="64" height="14" rx="6" fill="url(#bookStack2)" />
        <rect x="52" y="99" width="56" height="4" rx="2" fill="#A7F3D0" opacity="0.6" />

        {/* 3D Clay Magnifying Glass with Shining Lens */}
        <g transform="translate(10, -5)">
          {/* Glass Handle */}
          <rect
            x="96"
            y="96"
            width="14"
            height="34"
            rx="7"
            transform="rotate(-45 96 96)"
            fill="#7C3AED"
            filter="drop-shadow(0 4px 6px rgba(109, 40, 217, 0.3))"
          />
          {/* Glass Outer Rim */}
          <circle
            cx="72"
            cy="70"
            r="32"
            fill="url(#searchRimGrad)"
            filter="drop-shadow(0 6px 12px rgba(124, 58, 237, 0.35))"
          />
          {/* Inner Rim Cutout */}
          <circle cx="72" cy="70" r="23" fill="url(#searchLensGrad)" />
          {/* Lens Glass Glare */}
          <ellipse cx="64" cy="62" rx="9" ry="5" transform="rotate(-30 64 62)" fill="#FFFFFF" opacity="0.75" />
          <circle cx="82" cy="76" r="3" fill="#FFFFFF" opacity="0.5" />
        </g>

        {/* Floating Playful Wisdom Sparks */}
        <path d="M30 46L32 52L38 54L32 56L30 62L28 56L22 54L28 52Z" fill="#F59E0B" />
        <path d="M128 42L129.5 46L133.5 47.5L129.5 49L128 53L126.5 49L122.5 47.5L126.5 46Z" fill="#8B5CF6" />
        <circle cx="132" cy="78" r="3" fill="#EC4899" />
        <circle cx="28" cy="95" r="3.5" fill="#10B981" />
      </svg>
    </div>
  );
};

/**
 * 3D Clay Subject Icon Component
 */
export const ClaySubjectIcon: React.FC<{
  subject: string;
  size?: number;
  className?: string;
}> = ({ subject, size = 42, className = '' }) => {
  const norm = (subject || '').toLowerCase();

  let bgGrad = 'from-[#EDE9FE] to-[#DDD6FE]';
  let textColor = 'text-[#6D28D9]';
  let emoji = '📚';

  if (norm.includes('math')) {
    bgGrad = 'from-[#DBEAFE] to-[#BFDBFE]';
    textColor = 'text-[#1D4ED8]';
    emoji = '📐';
  } else if (norm.includes('sci')) {
    bgGrad = 'from-[#D1FAE5] to-[#A7F3D0]';
    textColor = 'text-[#047857]';
    emoji = '🔬';
  } else if (norm.includes('kannada')) {
    bgGrad = 'from-[#FEF3C7] to-[#FDE68A]';
    textColor = 'text-[#B45309]';
    emoji = 'ಕ';
  } else if (norm.includes('eng')) {
    bgGrad = 'from-[#FCE7F3] to-[#FBCFE8]';
    textColor = 'text-[#BE185D]';
    emoji = '✍️';
  } else if (norm.includes('soc')) {
    bgGrad = 'from-[#FFEDD5] to-[#FED7AA]';
    textColor = 'text-[#C2410C]';
    emoji = '🌍';
  } else if (norm.includes('hin')) {
    bgGrad = 'from-[#E0E7FF] to-[#C7D2FE]';
    textColor = 'text-[#4338CA]';
    emoji = 'अ';
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgGrad} border border-white/80 shadow-clay-sm flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <span className={`text-base font-black ${textColor}`}>{emoji}</span>
    </div>
  );
};

// ============================================================================
// COMPLETE 3D CLAY EDUCATIONAL ILLUSTRATION SYSTEM (PHASE 3)
// ============================================================================

/**
 * 1. Friendly School Student Mascot (Books + Backpack)
 */
export const ClayStudentMascot: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Friendly School Student"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <defs>
          <radialGradient id="headSkin" cx="80" cy="52" r="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="70%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#FB923C" />
          </radialGradient>
          <linearGradient id="hairGrad" x1="50" y1="20" x2="110" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A3428" />
            <stop offset="100%" stopColor="#1E140F" />
          </linearGradient>
          <linearGradient id="hoodieGrad" x1="55" y1="80" x2="105" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="60%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
          <linearGradient id="backpackGrad" x1="100" y1="75" x2="135" y2="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="bookCover" x1="50" y1="100" x2="90" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="80" cy="148" rx="55" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Backpack Peeking Behind */}
        <rect x="102" y="76" width="30" height="42" rx="14" fill="url(#backpackGrad)" filter="drop-shadow(0 4px 6px rgba(5,150,105,0.25))" />
        <ellipse cx="117" cy="84" rx="8" ry="4" fill="#6EE7B7" opacity="0.6" />

        {/* Torso - Soft Lavender Clay Hoodie */}
        <path d="M52 90 C52 78 62 76 80 76 C98 76 108 78 108 90 L112 135 C112 142 106 144 80 144 C54 144 48 142 48 135 Z" fill="url(#hoodieGrad)" />
        {/* Hoodie highlight curve */}
        <path d="M60 84 C70 80 90 80 100 84" stroke="#DDD6FE" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

        {/* Left Arm Holding Book */}
        <path d="M48 94 C42 105 45 118 58 122 L66 122" stroke="url(#hoodieGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />

        {/* Open/Held Book in Front */}
        <rect x="62" y="104" width="36" height="28" rx="5" fill="url(#bookCover)" />
        <rect x="66" y="107" width="28" height="22" rx="3" fill="#FFFFFF" />
        <line x1="70" y1="113" x2="90" y2="113" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="119" x2="86" y2="119" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="70" y1="124" x2="82" y2="124" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

        {/* Hands on Book */}
        <circle cx="62" cy="118" r="6" fill="#FDBA74" />
        <circle cx="98" cy="118" r="6" fill="#FDBA74" />

        {/* Head Neck */}
        <rect x="74" y="70" width="12" height="12" rx="6" fill="#FDBA74" />

        {/* Head Sphere */}
        <circle cx="80" cy="50" r="26" fill="url(#headSkin)" />
        {/* Clay Specular Glow on Head */}
        <ellipse cx="72" cy="38" rx="8" ry="5" fill="#FFFFFF" opacity="0.35" />

        {/* Cute Big Eyes */}
        <circle cx="71" cy="49" r="3.5" fill="#1E1B4B" />
        <circle cx="72.5" cy="47.5" r="1.2" fill="#FFFFFF" />
        <circle cx="89" cy="49" r="3.5" fill="#1E1B4B" />
        <circle cx="90.5" cy="47.5" r="1.2" fill="#FFFFFF" />

        {/* Rosy Clay Cheeks */}
        <circle cx="66" cy="56" r="3.5" fill="#F472B6" opacity="0.45" />
        <circle cx="94" cy="56" r="3.5" fill="#F472B6" opacity="0.45" />

        {/* Cheerful Smile */}
        <path d="M76 56 Q80 61 84 56" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Clay Tousled Hair */}
        <path d="M54 48 C52 30 65 22 80 22 C95 22 108 30 106 48 C102 34 94 30 80 30 C66 30 58 34 54 48 Z" fill="url(#hairGrad)" />
        <path d="M72 22 C70 16 78 18 80 22" fill="url(#hairGrad)" />
        <path d="M84 22 C86 16 94 19 92 24" fill="url(#hairGrad)" />

        {/* Sparkles */}
        <path d="M36 32L38 36L42 38L38 40L36 44L34 40L30 38L34 36Z" fill="#FBBF24" />
        <path d="M128 36L129.5 39L132.5 40.5L129.5 42L128 45L126.5 42L123.5 40.5L126.5 39Z" fill="#A78BFA" />
      </svg>
    </div>
  );
};

/**
 * 2. Student Reading a Book
 */
export const ClayStudentReading: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Student Reading a Book"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Ground Cushion */}
        <ellipse cx="80" cy="142" rx="58" ry="12" fill="#E9D5FF" />
        <ellipse cx="80" cy="138" rx="50" ry="9" fill="#F5F3FF" />

        {/* Legs Cross-Legged */}
        <path d="M44 134 C50 120 70 124 80 128 C90 124 110 120 116 134 Z" fill="#6366F1" />

        {/* Torso & Hoodie */}
        <ellipse cx="80" cy="106" rx="24" ry="22" fill="#8B5CF6" />
        <ellipse cx="74" cy="98" rx="8" ry="4" fill="#DDD6FE" opacity="0.4" />

        {/* Head Tilted Forward */}
        <circle cx="80" cy="64" r="22" fill="#FDBA74" />
        {/* Hair */}
        <path d="M58 60 C58 42 70 38 80 38 C90 38 102 42 102 60 C98 48 90 46 80 46 C70 46 62 48 58 60 Z" fill="#3B2E24" />
        {/* Focused Closed/Downcast Eyes */}
        <path d="M72 66 Q75 69 78 66" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M82 66 Q85 69 88 66" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M78 74 Q80 76 82 74" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Big Open Book in Hands */}
        <path d="M42 98 C56 94 76 96 80 102 C84 96 104 94 118 98 L116 122 C102 118 84 120 80 126 C76 120 58 118 44 122 Z" fill="#38BDF8" filter="drop-shadow(0 4px 6px rgba(14,165,233,0.3))" />
        <path d="M46 99 C58 96 74 98 78 103 L78 123 C74 119 58 117 48 120 Z" fill="#FFFFFF" />
        <path d="M114 99 C102 96 86 98 82 103 L82 123 C86 119 102 117 112 120 Z" fill="#F8FAFC" />

        {/* Text lines */}
        <line x1="52" y1="105" x2="72" y2="105" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="110" x2="70" y2="110" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="88" y1="105" x2="108" y2="105" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="88" y1="110" x2="104" y2="110" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Glowing floating knowledge sparks */}
        <circle cx="80" cy="84" r="3" fill="#FBBF24" opacity="0.9" />
        <path d="M78 30L80 34L84 36L80 38L78 42L76 38L72 36L76 34Z" fill="#F59E0B" />
      </svg>
    </div>
  );
};

/**
 * 3. Student Studying at a Desk
 */
export const ClayStudentAtDesk: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Student at Study Desk"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Floor Shadow */}
        <ellipse cx="80" cy="148" rx="64" ry="7" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Cute Desk Legs */}
        <rect x="28" y="112" width="8" height="34" rx="4" fill="#C4B5FD" />
        <rect x="124" y="112" width="8" height="34" rx="4" fill="#C4B5FD" />

        {/* Study Desk Surface */}
        <rect x="20" y="102" width="120" height="14" rx="7" fill="#F5EFE6" filter="drop-shadow(0 4px 6px rgba(100,80,120,0.15))" />
        <rect x="22" y="103" width="116" height="5" rx="2.5" fill="#FFFFFF" opacity="0.7" />

        {/* Student Behind Desk */}
        <ellipse cx="80" cy="94" rx="22" ry="18" fill="#10B981" />
        <circle cx="80" cy="62" r="20" fill="#FED7AA" />
        <path d="M62 58 C62 42 72 38 80 38 C88 38 98 42 98 58 C94 48 88 46 80 46 C72 46 66 48 62 58 Z" fill="#292524" />
        <circle cx="74" cy="62" r="2.5" fill="#1E1B4B" />
        <circle cx="86" cy="62" r="2.5" fill="#1E1B4B" />
        <path d="M78 68 Q80 71 82 68" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Study Lamp on Desk (Left) */}
        <rect x="34" y="96" width="14" height="6" rx="3" fill="#F59E0B" />
        <path d="M41 96 L41 74 L52 74" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 68 L58 74 L48 80 Z" fill="#FBBF24" />
        <polygon points="58,74 74,68 74,80" fill="#FEF08A" opacity="0.45" />

        {/* Open Notebook on Desk */}
        <rect x="66" y="96" width="28" height="12" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="80" y1="96" x2="80" y2="108" stroke="#94A3B8" strokeWidth="1" />

        {/* Pencil Cup (Right) */}
        <rect x="108" y="88" width="12" height="14" rx="3" fill="#EC4899" />
        <line x1="112" y1="84" x2="112" y2="88" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
        <line x1="116" y1="82" x2="116" y2="88" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * 4. Student Using a Laptop
 */
export const ClayStudentLaptop: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Student Learning Online with Laptop"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <ellipse cx="80" cy="144" rx="55" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Student Torso */}
        <path d="M56 100 C56 86 68 82 80 82 C92 82 104 86 104 100 L108 135 C94 138 66 138 52 135 Z" fill="#6366F1" />
        {/* Head */}
        <circle cx="80" cy="58" r="22" fill="#FED7AA" />
        <path d="M60 54 C60 38 70 34 80 34 C90 34 100 38 100 54 C96 44 88 42 80 42 C72 42 64 44 60 54 Z" fill="#1C1917" />
        {/* Cute Glasses */}
        <circle cx="73" cy="58" r="6" stroke="#4338CA" strokeWidth="2" fill="none" />
        <circle cx="87" cy="58" r="6" stroke="#4338CA" strokeWidth="2" fill="none" />
        <line x1="79" y1="58" x2="81" y2="58" stroke="#4338CA" strokeWidth="2" />
        <circle cx="73" cy="58" r="2" fill="#1E1B4B" />
        <circle cx="87" cy="58" r="2" fill="#1E1B4B" />
        <path d="M78 67 Q80 70 82 67" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* 3D Pastel Clay Laptop */}
        {/* Base */}
        <rect x="52" y="120" width="56" height="12" rx="4" fill="#E2E8F0" filter="drop-shadow(0 4px 6px rgba(30,41,59,0.2))" />
        <rect x="74" y="122" width="12" height="3" rx="1.5" fill="#94A3B8" />
        {/* Screen Tilted */}
        <rect x="56" y="90" width="48" height="32" rx="4" fill="#334155" />
        <rect x="59" y="93" width="42" height="26" rx="2" fill="#38BDF8" opacity="0.9" />
        {/* Screen Code/Diagram Lines */}
        <line x1="64" y1="99" x2="84" y2="99" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="64" y1="105" x2="92" y2="105" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="64" y1="111" x2="78" y2="111" stroke="#FEF08A" strokeWidth="1.8" strokeLinecap="round" />

        {/* Screen Glow */}
        <polygon points="56,90 40,118 120,118 104,90" fill="#38BDF8" opacity="0.1" />

        {/* Sparkles */}
        <path d="M34 48L36 52L40 54L36 56L34 60L32 56L28 54L32 52Z" fill="#F59E0B" />
        <circle cx="128" cy="62" r="3" fill="#10B981" />
      </svg>
    </div>
  );
};

/**
 * 5. Tutor Teaching a Student
 */
export const ClayTutorTeaching: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Tutor Teaching Student"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <ellipse cx="80" cy="148" rx="66" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Whiteboard / Chalkboard on Stand */}
        <rect x="50" y="32" width="60" height="46" rx="6" fill="#1E293B" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))" />
        <rect x="53" y="35" width="54" height="40" rx="4" fill="#0F766E" />
        {/* Math & Science symbols */}
        <text x="60" y="52" fill="#FDE047" fontSize="11" fontWeight="bold">E = mc²</text>
        <text x="60" y="66" fill="#A7F3D0" fontSize="9">√64 = 8</text>
        <line x1="80" y1="78" x2="80" y2="140" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

        {/* Tutor Figure (Left, Standing) */}
        <circle cx="34" cy="56" r="14" fill="#FED7AA" />
        <path d="M22 52 C22 42 30 38 36 38 C42 38 48 42 46 54 Z" fill="#78350F" />
        <circle cx="31" cy="56" r="1.8" fill="#1E1B4B" />
        <circle cx="39" cy="56" r="1.8" fill="#1E1B4B" />
        <path d="M33 63 Q35 65 37 63" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Tutor Coat */}
        <path d="M20 74 C20 70 26 68 34 68 C42 68 48 70 48 74 L50 126 L18 126 Z" fill="#7C3AED" />
        {/* Pointer Stick in Tutor's hand */}
        <line x1="42" y1="84" x2="58" y2="60" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Student Figure (Right, Seated) */}
        <circle cx="126" cy="80" r="13" fill="#FDBA74" />
        <path d="M116 76 C116 68 122 64 128 64 C134 64 138 68 136 78 Z" fill="#1C1917" />
        <circle cx="123" cy="80" r="1.8" fill="#1E1B4B" />
        <circle cx="131" cy="80" r="1.8" fill="#1E1B4B" />
        <path d="M125 86 Q127 88 129 86" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        {/* Student Shirt */}
        <path d="M114 96 C114 90 120 88 126 88 C132 88 138 90 138 96 L140 136 L112 136 Z" fill="#3B82F6" />
      </svg>
    </div>
  );
};

/**
 * 6. Student Writing in a Notebook
 */
export const ClayStudentWriting: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Student Writing Notes"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <ellipse cx="80" cy="144" rx="55" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Big Spiral Notebook */}
        <rect x="36" y="44" width="88" height="92" rx="10" fill="#EDE9FE" filter="drop-shadow(0 8px 16px rgba(124,58,237,0.2))" />
        <rect x="44" y="48" width="76" height="84" rx="6" fill="#FFFFFF" />
        {/* Spiral Rings (Left) */}
        {[56, 68, 80, 92, 104, 116].map((y) => (
          <ellipse key={y} cx="44" cy={y} rx="5" ry="3" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
        ))}
        {/* Lined Pages */}
        {[62, 74, 86, 98, 110, 122].map((y) => (
          <line key={y} x1="56" y1={y} x2="112" y2={y} stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />
        ))}

        {/* Chunky Clay Pencil Writing */}
        <g transform="rotate(28 95 65)">
          {/* Eraser */}
          <rect x="85" y="16" width="14" height="12" rx="3" fill="#F472B6" />
          <rect x="85" y="26" width="14" height="6" fill="#CBD5E1" />
          {/* Body */}
          <rect x="85" y="32" width="14" height="50" rx="3" fill="#FBBF24" />
          {/* Wood Tip */}
          <polygon points="85,82 99,82 92,98" fill="#FDE68A" />
          {/* Lead Tip */}
          <polygon points="89,92 95,92 92,98" fill="#1E293B" />
        </g>

        {/* Clay Hand Holding Pencil */}
        <circle cx="106" cy="74" r="11" fill="#FED7AA" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))" />
        <ellipse cx="102" cy="70" rx="6" ry="4" fill="#FDBA74" />

        {/* Sparks */}
        <path d="M120 40L122 44L126 46L122 48L120 52L118 48L114 46L118 44Z" fill="#F59E0B" />
      </svg>
    </div>
  );
};

/**
 * 7. Stack of Colourful Books
 */
export const ClayBookStack: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Stack of Colorful Books"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Shadow */}
        <ellipse cx="80" cy="144" rx="62" ry="9" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Bottom Book (Deep Violet / Lavender) */}
        <rect x="24" y="112" width="112" height="24" rx="7" fill="#7C3AED" filter="drop-shadow(0 6px 10px rgba(109,40,217,0.3))" />
        <rect x="36" y="116" width="96" height="16" rx="4" fill="#FFFFFF" />
        <line x1="42" y1="124" x2="126" y2="124" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <rect x="24" y="112" width="14" height="24" rx="5" fill="#6D28D9" />

        {/* Middle Book (Pastel Mint Green) */}
        <rect x="30" y="86" width="102" height="22" rx="7" fill="#10B981" filter="drop-shadow(0 6px 10px rgba(16,185,129,0.3))" />
        <rect x="42" y="90" width="86" height="14" rx="4" fill="#FFFFFF" />
        <line x1="48" y1="97" x2="122" y2="97" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <rect x="30" y="86" width="14" height="22" rx="5" fill="#059669" />

        {/* Top Book (Pastel Peach / Coral) */}
        <rect x="38" y="60" width="88" height="22" rx="7" fill="#FB923C" filter="drop-shadow(0 6px 10px rgba(251,146,60,0.3))" />
        <rect x="48" y="64" width="74" height="14" rx="4" fill="#FFFFFF" />
        <line x1="54" y1="71" x2="116" y2="71" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        <rect x="38" y="60" width="14" height="22" rx="5" fill="#EA580C" />

        {/* Golden Bookmark Ribbon draped over */}
        <path d="M96 56 L96 90 L102 85 L108 90 L108 56 Z" fill="#FBBF24" />

        {/* Sparkles */}
        <path d="M44 38L46 42L50 44L46 46L44 50L42 46L38 44L42 42Z" fill="#F59E0B" />
        <circle cx="124" cy="46" r="3" fill="#8B5CF6" />
      </svg>
    </div>
  );
};

/**
 * 8. Graduation Cap with Tassel & Diploma
 */
export const ClayGraduationCap: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Graduation Cap"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Shadow */}
        <ellipse cx="80" cy="142" rx="55" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Skull Cap Base */}
        <ellipse cx="80" cy="94" rx="34" ry="16" fill="#312E81" />
        <path d="M46 94 C46 112 114 112 114 94 Z" fill="#1E1B4B" />

        {/* Diamond Mortarboard Top with thick 3D bevel */}
        <polygon points="80,42 144,68 80,94 16,68" fill="#4338CA" filter="drop-shadow(0 8px 16px rgba(49,46,129,0.35))" />
        <polygon points="80,44 140,68 80,92 20,68" fill="#4F46E5" />

        {/* Center Golden Button */}
        <circle cx="80" cy="68" r="5" fill="#FBBF24" />

        {/* Golden Tassel Draping Down */}
        <path d="M80 68 Q108 72 112 96 L112 116" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="108" y="114" width="8" height="12" rx="3" fill="#D97706" />

        {/* Rolled Diploma Scroll (Bottom) */}
        <g transform="rotate(-8 80 128)">
          <rect x="48" y="122" width="64" height="16" rx="8" fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
          <rect x="74" y="120" width="12" height="20" rx="3" fill="#EF4444" />
        </g>

        {/* Sparkles */}
        <path d="M32 40L34 44L38 46L34 48L32 52L30 48L26 46L30 44Z" fill="#F59E0B" />
        <circle cx="132" cy="46" r="3" fill="#60A5FA" />
      </svg>
    </div>
  );
};

/**
 * 9. Pencils, Notebooks, Rulers and Stationery
 */
export const ClayStationery: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Educational Stationery"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <ellipse cx="80" cy="144" rx="58" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Notebook in Background */}
        <rect x="32" y="50" width="68" height="84" rx="8" fill="#8B5CF6" filter="drop-shadow(0 6px 12px rgba(139,92,246,0.25))" />
        <rect x="40" y="56" width="54" height="72" rx="4" fill="#FFFFFF" />

        {/* Wooden Ruler Standing Diagonally */}
        <g transform="rotate(32 100 80)">
          <rect x="94" y="24" width="18" height="96" rx="4" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
          {[36, 46, 56, 66, 76, 86, 96, 106].map((y) => (
            <line key={y} x1="94" y1={y} x2="102" y2={y} stroke="#B45309" strokeWidth="1.5" />
          ))}
        </g>

        {/* Chunky Clay Yellow Pencil */}
        <g transform="rotate(-24 70 85)">
          <rect x="64" y="22" width="14" height="76" rx="4" fill="#FBBF24" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.15))" />
          <rect x="64" y="16" width="14" height="8" rx="2" fill="#F472B6" />
          <polygon points="64,98 78,98 71,114" fill="#FDE68A" />
          <polygon points="68,108 74,108 71,114" fill="#1E293B" />
        </g>

        {/* Pink Clay Eraser (Bottom Right) */}
        <rect x="94" y="124" width="34" height="16" rx="6" fill="#F472B6" filter="drop-shadow(0 3px 5px rgba(244,114,182,0.3))" />
        <rect x="94" y="124" width="14" height="16" rx="4" fill="#60A5FA" />
      </svg>
    </div>
  );
};

/**
 * 10. School Backpack with Pockets
 */
export const ClayBackpack: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="School Backpack"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <ellipse cx="80" cy="144" rx="52" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Handle Loop */}
        <path d="M68 44 C68 28 92 28 92 44" stroke="#6D28D9" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Main Backpack Body */}
        <rect x="42" y="44" width="76" height="92" rx="28" fill="#7C3AED" filter="drop-shadow(0 10px 20px rgba(124,58,237,0.3))" />
        {/* Soft Highlight on top of backpack */}
        <path d="M56 54 C66 48 94 48 104 54" stroke="#DDD6FE" strokeWidth="4" strokeLinecap="round" opacity="0.6" />

        {/* Front Zipper Pocket */}
        <rect x="52" y="84" width="56" height="42" rx="14" fill="#A78BFA" />
        {/* Zipper Line */}
        <line x1="60" y1="92" x2="100" y2="92" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="80" cy="92" r="3" fill="#FBBF24" />

        {/* Side Bottle Pocket (Left) */}
        <rect x="34" y="80" width="12" height="28" rx="6" fill="#6D28D9" />
        <rect x="36" y="72" width="8" height="12" rx="3" fill="#38BDF8" />

        {/* Side Pocket (Right) */}
        <rect x="114" y="80" width="12" height="28" rx="6" fill="#6D28D9" />

        {/* Sparkles */}
        <path d="M26 36L28 40L32 42L28 44L26 48L24 44L20 42L24 40Z" fill="#F59E0B" />
        <circle cx="134" cy="38" r="3" fill="#10B981" />
      </svg>
    </div>
  );
};

/**
 * 11. Lightbulb Representing Learning & Ideas
 */
export const ClayIdeaBulb: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Idea & Learning Lightbulb"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Ambient Glow */}
        <circle cx="80" cy="68" r="54" fill="#FEF08A" opacity="0.45" />

        {/* Bulb Glass Sphere with Inset Neck */}
        <path
          d="M80 24 C55 24 40 44 40 66 C40 82 52 94 60 104 L60 112 L100 112 L100 104 C108 94 120 82 120 66 C120 44 105 24 80 24 Z"
          fill="#FDE047"
          filter="drop-shadow(0 10px 20px rgba(234,179,8,0.4))"
        />

        {/* Specular Highlight along Curve */}
        <path d="M52 46 C56 36 68 32 80 32" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

        {/* Cute Smiling Face on Bulb */}
        <circle cx="70" cy="66" r="3.5" fill="#713F12" />
        <circle cx="71.5" cy="64.5" r="1.2" fill="#FFFFFF" />
        <circle cx="90" cy="66" r="3.5" fill="#713F12" />
        <circle cx="91.5" cy="64.5" r="1.2" fill="#FFFFFF" />
        <path d="M76 74 Q80 79 84 74" stroke="#713F12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Rosy Cheeks */}
        <circle cx="65" cy="72" r="3" fill="#FB923C" opacity="0.5" />
        <circle cx="95" cy="72" r="3" fill="#FB923C" opacity="0.5" />

        {/* Bulb Base (Screw Threads) */}
        <rect x="62" y="112" width="36" height="8" rx="4" fill="#CBD5E1" />
        <rect x="64" y="120" width="32" height="8" rx="4" fill="#94A3B8" />
        <rect x="68" y="128" width="24" height="6" rx="3" fill="#64748B" />

        {/* Radiant Idea Beams */}
        <line x1="80" y1="12" x2="80" y2="4" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="126" y1="36" x2="134" y2="30" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="34" y1="36" x2="26" y2="30" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="138" y1="68" x2="148" y2="68" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="22" y1="68" x2="12" y2="68" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/**
 * 12. Educational Achievement Trophy
 */
export const ClayAchievementTrophy: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Achievement Trophy"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        <ellipse cx="80" cy="144" rx="52" ry="8" fill="#DFD8F3" fillOpacity="0.8" />

        {/* Base Pedestal */}
        <rect x="52" y="124" width="56" height="18" rx="6" fill="#7C3AED" filter="drop-shadow(0 6px 12px rgba(124,58,237,0.3))" />
        <rect x="58" y="126" width="44" height="6" rx="2" fill="#A78BFA" opacity="0.6" />

        {/* Stem */}
        <rect x="74" y="104" width="12" height="22" rx="4" fill="#F59E0B" />

        {/* Trophy Handles */}
        <path d="M48 54 C34 54 34 84 52 84" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M112 54 C126 54 126 84 108 84" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Trophy Cup Body */}
        <path d="M46 38 C46 76 60 106 80 106 C100 106 114 76 114 38 Z" fill="#FBBF24" filter="drop-shadow(0 8px 16px rgba(245,158,11,0.35))" />
        {/* Cup Rim */}
        <ellipse cx="80" cy="38" rx="34" ry="8" fill="#FDE68A" />

        {/* Star on Trophy */}
        <path d="M80 58 L82.5 64 L89 65 L84 69.5 L85.5 76 L80 72.5 L74.5 76 L76 69.5 L71 65 L77.5 64 Z" fill="#FFFFFF" />

        {/* Sparkles */}
        <path d="M30 30L32 34L36 36L32 38L30 42L28 38L24 36L28 34Z" fill="#F59E0B" />
        <circle cx="130" cy="32" r="3" fill="#10B981" />
      </svg>
    </div>
  );
};

/**
 * 13. Friendly Learning Environment / Study Scene
 */
export const ClayLearningScene: React.FC<{ size?: number; className?: string }> = ({
  size = 140,
  className = '',
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Friendly Learning Environment"
    >
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
        {/* Room Ambient */}
        <circle cx="80" cy="80" r="70" fill="#F3EEFB" />

        {/* Window with Warm Sunlight (Left) */}
        <rect x="22" y="34" width="34" height="46" rx="17" fill="#60A5FA" />
        <rect x="25" y="37" width="28" height="40" rx="14" fill="#93C5FD" />
        <line x1="39" y1="37" x2="39" y2="77" stroke="#FFFFFF" strokeWidth="2" />
        <line x1="25" y1="57" x2="53" y2="57" stroke="#FFFFFF" strokeWidth="2" />
        {/* Sun in window */}
        <circle cx="34" cy="48" r="6" fill="#FDE047" />

        {/* Bookshelf (Right) */}
        <rect x="108" y="38" width="36" height="84" rx="6" fill="#C4B5FD" />
        <rect x="112" y="44" width="28" height="22" rx="3" fill="#EDE9FE" />
        <rect x="112" y="70" width="28" height="22" rx="3" fill="#EDE9FE" />
        <rect x="112" y="96" width="28" height="22" rx="3" fill="#EDE9FE" />
        {/* Books on shelf */}
        <rect x="114" y="48" width="6" height="16" rx="2" fill="#F472B6" />
        <rect x="122" y="46" width="6" height="18" rx="2" fill="#10B981" />
        <rect x="130" y="50" width="6" height="14" rx="2" fill="#FBBF24" />

        {/* Study Desk in Center */}
        <rect x="42" y="104" width="76" height="12" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="52" y="116" width="6" height="28" rx="3" fill="#94A3B8" />
        <rect x="102" y="116" width="6" height="28" rx="3" fill="#94A3B8" />

        {/* Laptop & Potted Plant on Desk */}
        <rect x="62" y="96" width="22" height="10" rx="2" fill="#38BDF8" />
        <rect x="92" y="92" width="10" height="12" rx="3" fill="#FED7AA" />
        <circle cx="97" cy="88" r="5" fill="#34D399" />

        {/* Floor Shadow */}
        <ellipse cx="80" cy="146" rx="55" ry="6" fill="#DFD8F3" fillOpacity="0.8" />
      </svg>
    </div>
  );
};

// ============================================================================
// MASTER CLAY ILLUSTRATION COMPONENT
// ============================================================================
export type ClayIllustrationName =
  | 'student-mascot'
  | 'student-reading'
  | 'student-desk'
  | 'student-laptop'
  | 'tutor-teaching'
  | 'student-writing'
  | 'book-stack'
  | 'graduation-cap'
  | 'stationery'
  | 'backpack'
  | 'idea-bulb'
  | 'achievement-trophy'
  | 'learning-scene'
  | 'empty-state';

export const ClayIllustration: React.FC<{
  name: ClayIllustrationName;
  size?: number;
  className?: string;
}> = ({ name, size = 120, className = '' }) => {
  switch (name) {
    case 'student-mascot':
      return <ClayStudentMascot size={size} className={className} />;
    case 'student-reading':
      return <ClayStudentReading size={size} className={className} />;
    case 'student-desk':
      return <ClayStudentAtDesk size={size} className={className} />;
    case 'student-laptop':
      return <ClayStudentLaptop size={size} className={className} />;
    case 'tutor-teaching':
      return <ClayTutorTeaching size={size} className={className} />;
    case 'student-writing':
      return <ClayStudentWriting size={size} className={className} />;
    case 'book-stack':
      return <ClayBookStack size={size} className={className} />;
    case 'graduation-cap':
      return <ClayGraduationCap size={size} className={className} />;
    case 'stationery':
      return <ClayStationery size={size} className={className} />;
    case 'backpack':
      return <ClayBackpack size={size} className={className} />;
    case 'idea-bulb':
      return <ClayIdeaBulb size={size} className={className} />;
    case 'achievement-trophy':
      return <ClayAchievementTrophy size={size} className={className} />;
    case 'learning-scene':
      return <ClayLearningScene size={size} className={className} />;
    case 'empty-state':
      return <ClayEmptyStateIllustration size={size} className={className} />;
    default:
      return <ClayStudentMascot size={size} className={className} />;
  }
};
