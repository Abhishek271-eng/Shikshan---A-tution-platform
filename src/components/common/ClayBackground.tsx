import React from 'react';

interface ClayBackgroundProps {
  children: React.ReactNode;
  className?: string;
  showDecorations?: boolean;
}

export const ClayBackground: React.FC<ClayBackgroundProps> = ({
  children,
  className = '',
  showDecorations = true,
}) => {
  return (
    <div className={`min-h-screen bg-[#F7F5FC] text-[#1C1938] relative overflow-x-hidden selection:bg-[#EDE9FE] selection:text-[#6D28D9] ${className}`}>
      {showDecorations && (
        <>
          {/* Ambient Organic Clay Spheres in Background */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] opacity-60 blur-2xl pointer-events-none" />
          <div className="absolute top-1/4 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-[#FEF3C7] to-[#FED7AA] opacity-40 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 -left-20 w-64 h-64 rounded-full bg-gradient-to-br from-[#E0F2FE] to-[#BAE6FD] opacity-40 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 right-0 w-60 h-60 rounded-full bg-gradient-to-br from-[#FCE7F3] to-[#FBCFE8] opacity-50 blur-3xl pointer-events-none" />

          {/* Subtle 3D Clay Stars / Doodles */}
          <div className="absolute top-12 left-6 text-[#A78BFA] opacity-50 text-lg pointer-events-none select-none">✦</div>
          <div className="absolute top-24 right-8 text-[#F59E0B] opacity-60 text-xl pointer-events-none select-none">✨</div>
          <div className="absolute top-2/3 left-4 text-[#60A5FA] opacity-50 text-sm pointer-events-none select-none">★</div>
          <div className="absolute bottom-32 right-6 text-[#34D399] opacity-50 text-base pointer-events-none select-none">✦</div>
        </>
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
