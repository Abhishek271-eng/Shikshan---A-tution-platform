import React from 'react';

interface ClayAvatarProps {
  name: string;
  imageUrl?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
  className?: string;
}

export const ClayAvatar: React.FC<ClayAvatarProps> = ({
  name,
  imageUrl,
  photoUrl,
  size = 'md',
  isVerified = false,
  className = '',
}) => {
  const displayUrl = photoUrl || imageUrl || undefined;
  const getInitials = (n: string) => {
    return (
      n
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TR'
    );
  };

  const sizeStyles = {
    sm: { container: 'w-9 h-9 text-xs', badge: 'w-3 h-3 right-0 bottom-0 ring-1' },
    md: { container: 'w-12 h-12 text-sm', badge: 'w-3.5 h-3.5 right-0 bottom-0 ring-2' },
    lg: { container: 'w-16 h-16 text-lg', badge: 'w-4 h-4 right-0.5 bottom-0.5 ring-2' },
    xl: { container: 'w-20 h-20 text-2xl', badge: 'w-5 h-5 right-1 bottom-1 ring-2' },
  }[size];

  // Hash name for consistent cheerful pastel colors
  const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorPalettes = [
    { bg: 'from-[#C4B5FD] to-[#8B5CF6]', text: 'text-white' },
    { bg: 'from-[#93C5FD] to-[#3B82F6]', text: 'text-white' },
    { bg: 'from-[#A7F3D0] to-[#10B981]', text: 'text-[#064E3B]' },
    { bg: 'from-[#FDE68A] to-[#F59E0B]', text: 'text-[#78350F]' },
    { bg: 'from-[#FBCFE8] to-[#EC4899]', text: 'text-[#831843]' },
  ];
  const palette = colorPalettes[hash % colorPalettes.length];

  return (
    <div className={`relative inline-block select-none flex-shrink-0 ${className}`}>
      <div
        className={`${sizeStyles.container} rounded-full overflow-hidden border-2 border-white shadow-clay-sm flex items-center justify-center font-black ${
          displayUrl ? 'bg-white' : `bg-gradient-to-br ${palette.bg} ${palette.text}`
        }`}
      >
        {displayUrl ? (
          <img src={displayUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {isVerified && (
        <span
          className={`absolute ${sizeStyles.badge} rounded-full bg-[#10B981] ring-white flex items-center justify-center text-white shadow-xs`}
          title="Verified Mentor"
        >
          <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 12 12">
            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </span>
      )}
    </div>
  );
};
