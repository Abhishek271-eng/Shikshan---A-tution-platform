import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  Info,
  Shield,
  FileText,
  HelpCircle,
  LogIn,
  LogOut,
  UserCheck,
  BookOpen,
  LayoutDashboard,
  ShieldAlert,
  Calendar,
  Inbox,
  Compass,
  Heart,
  Code2,
} from 'lucide-react';
import { ShikshanLogo } from './ShikshanLogo';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';

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
    await signOut();
    onClose();
    navigate('/');
  };

  // Build role-tailored navigation items
  const getRoleMenuItems = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Register as Student', path: '/student/register', icon: BookOpen },
        { label: 'Apply as Tutor', path: '/tutor/register', icon: UserCheck },
        { label: 'About Shikshan', path: '/about', icon: Info },
        { label: 'Developer & Founder', path: '/developer', icon: Code2 },
        { label: 'Help and Contact', path: '/help', icon: HelpCircle },
        { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
        { label: 'Terms and Conditions', path: '/terms', icon: FileText },
      ];
    }

    if (profile?.role === 'tutor') {
      return [
        { label: 'Tutor Dashboard', path: '/tutor/dashboard', icon: LayoutDashboard },
        { label: 'Verification Status', path: '/tutor/status', icon: UserCheck },
        { label: 'My 3-Hour Batches', path: '/tutor/dashboard', icon: Calendar },
        { label: 'Student Inquiries', path: '/tutor/dashboard', icon: Inbox },
        { label: 'About Shikshan', path: '/about', icon: Info },
        { label: 'Developer & Founder', path: '/developer', icon: Code2 },
        { label: 'Help and Contact', path: '/help', icon: HelpCircle },
        { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
        { label: 'Terms and Conditions', path: '/terms', icon: FileText },
      ];
    }

    if (profile?.role === 'student') {
      return [
        { label: 'Student Dashboard', path: '/student/dashboard', icon: BookOpen },
        { label: 'Explore Tutors', path: '/student/dashboard', icon: Compass },
        { label: 'My Learning Requests', path: '/student/dashboard', icon: Inbox },
        { label: 'Saved Mentors', path: '/student/dashboard', icon: Heart },
        { label: 'About Shikshan', path: '/about', icon: Info },
        { label: 'Developer & Founder', path: '/developer', icon: Code2 },
        { label: 'Help and Contact', path: '/help', icon: HelpCircle },
        { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
        { label: 'Terms and Conditions', path: '/terms', icon: FileText },
      ];
    }

    if (profile?.role === 'admin') {
      return [
        { label: 'Admin Review Workspace', path: '/admin', icon: ShieldAlert },
        { label: 'About Shikshan', path: '/about', icon: Info },
        { label: 'Developer & Founder', path: '/developer', icon: Code2 },
        { label: 'Help and Contact', path: '/help', icon: HelpCircle },
        { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
        { label: 'Terms and Conditions', path: '/terms', icon: FileText },
      ];
    }

    return [
      { label: 'Home', path: '/', icon: Home },
      { label: 'About Shikshan', path: '/about', icon: Info },
      { label: 'Developer & Founder', path: '/developer', icon: Code2 },
      { label: 'Help and Contact', path: '/help', icon: HelpCircle },
      { label: 'Privacy Policy', path: '/privacy-policy', icon: Shield },
      { label: 'Terms and Conditions', path: '/terms', icon: FileText },
    ];
  };

  const menuItems = getRoleMenuItems();

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
            className="w-screen max-w-sm bg-white shadow-2xl flex flex-col justify-between border-l border-purple-100"
          >
            {/* Top Section */}
            <div className="p-6 overflow-y-auto">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between pb-6 border-b border-purple-100">
                <ShikshanLogo size="md" showText={true} showSubtitle={true} />
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-purple-50 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Session Summary (if signed in) */}
              {user && (
                <div className="my-5 p-4 rounded-2xl bg-purple-50/80 border border-purple-100 shadow-sm text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">Signed In</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-200/80 text-[#6D28D9] capitalize">
                      {profile?.role || 'User'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 truncate">{profile?.name || user.email}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="mt-4 space-y-1 text-left">
                {menuItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`${item.path}-${idx}`}
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#7C3AED] hover:bg-purple-50 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-[#7C3AED]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Section: Auth Actions */}
            <div className="p-6 border-t border-purple-100 bg-purple-50/40">
              {user ? (
                <button
                  onClick={() => setIsConfirmSignOutOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-clay-button transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}

              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-500 font-medium">
                  Shikshan (ಶಿಕ್ಷಣ) • Karnataka Academic Mentorship
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Learn with confidence. Grow with guidance.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isConfirmSignOutOpen && (
        <div
          className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 id="logout-confirm-title" className="font-extrabold text-base text-slate-800">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to log out of Shikshan? You will need to sign in again to access your dashboard and batches.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSignOutOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm transition-colors"
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
