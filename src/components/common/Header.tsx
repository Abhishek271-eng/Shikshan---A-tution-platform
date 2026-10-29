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
                className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#F3EEFB] active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
            ) : (
              <Link
                to="/"
                className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B4FCF] to-[#4136CA] text-white shadow-md flex items-center justify-center hover:opacity-95 transition-all"
                aria-label="Shikshan Home"
              >
                <GraduationCap className="w-6 h-6" />
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
                <Link to="/" className="text-left">
                  <span className="text-xl font-black text-[#4136CA] tracking-tight">Shikshan</span>
                  <span className="hidden sm:inline-block text-xs text-[#686487] ml-2 font-medium">
                    Learn with confidence
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
              className="w-10 h-10 rounded-2xl bg-white border border-[#DFD8F3] shadow-sm flex items-center justify-center text-[#1C1938] hover:text-[#4136CA] hover:bg-[#F3EEFB] active:scale-95 transition-all"
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
