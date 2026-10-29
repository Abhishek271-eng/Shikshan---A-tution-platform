import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  Info,
  Code2,
  Shield,
  FileText,
  HelpCircle,
  LogIn,
  LogOut,
  UserCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({ isOpen, onClose }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'About Shikshan', path: '/about', icon: Info },
    { label: 'Developer', path: '/developer', icon: Code2 },
    { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
    { label: 'Terms and Conditions', path: '/terms', icon: FileText },
    { label: 'Help and Contact', path: '/help', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" role="dialog" aria-modal="true" aria-label="Main Navigation">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label="Navigation sidebar"
          className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between border-l border-slate-100"
        >
          {/* Top Section */}
          <div className="p-6 overflow-y-auto">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E6E1F7]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5B4FCF] to-[#4136CA] flex items-center justify-center text-white shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-xl text-[#1C1938] leading-tight">Shikshan</h2>
                  <p className="text-xs text-[#686487] font-medium">Learn with confidence</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#686487] hover:text-[#1C1938] hover:bg-[#F3EEFB] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Session Summary (if signed in) */}
            {user && (
              <div className="my-5 p-4 rounded-2xl bg-[#F3EEFB] border border-[#DFD8F3]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4136CA]">Signed In</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DFD8F3] text-[#4136CA] capitalize">
                    {profile?.role || 'User'}
                  </span>
                </div>
                <p className="font-bold text-[#1C1938] truncate">{profile?.name || user.email}</p>
                <p className="text-xs text-[#686487] truncate">{user.email}</p>

                <div className="mt-3 pt-3 border-t border-[#DFD8F3] flex flex-col gap-1.5">
                  {profile?.role === 'tutor' && (
                    <Link
                      to="/tutor/status"
                      onClick={onClose}
                      className="text-xs font-semibold text-[#4136CA] hover:text-[#3128A3] flex items-center gap-1.5 py-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      View Application Status
                    </Link>
                  )}
                  {profile?.role === 'student' && (
                    <Link
                      to="/student/dashboard"
                      onClick={onClose}
                      className="text-xs font-semibold text-[#4136CA] hover:text-[#3128A3] flex items-center gap-1.5 py-1"
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      Student Dashboard
                    </Link>
                  )}
                  {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="text-xs font-semibold text-[#4136CA] hover:text-[#3128A3] flex items-center gap-1.5 py-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Admin Review Panel
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Nav Menu Items */}
            <nav className="mt-4 flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[#1C1938] hover:text-[#4136CA] hover:bg-[#F3EEFB] font-semibold text-sm transition-colors"
                  >
                    <Icon className="w-5 h-5 text-[#A7AAE5]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions: Sign In / Sign Out */}
          <div className="p-6 border-t border-[#E6E1F7] bg-[#F7F6FC]">
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl clay-button-primary text-white font-semibold text-sm shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-[11px] text-[#A29EBE]">Shikshan Platform v1.0 MVP</p>
              <p className="text-[10px] text-[#A29EBE] mt-0.5">Learn with confidence. Grow with guidance.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
