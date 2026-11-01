import React from 'react';
import { ShikshanLogo } from './ShikshanLogo';

export const ShikshanSplashLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FD] px-4 select-none">
      <div className="flex flex-col items-center space-y-4 animate-pulse">
        <ShikshanLogo size="xl" showText={true} showSubtitle={true} />
        <div className="flex items-center gap-2 pt-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#6D28D9] animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#C4B5FD] animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};
