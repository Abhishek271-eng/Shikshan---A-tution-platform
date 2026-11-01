import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { ShikshanLogo } from '../../components/common/ShikshanLogo';
import { ClayStudentMascot } from '../../components/common/Clay3DIllustrations';
import { ClayBackground } from '../../components/common/ClayBackground';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, profile } = useAuth();

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (profile.role === 'tutor') {
        navigate('/tutor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { error, user } = await signIn(email.trim().toLowerCase(), password);

      if (error || !user) {
        setErrorMessage(error || 'Invalid email address or password.');
        setIsLoading(false);
        return;
      }

      // Check if there is an intended redirect destination
      const fromPath = (location.state as { from?: string })?.from;
      if (fromPath && fromPath !== '/login' && fromPath !== '/') {
        navigate(fromPath, { replace: true });
        return;
      }

      // Role-based routing based on verified MySQL user
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (user.role === 'tutor') {
        const { application } = await api.getTutorMyStatus().catch(() => ({ application: null }));
        if (application?.status === 'approved') {
          navigate('/tutor/dashboard', { replace: true });
        } else {
          navigate('/tutor/status', { replace: true });
        }
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed. Please check server connection.';
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <ClayBackground className="justify-between">
      {/* Top Header Bar */}
      <header className="w-full max-w-md mx-auto pt-6 px-5 flex items-center justify-between z-10">
        <ShikshanLogo size="sm" showText={true} showSubtitle={false} />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#6D28D9] bg-[#EDE9FE] px-3 py-1 rounded-full border border-[#DDD6FE]">
            ಕರ್ನಾಟಕ ಶಿಕ್ಷಣ
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="w-full max-w-md mx-auto px-5 py-3 flex-1 flex flex-col justify-center relative z-10">
        {/* Title & Greeting with 3D Student Mascot */}
        <div className="text-center space-y-1 mb-1">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#F59E0B] text-lg font-bold">˗ˋˏ</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1938] tracking-tight">
              Welcome Back
            </h2>
            <span className="text-[#F59E0B] text-lg font-bold">ˎˊ˗</span>
          </div>
          <p className="text-xs text-[#686487] font-medium">
            Login to continue your learning journey
          </p>
        </div>

        {/* 3D Clay School Student Mascot with Books & Backpack */}
        <div className="flex justify-center -mb-2 z-20">
          <ClayStudentMascot size={110} />
        </div>

        {/* White Rounded Clay Card */}
        <div className="bg-white rounded-[32px] p-6 sm:p-7 shadow-clay-card border border-[#E9E4F5] relative z-10 space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#991B1B] font-medium animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#DC2626]" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email Address Input Field */}
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold text-[#1C1938] px-1"
              >
                Email Address
              </label>
              <div className="relative flex items-center bg-[#F8F7FD] border border-[#DFD8F3] focus-within:border-[#6D28D9] focus-within:ring-2 focus-within:ring-[#EDE9FE] rounded-2xl p-1.5 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Mail className="w-4 h-4 stroke-[2.2]" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full bg-transparent px-3 py-1.5 text-xs font-semibold text-[#1C1938] placeholder:text-[#9CA3AF] focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between px-1">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold text-[#1C1938]"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center bg-[#F8F7FD] border border-[#DFD8F3] focus-within:border-[#6D28D9] focus-within:ring-2 focus-within:ring-[#EDE9FE] rounded-2xl p-1.5 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Lock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent px-3 py-1.5 text-xs font-semibold text-[#1C1938] placeholder:text-[#9CA3AF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="p-2 text-[#8B5CF6] hover:text-[#6D28D9] transition-colors mr-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Primary Action Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white font-extrabold text-sm shadow-button-primary hover:from-[#6D28D9] hover:to-[#5B21B6] active:translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border-t border-white/25"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin mr-1">↻</span>
                ) : null}
                Sign In
              </button>
            </div>
          </form>

          {/* Clean Role Selection Section (Replacing cluttered duplicates & social auth) */}
          <div className="pt-3 border-t border-[#E9E4F5] space-y-2.5 text-left">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-[#1C1938]">
                New to Shikshan? Select your role:
              </span>
              <span className="text-[10px] font-semibold text-[#6D28D9] bg-[#EDE9FE] px-2 py-0.5 rounded-full">
                ನೋಂದಣಿ
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Role Card 1: Student */}
              <Link
                to="/student/register"
                className="group p-3 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] hover:border-[#6D28D9] hover:bg-white shadow-xs hover:shadow-sm transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EEECFB] border border-[#C7D2FE] text-[#3730A3] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#1C1938] group-hover:text-[#6D28D9] transition-colors">
                      Student / ವಿದ್ಯಾರ್ಥಿ
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#EEECFB] text-[#3730A3] text-[9px] font-bold">
                      Classes 1–10
                    </span>
                  </div>
                  <p className="text-[11px] text-[#686487] line-clamp-1">
                    Find tutors & practise in Kannada/English
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#6D28D9] px-2.5 py-1 rounded-lg bg-[#EDE9FE] group-hover:bg-[#6D28D9] group-hover:text-white transition-all flex-shrink-0">
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>

              {/* Role Card 2: Tutor */}
              <Link
                to="/tutor/register"
                className="group p-3 rounded-2xl bg-[#F8F7FD] border border-[#DFD8F3] hover:border-[#059669] hover:bg-white shadow-xs hover:shadow-sm transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-extrabold text-[#1C1938] group-hover:text-[#059669] transition-colors">
                      Tutor / ಶಿಕ್ಷಕರು
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#ECFDF5] text-[#059669] text-[9px] font-bold">
                      Teachers & Mentors
                    </span>
                  </div>
                  <p className="text-[11px] text-[#686487] line-clamp-1">
                    Teach students for 3 or 6 months
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-[#059669] px-2.5 py-1 rounded-lg bg-[#ECFDF5] group-hover:bg-[#059669] group-hover:text-white transition-all flex-shrink-0">
                  <span>Apply</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full text-center py-3 text-[11px] text-[#9CA3AF] z-10">
        Shikshan Karnataka • ಕಲಿಯುವ ಆತ್ಮವಿಶ್ವಾಸ, ಬೆಳೆಯುವ ಮಾರ್ಗದರ್ಶನ
      </footer>
    </ClayBackground>
  );
};
