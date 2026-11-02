import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  Info,
  FileText,
  LogIn,
  LogOut,
  Code2,
} from 'lucide-react';
import { ShikshanLogo } from './ShikshanLogo';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { getDeveloperPhoto } from '../../lib/developerProfile';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { user, profile, signOut } = useAuth();
  const { registerBackHandler } = useNavigation();
  const navigate = useNavigate();
  const [isConfirmSignOutOpen, setIsConfirmSignOutOpen] = useState(false);

  // Close drawer on Android hardware back button
  useEffect(() => {
    if (isOpen) {
      return registerBackHandler(() => {
        if (isConfirmSignOutOpen) {
          setIsConfirmSignOutOpen(false);
          return true;
        }
        onClose();
        return true;
      });
    }
  }, [isOpen, isConfirmSignOutOpen, registerBackHandler, onClose]);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setIsConfirmSignOutOpen(false);
    onClose();
    await signOut();
    navigate('/login', { replace: true });
  };

  // Home navigates to the dashboard belonging to the currently authenticated role
  const getHomePath = () => {
    if (!user || !profile) return '/';
    if (profile.role === 'admin') return '/admin';
    if (profile.role === 'tutor') return '/tutor/dashboard';
    if (profile.role === 'student') return '/student/dashboard';
    return '/';
  };

  // Exactly 4 navigation items:
  // 1. Home
  // 2. About Shikshan
  // 3. Developer
  // 4. Terms & Conditions
  const menuItems = [
    { label: 'Home', path: getHomePath(), icon: Home },
    { label: 'About Shikshan', path: '/about', icon: Info },
    { label: 'Developer', path: '/developer', icon: Code2 },
    { label: 'Terms & Conditions', path: '/terms', icon: FileText },
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-50 overflow-hidden select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Main Navigation"
      >
        {/* Dimmed backdrop */}
        <div
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <aside
            aria-label="Navigation sidebar"
            className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between border-l border-[#DFD8F3]"
          >
            {/* Top Section */}
            <div className="p-6 overflow-y-auto">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between pb-5 border-b border-[#DFD8F3]">
                <ShikshanLogo size="md" showText={true} showSubtitle={true} />
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-2xl bg-[#FAF9FE] border border-[#DFD8F3] text-[#4A4668] hover:text-[#1C1938] hover:bg-[#EEECFB] flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Session Summary (if signed in) */}
              {user && (
                <div className="my-5 p-4 rounded-2xl bg-[#FAF9FE] border border-[#DFD8F3] shadow-clay-sm text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#4136CA]">Active Session</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#4136CA] capitalize">
                      {profile?.role || 'User'}
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#1C1938] truncate">{profile?.name || user.email}</p>
                  <p className="text-xs text-[#686487] truncate">{user.email}</p>
                </div>
              )}

              {/* Navigation Links — Exactly 4 Items */}
              <nav className="mt-4 space-y-2 text-left">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isDeveloper = item.label === 'Developer';
                  const devPhoto = isDeveloper ? getDeveloperPhoto() : null;

                  return (
                    <Link
                      key={`${item.path}-${idx}`}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold text-[#1C1938] hover:text-[#4136CA] hover:bg-[#FAF9FE] border border-transparent hover:border-[#DFD8F3] transition-all active:scale-95 shadow-none hover:shadow-clay-sm"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#FAF9FE] border border-[#DFD8F3] text-[#4136CA] flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
                        {isDeveloper && devPhoto ? (
                          <img
                            src={devPhoto}
                            alt="Developer Profile"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/abhishek.jpg';
                            }}
                          />
                        ) : (
                          <Icon className="w-4 h-4 stroke-[2.2]" />
                        )}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section: Clear, Responsive Logout Action */}
            <div className="p-6 border-t border-[#DFD8F3] bg-[#FAF9FE]">
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmSignOutOpen(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl text-sm font-extrabold text-[#DC2626] bg-[#FEE2E2] hover:bg-red-100 border border-[#FECACA] transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4 stroke-[2.2]" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-[#4136CA] to-[#5348E0] shadow-clay-button hover:opacity-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              <div className="mt-4 text-center">
                <p className="text-[11px] text-[#686487] font-semibold">
                  Shikshan (ಶಿಕ್ಷಣ) • Karnataka Academic Mentorship
                </p>
                <p className="text-[10px] text-[#A7AAE5] mt-0.5">
                  Classes 1–10 • Bilingual Learning
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Logout Confirmation Dialog (High z-index to overlay drawer completely) */}
      {isConfirmSignOutOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#DFD8F3] text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-clay-sm">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 id="logout-confirm-title" className="font-extrabold text-base text-[#1C1938]">
                Confirm Logout
              </h3>
              <p className="text-xs text-[#686487] mt-1 leading-relaxed">
                Are you sure you want to log out of Shikshan? Your account details and learning progress will remain safely saved.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSignOutOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#DFD8F3] bg-white text-xs font-bold text-[#4A4668] hover:bg-[#FAF9FE] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors cursor-pointer"
              >
                Confirm Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
