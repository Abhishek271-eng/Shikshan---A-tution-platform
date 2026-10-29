import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ShieldCheck, Calendar, ArrowRight, UserCheck, HeartHandshake } from 'lucide-react';
import { Header } from '../components/common/Header';
import { ClayCard } from '../components/common/ClayCard';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-5 py-6 sm:py-10 flex flex-col justify-between">
        {/* Brand & Welcoming Hero Section */}
        <div className="text-center space-y-4 my-auto">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl shadow-blue-500/25 mb-1">
            <GraduationCap className="w-11 h-11" />
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Shikshan
            </h1>
            <p className="text-base sm:text-lg font-semibold text-blue-700 mt-1">
              Learn with confidence. Grow with guidance.
            </p>
            <p className="text-xs font-normal text-slate-500 font-kannada mt-0.5">
              ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ. ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.
            </p>
          </div>

          <div className="max-w-md mx-auto pt-2">
            <p className="text-lg sm:text-xl font-bold text-slate-800">
              Your learning journey starts here.
            </p>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Connecting school students, particularly from rural areas and Kannada-medium backgrounds, with committed tutors for 3 or 6 months of steady academic guidance.
            </p>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-slate-700 border border-slate-200/80 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              3 or 6 Months Support
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-slate-700 border border-slate-200/80 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Manual Tutor Review
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-slate-700 border border-slate-200/80 shadow-sm">
              <HeartHandshake className="w-3.5 h-3.5 text-purple-600" />
              Kannada & English Medium
            </span>
          </div>
        </div>

        {/* Primary Role Actions: Tutor & Student (Tactile Claymorphism) */}
        <div className="w-full space-y-4 pt-8 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
            Select Your Role to Continue
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tutor Option */}
            <ClayCard
              interactive
              onClick={() => navigate('/tutor/register')}
              className="group p-5 sm:p-6 border-2 border-transparent hover:border-blue-400 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Tutor
                </h2>
                <p className="text-xs text-blue-600 font-semibold mt-0.5 font-kannada">
                  ಶಿಕ್ಷಕರು / ಬೋಧಕರು
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  College students or qualified teachers. Apply to support students over 3 or 6 months. Subject to manual review.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>Apply as Tutor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </ClayCard>

            {/* Student Option */}
            <ClayCard
              interactive
              onClick={() => navigate('/student/register')}
              className="group p-5 sm:p-6 border-2 border-transparent hover:border-blue-400 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-inner">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Student
                </h2>
                <p className="text-xs text-blue-600 font-semibold mt-0.5 font-kannada">
                  ವಿದ್ಯಾರ್ಥಿ
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  School students (Classes 1–10). Connect with dedicated mentors for long-term doubt clarification and study guidance.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700">
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </ClayCard>
          </div>

          {/* Returning User Sign In */}
          <div className="text-center pt-2">
            {user ? (
              <p className="text-xs text-slate-600">
                Signed in as <span className="font-bold text-slate-800">{profile?.name || user.email}</span>.{' '}
                <Link
                  to={
                    profile?.role === 'tutor'
                      ? '/tutor/status'
                      : profile?.role === 'student'
                      ? '/student/dashboard'
                      : profile?.role === 'admin'
                      ? '/admin'
                      : '/'
                  }
                  className="font-bold text-blue-700 hover:underline"
                >
                  Go to Dashboard &rarr;
                </Link>
              </p>
            ) : (
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-blue-700 hover:underline">
                  Sign in here
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
