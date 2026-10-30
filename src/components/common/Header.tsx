import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Menu, GraduationCap } from 'lucide-react';
import { NavigationDrawer } from './NavigationDrawer';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Auto-detect whether back arrow should be visible:
  // Visible on any screen deeper than the root landing page ('/')
  const shouldShowBack = showBack !== undefined ? showBack : location.pathname !== '/';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Sensible browser/device back navigation
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full header-glass select-none transition-all duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Back Arrow or Brand Mark */}
          <div className="flex items-center gap-2.5">
            {shouldShowBack ? (
              <button
                onClick={handleBack}
                aria-label="Go back to previous screen"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#DFD8F3] shadow-xs flex items-center justify-center text-[#1C1938] hover:text-[#3730A3] hover:bg-[#EEECFB] active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
            ) : (
              <Link
                to="/"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#3730A3] text-white shadow-xs flex items-center justify-center hover:opacity-95 transition-all flex-shrink-0"
                aria-label="Shikshan Home"
              >
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            )}

            {/* Title / Brand Text */}
            <div className="flex flex-col text-left">
              {title ? (
                <>
                  <h1 className="text-base sm:text-lg font-extrabold text-[#1C1938] leading-tight truncate max-w-[200px] sm:max-w-xs">
                    {title}
                  </h1>
                  {subtitle && (
                    <span className="text-[11px] text-[#686487] font-medium truncate">
                      {subtitle}
                    </span>
                  )}
                </>
              ) : (
                <Link to="/" className="text-left flex flex-col">
                  <h1 className="text-lg sm:text-xl font-black text-[#312E81] tracking-tight leading-none">
                    Shikshan
                  </h1>
                  <span className="text-[10px] text-[#575375] font-semibold tracking-tight mt-0.5">
                    Learn with confidence. Grow with guidance.
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Right: Custom actions + Hamburger menu */}
          <div className="flex items-center gap-2">
            {customRight}

            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open menu"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#DFD8F3] shadow-xs flex items-center justify-center text-[#1C1938] hover:text-[#3730A3] hover:bg-[#EEECFB] active:scale-95 transition-all"
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
