import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Users,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Atom,
  Globe2,
  Compass,
  Languages,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Header } from '../components/common/Header';
import { ClayBackground } from '../components/common/ClayBackground';
import { ClayStudentReading } from '../components/common/Clay3DIllustrations';
import { useAuth } from '../context/AuthContext';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES } from '../config/options';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Language switch: English or Kannada
  const [lang, setLang] = useState<'en' | 'kn'>('en');

  // Selected class filter chip in Learning Preview
  const [selectedClassChip, setSelectedClassChip] = useState<string>('class_8');

  // Parent / Guardian modal state
  const [showParentModal, setShowParentModal] = useState<boolean>(false);

  // Subject icon mapping
  const getSubjectIcon = (id: string) => {
    switch (id) {
      case 'mathematics':
        return <Calculator className="w-5 h-5 text-[#3730A3]" />;
      case 'science':
        return <Atom className="w-5 h-5 text-[#065F46]" />;
      case 'kannada':
        return <Languages className="w-5 h-5 text-[#92400E]" />;
      case 'english':
        return <Globe2 className="w-5 h-5 text-[#1E40AF]" />;
      case 'social_science':
        return <Compass className="w-5 h-5 text-[#854D0E]" />;
      case 'hindi':
        return <BookOpen className="w-5 h-5 text-[#831843]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#3730A3]" />;
    }
  };

  const getSubjectBg = (id: string) => {
    switch (id) {
      case 'mathematics':
        return 'bg-[#EEECFB] border-[#DFD8F3]';
      case 'science':
        return 'bg-[#ECFDF5] border-[#A7F3D0]';
      case 'kannada':
        return 'bg-[#FEF3C7] border-[#FDE68A]';
      case 'english':
        return 'bg-[#EFF6FF] border-[#BFDBFE]';
      case 'social_science':
        return 'bg-[#FEF9C3] border-[#FEF08A]';
      case 'hindi':
        return 'bg-[#FDF2F8] border-[#FBCFE8]';
      default:
        return 'bg-[#EEECFB] border-[#DFD8F3]';
    }
  };

  return (
    <ClayBackground>
      <Header />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-4 pb-16 space-y-5">
        {/* WELCOME SECTION: Compact, non-oversized, with inline illustration & language switch */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3F5] shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEECFB] text-[#3730A3] text-[11px] font-extrabold tracking-tight">
                <span>{lang === 'en' ? 'Namaskara! 👋' : 'ನಮಸ್ಕಾರ! 👋'}</span>
                <span className="text-[#6366F1] font-normal">• Classes 1–10</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#1C1938] leading-tight tracking-tight pt-0.5">
                {lang === 'en' ? 'What do you want to learn today?' : 'ಇಂದು ನೀವು ಏನನ್ನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?'}
              </h2>

              <p className="text-xs text-[#575375] leading-relaxed">
                {lang === 'en'
                  ? 'Learn with confidence. Grow with guidance.'
                  : 'ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ. ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.'}
              </p>

              {/* Language Switch Toggle */}
              <div className="pt-2 flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#736E93]">Medium:</span>
                <div className="inline-flex p-0.5 rounded-xl bg-[#F4F1FA] border border-[#DFD8F3]">
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    aria-label="Switch to English"
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                      lang === 'en'
                        ? 'bg-[#3730A3] text-white shadow-sm'
                        : 'text-[#4A4668] hover:text-[#1C1938]'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('kn')}
                    aria-label="Switch to Kannada"
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all font-kannada ${
                      lang === 'kn'
                        ? 'bg-[#3730A3] text-white shadow-sm'
                        : 'text-[#4A4668] hover:text-[#1C1938]'
                    }`}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              </div>
            </div>

            {/* 3D Clay Student Reading Illustration */}
            <ClayStudentReading size={96} />
          </div>
        </section>

        {/* PRIMARY ACTIONS: 3 Distinct immediately visible cards with clear identities */}
        <section className="space-y-2.5 text-left">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#686487]">
              {lang === 'en' ? 'Choose Your Path' : 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ'}
            </h3>
            <span className="text-[11px] text-[#6366F1] font-semibold">Immediate Access</span>
          </div>

          <div className="space-y-2.5">
            {/* Card 1: I'm a Student */}
            <div
              onClick={() => navigate(user && profile?.role === 'student' ? '/student/dashboard' : '/student/register')}
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-[#DFD8F3] hover:border-[#3730A3] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
              role="button"
              tabIndex={0}
              aria-label="I'm a Student"
            >
              <div className="w-11 h-11 rounded-xl bg-[#EEECFB] border border-[#C7D2FE] text-[#3730A3] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#1C1938] group-hover:text-[#3730A3] transition-colors leading-snug">
                    {lang === 'en' ? "I'm a Student" : 'ನಾನು ವಿದ್ಯಾರ್ಥಿ'}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#EEECFB] text-[#3730A3] text-[10px] font-bold">
                    Classes 1–10
                  </span>
                </div>
                <p className="text-xs text-[#575375] leading-snug mt-0.5 line-clamp-1">
                  {lang === 'en'
                    ? 'Browse subjects, practise questions, track progress.'
                    : 'ವಿಷಯಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ, ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ, ಪ್ರಗತಿ ಪರಿಶೀಲಿಸಿ.'}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#3730A3] px-2.5 py-1.5 rounded-xl bg-[#EEECFB] group-hover:bg-[#3730A3] group-hover:text-white transition-all flex-shrink-0">
                <span className="hidden sm:inline">Register as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 2: I'm a Tutor */}
            <div
              onClick={() => navigate(user && profile?.role === 'tutor' ? '/tutor/status' : '/tutor/register')}
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-[#A7F3D0]/80 hover:border-[#059669] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
              role="button"
              tabIndex={0}
              aria-label="I'm a Tutor"
            >
              <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#1C1938] group-hover:text-[#065F46] transition-colors leading-snug">
                    {lang === 'en' ? "I'm a Tutor" : 'ನಾನು ಶಿಕ್ಷಕ / ಬೋಧಕ'}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#ECFDF5] text-[#065F46] text-[10px] font-bold">
                    Teachers & College Students
                  </span>
                </div>
                <p className="text-xs text-[#575375] leading-snug mt-0.5 line-clamp-1">
                  {lang === 'en'
                    ? 'Teach students and manage learning sessions.'
                    : 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಲಿಸಿ, ಬೋಧನಾ ಅವಧಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ.'}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#065F46] px-2.5 py-1.5 rounded-xl bg-[#ECFDF5] group-hover:bg-[#065F46] group-hover:text-white transition-all flex-shrink-0">
                <span className="hidden sm:inline">Apply as Tutor</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Card 3: Parent / Guardian */}
            <div
              onClick={() => setShowParentModal(true)}
              className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-[#FDE68A]/80 hover:border-[#D97706] shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5"
              role="button"
              tabIndex={0}
              aria-label="Parent / Guardian"
            >
              <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-sm sm:text-base font-extrabold text-[#1C1938] group-hover:text-[#92400E] transition-colors leading-snug">
                    {lang === 'en' ? 'Parent / Guardian' : 'ಪೋಷಕರು / ಪಾಲಕರು'}
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#FFFBEB] text-[#92400E] text-[10px] font-bold">
                    Child Safeguards
                  </span>
                </div>
                <p className="text-xs text-[#575375] leading-snug mt-0.5 line-clamp-1">
                  {lang === 'en'
                    ? 'Help children learn and track progress.'
                    : 'ಮಕ್ಕಳ ಕಲಿಕೆಗೆ ನೆರವಾಗಿ, ಶಿಕ್ಷಕರ ಸಂಪರ್ಕ ಮತ್ತು ಪ್ರಗತಿ ಪರಿಶೀಲಿಸಿ.'}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#92400E] px-2.5 py-1.5 rounded-xl bg-[#FFFBEB] group-hover:bg-[#92400E] group-hover:text-white transition-all flex-shrink-0">
                <span className="hidden sm:inline">Guardian Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* LEARNING PREVIEW: Explore Learning with Class Chips & Subject Tiles */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E3F5] shadow-sm text-left space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#1C1938] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3730A3]" />
                <span>{lang === 'en' ? 'Explore Learning' : 'ಕಲಿಕೆಯನ್ನು ಅನ್ವೇಷಿಸಿ'}</span>
              </h3>
              <p className="text-[11px] text-[#686487]">
                {lang === 'en'
                  ? 'Official Karnataka curriculum subjects and class levels'
                  : 'ಕರ್ನಾಟಕ ಪಠ್ಯಕ್ರಮದ ವಿಷಯಗಳು ಮತ್ತು ತರಗತಿಗಳು'}
              </p>
            </div>

            <Link
              to="/student/register"
              className="text-xs font-bold text-[#3730A3] hover:underline flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Class Selection Chips (Classes 1–10) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#736E93] block">
              Select Class:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
              {INDIVIDUAL_CLASSES.map((cls) => {
                const isSelected = selectedClassChip === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassChip(cls.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-[#3730A3] text-white border-[#3730A3] shadow-sm'
                        : 'bg-[#F9F8FD] text-[#4A4668] border-[#DFD8F3] hover:bg-[#EEECFB]'
                    }`}
                  >
                    {cls.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {SCHOOL_SUBJECTS.map((sub) => {
              const bgClass = getSubjectBg(sub.id);
              const icon = getSubjectIcon(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(user ? '/student/dashboard' : '/student/register')}
                  className={`p-3 rounded-xl border ${bgClass} hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-2`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center">
                      {icon}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#575375] opacity-60" />
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-[#1C1938] leading-tight">
                      {sub.label.split(' ')[0]}
                    </h5>
                    <p className="text-[10px] text-[#575375] font-kannada leading-tight mt-0.5 truncate">
                      {sub.kannadaLabel?.split(' ')[0] || sub.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RETURNING USER SIGN IN STRIP */}
        <div className="text-center pt-1 pb-2">
          {user ? (
            <p className="text-xs text-[#575375]">
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
                className="font-extrabold text-[#3730A3] hover:underline inline-flex items-center gap-1"
              >
                Go to Dashboard &rarr;
              </Link>
            </p>
          ) : (
            <p className="text-xs text-[#575375]">
              Already registered?{' '}
              <Link to="/login" className="font-extrabold text-[#3730A3] hover:underline">
                Sign in to your account
              </Link>
            </p>
          )}
        </div>
      </main>

      {/* PARENT / GUARDIAN GUIDE MODAL */}
      {showParentModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guardian-modal-title"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#DFD8F3] space-y-4 text-left">
            <div className="flex items-start justify-between pb-3 border-b border-[#E5E3F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="guardian-modal-title" className="text-base font-extrabold text-[#1C1938]">
                    Parent & Guardian Safeguards
                  </h3>
                  <p className="text-xs text-[#736E93] font-kannada">ಪೋಷಕರ ಮತ್ತು ಪಾಲಕರ ಮಾರ್ಗದರ್ಶಿ</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="w-8 h-8 rounded-xl bg-[#F4F1FA] text-[#575375] hover:text-[#1C1938] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4A4668] leading-relaxed">
              <p>
                Shikshan is dedicated to providing school students (Classes 1–10) with safe, verified, and high-quality academic mentoring in Kannada and English.
              </p>

              <div className="space-y-2 p-3 rounded-2xl bg-[#F9F8FD] border border-[#E5E3F5]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] flex-shrink-0 mt-0.5" />
                  <span><strong>Guardian Mobile Registration:</strong> Parents receive direct SMS & updates regarding tutor matching and study schedules.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] flex-shrink-0 mt-0.5" />
                  <span><strong>Manual Educator Verification:</strong> Every tutor is manually reviewed outside the app before appearing in student search.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] flex-shrink-0 mt-0.5" />
                  <span><strong>Child Data Minimization:</strong> We do not track children, display ads, or share phone numbers publicly.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowParentModal(false);
                  navigate('/student/register');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3730A3] hover:bg-[#312E81] text-white text-xs font-bold text-center shadow-sm transition-all"
              >
                Register Your Child with Guardian Details
              </button>
              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F4F1FA] hover:bg-[#E5E3F5] text-[#1C1938] text-xs font-bold text-center transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </ClayBackground>
  );
};
