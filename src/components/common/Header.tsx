import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Menu } from 'lucide-react';
import { ShikshanLogo } from './ShikshanLogo';
import { NavigationDrawer } from './NavigationDrawer';
import { useNavigation } from '../../context/NavigationContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
  customRight?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack,
  onBack,
  subtitle,
  customRight,
}) => {
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { triggerBack, registerBackHandler } = useNavigation();

  // Root screen check: on root screens, don't show the back button by default
  const rootPaths = ['/', '/login', '/student/dashboard', '/tutor/dashboard', '/tutor/status', '/admin'];
  const isRootScreen = rootPaths.includes(location.pathname);

  // Auto-detect whether back arrow should be visible:
  // Visible on any screen deeper than root
  const shouldShowBack = showBack !== undefined ? showBack : !isRootScreen;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      triggerBack();
    }
  };

  // Register drawer back handler
  useEffect(() => {
    if (isDrawerOpen) {
      return registerBackHandler(() => {
        setIsDrawerOpen(false);
        return true;
      });
    }
  }, [isDrawerOpen, registerBackHandler]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full header-glass select-none transition-all duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Back Arrow or Brand Mark */}
          <div className="flex items-center gap-2.5">
            {shouldShowBack && (
              <button
                onClick={handleBack}
                aria-label="Go back to previous screen"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-purple-100 shadow-sm flex items-center justify-center text-slate-700 hover:text-[#7C3AED] hover:bg-purple-50 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
            )}

            {/* Title / Brand Text */}
            <div className="flex flex-col text-left flex-1 min-w-0 pr-1">
              {title ? (
                <>
                  <h1 className="text-base sm:text-lg font-black text-[#1C1938] leading-tight truncate max-w-[200px] sm:max-w-xs">
                    {title}
                  </h1>
                  {subtitle && (
                    <span className="text-[11px] text-[#686487] font-medium truncate">
                      {subtitle}
                    </span>
                  )}
                </>
              ) : (
                <Link to="/" className="text-left flex items-center">
                  <ShikshanLogo size="md" showText={true} showSubtitle={false} />
                </Link>
              )}
            </div>
          </div>

          {/* Right: Custom actions + Permanent Hamburger menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {customRight}

            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-center justify-center text-[#1C1938] hover:text-[#7C3AED] hover:bg-purple-50 active:scale-95 transition-all cursor-pointer flex-shrink-0 z-50"
            >
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </header>

      {/* Persistent Navigation Drawer */}
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
