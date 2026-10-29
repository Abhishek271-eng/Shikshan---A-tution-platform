import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ShieldCheck, ArrowRight, UserCheck, HeartHandshake, Sparkles } from 'lucide-react';
import { Header } from '../components/common/Header';
import { ClayCard } from '../components/common/ClayCard';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-5 py-6 sm:py-10 flex flex-col justify-between">
        {/* Brand & Welcoming Hero Section */}
        <div className="text-center space-y-4 my-auto">
          {/* Tactile Claymorphism Logo Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#DFD8F3] via-[#F3EEFB] to-[#A7AAE5] text-[#4136CA] border-2 border-white shadow-clay mb-1">
            <GraduationCap className="w-10 h-10 stroke-[2.2]" />
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-[#1C1938] tracking-tight">
              Shikshan
            </h1>
            <p className="text-base sm:text-lg font-bold text-[#4136CA] mt-1">
              Learn with confidence. Grow with guidance.
            </p>
            <p className="text-xs font-medium text-[#686487] font-kannada mt-0.5">
              ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ • ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ
            </p>
          </div>

          <div className="max-w-md mx-auto pt-1">
            <p className="text-lg sm:text-xl font-extrabold text-[#1C1938]">
              Your learning journey starts here.
            </p>
            <p className="text-xs sm:text-sm text-[#4A4668] mt-1.5 leading-relaxed">
              Empowering school students across Karnataka, especially from rural and Kannada-medium schools, with verified academic mentors for conceptual clarity and exam success.
            </p>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F3EEFB] text-[#4136CA] border border-[#DFD8F3] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#4136CA]" />
              Classes 1–10 Focus
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EDF7EC] text-[#2C4222] border border-[#C8E3C3] shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3B522F]" />
              Manual Tutor Verification
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#F3EEFB] text-[#4136CA] border border-[#DFD8F3] shadow-sm">
              <HeartHandshake className="w-3.5 h-3.5 text-[#4136CA]" />
              Kannada & English Medium
            </span>
          </div>
        </div>

        {/* Primary Role Actions: Student & Tutor (Tactile Claymorphism) */}
        <div className="w-full space-y-4 pt-8 pb-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#736E93] text-center">
            Select Your Role to Continue
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Option */}
            <ClayCard
              interactive
              onClick={() => navigate('/student/register')}
              className="group p-5 sm:p-6 border-2 border-white/80 hover:border-[#A7AAE5] transition-all text-left flex flex-col justify-between shadow-clay hover:shadow-clay-hover"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#DFD8F3] text-[#4136CA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-white shadow-sm">
                  <BookOpen className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1C1938] group-hover:text-[#4136CA] transition-colors">
                  Student
                </h2>
                <p className="text-xs text-[#4136CA] font-bold mt-0.5 font-kannada">
                  ವಿದ್ಯಾರ್ಥಿ
                </p>
                <p className="text-xs text-[#686487] mt-2 leading-relaxed">
                  School students (Classes 1–10). Discover verified tutors, submit learning requests, and understand tough concepts with patience.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E6E1F7] flex items-center justify-between text-xs font-extrabold text-[#4136CA]">
                <span>Register as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </ClayCard>

            {/* Tutor Option */}
            <ClayCard
              interactive
              onClick={() => navigate('/tutor/register')}
              className="group p-5 sm:p-6 border-2 border-white/80 hover:border-[#A7AAE5] transition-all text-left flex flex-col justify-between shadow-clay hover:shadow-clay-hover"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#F3EEFB] text-[#4136CA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-white shadow-sm">
                  <UserCheck className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h2 className="text-xl font-extrabold text-[#1C1938] group-hover:text-[#4136CA] transition-colors">
                  Tutor
                </h2>
                <p className="text-xs text-[#4136CA] font-bold mt-0.5 font-kannada">
                  ಶಿಕ್ಷಕರು / ಬೋಧಕರು
                </p>
                <p className="text-xs text-[#686487] mt-2 leading-relaxed">
                  Qualified teachers and college students. Set your subjects, availability, and tuition fees to mentor students.
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E6E1F7] flex items-center justify-between text-xs font-extrabold text-[#4136CA]">
                <span>Apply as Tutor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </ClayCard>
          </div>

          {/* Returning User Sign In */}
          <div className="text-center pt-2">
            {user ? (
              <p className="text-xs text-[#4A4668]">
                Signed in as <span className="font-bold text-[#1C1938]">{profile?.name || user.email}</span>.{' '}
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
                  className="font-bold text-[#4136CA] hover:underline"
                >
                  Go to Dashboard &rarr;
                </Link>
              </p>
            ) : (
              <p className="text-xs text-[#4A4668]">
                Already have an account?{' '}
                <Link to="/login" className="font-extrabold text-[#4136CA] hover:underline">
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
