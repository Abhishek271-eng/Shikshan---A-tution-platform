import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
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
import { getDeveloperPhoto } from '../lib/developerProfile';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Language switch: English or Kannada
  const [lang, setLang] = useState<'en' | 'kn'>('en');

  // Selected class filter chip in Learning Preview
  const [selectedClassChip, setSelectedClassChip] = useState<string>('class_8');

  // Parent / Guardian modal state
  const [showParentModal, setShowParentModal] = useState<boolean>(false);

  const [devPhoto, setDevPhoto] = useState<string>(getDeveloperPhoto);

  useEffect(() => {
    setDevPhoto(getDeveloperPhoto());
  }, []);

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

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-4 pb-20 space-y-4">
        {/* TOP UTILITY STRIP: Language Selector & Developer Identification Element */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Subtle Developer Identification Chip (Phase 2) */}
          <button
            type="button"
            onClick={() => navigate('/developer')}
            className="inline-flex items-center gap-2 py-1 px-2.5 rounded-full bg-white/90 hover:bg-white border border-[#DFD8F3] shadow-clay-sm hover:shadow-clay active:scale-95 transition-all cursor-pointer group flex-shrink-0"
            title="View Developer Profile"
            aria-label="View Developer Profile"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C7D2FE] bg-[#FAF9FE] shadow-inner flex-shrink-0">
              <img
                src={devPhoto}
                alt="Developer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/abhishek.jpg';
                }}
              />
            </div>
            <span className="text-xs font-black text-[#1C1938] group-hover:text-[#4136CA] transition-colors pr-1">
              Developer
            </span>
          </button>

          {/* Medium Toggle */}
          <div className="inline-flex p-0.5 rounded-xl bg-white/90 border border-[#DFD8F3] shadow-clay-sm">
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-label="Switch to English"
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                lang === 'en'
                  ? 'bg-[#4136CA] text-white shadow-xs'
                  : 'text-[#686487] hover:text-[#1C1938]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang('kn')}
              aria-label="Switch to Kannada"
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all font-kannada ${
                lang === 'kn'
                  ? 'bg-[#4136CA] text-white shadow-xs'
                  : 'text-[#686487] hover:text-[#1C1938]'
              }`}
            >
              ಕನ್ನಡ
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* HERO WELCOME CLAY CARD: Prominent Logo, 3D Mascot & Educational Identity */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden rounded-[30px] p-5 sm:p-6 bg-gradient-to-br from-white/95 via-[#FAF9FE]/95 to-[#F1EDFB]/95 border border-[#DFD8F3] shadow-clay text-left space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              {/* Official Shikshan Logo Emblem */}
              <div className="inline-flex items-center gap-2.5">
                <img
                  src="/images/logo.png"
                  alt="Shikshan"
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain select-none flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-display font-black text-xl sm:text-2xl text-[#1C1938] leading-tight tracking-tight">
                    Shikshan
                  </span>
                  <span className="text-xs font-bold text-[#4136CA] font-kannada leading-tight">
                    ಶಿಕ್ಷಣ — ಕರ್ನಾಟಕ
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wide block">
                  {lang === 'en' ? 'Namaskara! 👋' : 'ನಮಸ್ಕಾರ! 👋'}
                </span>
                <h2 className="font-display font-black text-lg sm:text-xl text-[#1C1938] leading-snug tracking-tight">
                  {lang === 'en'
                    ? 'What do you want to learn today?'
                    : 'ಇಂದು ನೀವು ಏನನ್ನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?'}
                </h2>
              </div>

              <p className="text-xs text-[#575375] font-semibold leading-relaxed">
                {lang === 'en'
                  ? 'Micro-batch mentorship for Karnataka learners (Classes 1–10) in focused 3-hour batches with verified educators.'
                  : '೧–೧೦ನೇ ತರಗತಿ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕನ್ನಡ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಸಣ್ಣ ಗುಂಪಿನ ಪರಿಣಾಮಕಾರಿ ಮಾರ್ಗದರ್ಶನ.'}
              </p>
            </div>

            {/* Subtle learning-themed micro-animation mascot (respects reduced-motion) */}
            <div className="hidden xs:flex flex-shrink-0 motion-safe:animate-[pulse_4s_ease-in-out_infinite]">
              <ClayStudentReading size={105} />
            </div>
          </div>

          {/* Quick highlight tags */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] font-bold text-[#4136CA]">
            <span className="px-2.5 py-1 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE]">
              Strictly Max 4 Students
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
              Fixed 3-Hour Batches
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
              100% Verified Tutors
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRIMARY ACTIONS: Clear, tactile, claymorphic entry points                 */}
        {/* ========================================================================= */}
        <section className="space-y-3 text-left">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#686487]">
              {lang === 'en' ? 'Get Started' : 'ಪ್ರಾರಂಭಿಸಿ'}
            </h3>
            <span className="text-[11px] text-[#4136CA] font-bold">Choose Role</span>
          </div>

          <div className="space-y-2.5">
            {/* Student Entry Card */}
            <div
              onClick={() => navigate(user && profile?.role === 'student' ? '/student/dashboard' : '/student/register')}
              className="group p-4 rounded-[24px] bg-white border border-[#DFD8F3] hover:border-[#4136CA] shadow-clay-sm hover:shadow-clay cursor-pointer transition-all flex items-center justify-between gap-3.5"
              role="button"
              tabIndex={0}
              aria-label="I'm a Student"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] border border-[#C7D2FE] text-[#4136CA] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <BookOpen className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-black text-sm sm:text-base text-[#1C1938] group-hover:text-[#4136CA] transition-colors leading-snug">
                      {lang === 'en' ? "I'm a Student" : 'ನಾನು ವಿದ್ಯಾರ್ಥಿ'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#4136CA] text-[10px] font-bold">
                      Classes 1–10
                    </span>
                  </div>
                  <p className="text-xs text-[#686487] leading-snug truncate">
                    {lang === 'en'
                      ? 'Browse subjects, practise questions, track progress.'
                      : 'ವಿಷಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ, ಪ್ರಶ್ನೆಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ, ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'}
                  </p>
                  <span className="text-[10px] font-bold text-[#4136CA] pt-0.5 block">
                    {lang === 'en' ? 'Register as Student →' : 'ವಿದ್ಯಾರ್ಥಿಯಾಗಿ ನೋಂದಾಯಿಸಿ →'}
                  </span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-[#FAF9FE] border border-[#DFD8F3] group-hover:bg-[#4136CA] group-hover:text-white text-[#4136CA] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Tutor Entry Card */}
            <div
              onClick={() => navigate(user && profile?.role === 'tutor' ? '/tutor/status' : '/tutor/register')}
              className="group p-4 rounded-[24px] bg-white border border-[#A7F3D0]/80 hover:border-[#059669] shadow-clay-sm hover:shadow-clay cursor-pointer transition-all flex items-center justify-between gap-3.5"
              role="button"
              tabIndex={0}
              aria-label="I'm a Tutor"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-black text-sm sm:text-base text-[#1C1938] group-hover:text-[#065F46] transition-colors leading-snug">
                      {lang === 'en' ? "I'm a Tutor" : 'ನಾನು ಶಿಕ್ಷಕ / ಬೋಧಕ'}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-[10px] font-bold">
                      3-Hr Batches
                    </span>
                  </div>
                  <p className="text-xs text-[#686487] leading-snug truncate">
                    {lang === 'en'
                      ? 'Teach students and manage learning sessions.'
                      : 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಕಲಿಸಿ ಮತ್ತು ಕಲಿಕಾ ಅವಧಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ.'}
                  </p>
                  <span className="text-[10px] font-bold text-[#065F46] pt-0.5 block">
                    {lang === 'en' ? 'Apply as Tutor →' : 'ಶಿಕ್ಷಕರಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ →'}
                  </span>
                </div>
              </div>

              <div className="w-9 h-9 rounded-xl bg-[#FAF9FE] border border-[#A7F3D0] group-hover:bg-[#065F46] group-hover:text-white text-[#065F46] flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Parent & Child Safeguards Card */}
            <div
              onClick={() => setShowParentModal(true)}
              className="group p-3.5 rounded-[22px] bg-white border border-[#FDE68A]/80 hover:border-[#D97706] shadow-clay-sm hover:shadow-clay cursor-pointer transition-all flex items-center justify-between gap-3"
              role="button"
              tabIndex={0}
              aria-label="Parent Safeguards"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-black text-xs sm:text-sm text-[#1C1938] leading-tight">
                    {lang === 'en' ? 'Parent / Guardian' : 'ಪಾಲಕರು / ಪೋಷಕರು'}
                  </h4>
                  <p className="text-[11px] text-[#686487] truncate">
                    {lang === 'en'
                      ? 'Help children learn and track progress.'
                      : 'ಮಕ್ಕಳಿಗೆ ಕಲಿಯಲು ಸಹಾಯ ಮಾಡಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.'}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-black text-[#92400E] px-2.5 py-1 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                Safeguards
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CURRICULUM EXPLORER: State Syllabus Subject Tiles                         */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-[26px] p-4 sm:p-5 border border-[#DFD8F3] shadow-clay text-left space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-black text-sm sm:text-base text-[#1C1938] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#4136CA]" />
                <span>{lang === 'en' ? 'Explore Learning' : 'ಕಲಿಕೆಯನ್ನು ಅನ್ವೇಷಿಸಿ'}</span>
              </h3>
              <p className="text-[11px] text-[#686487]">
                {lang === 'en'
                  ? 'Classes 1–10 State Board focused academic curriculum'
                  : '೧–೧೦ನೇ ತರಗತಿ ರಾಜ್ಯ ಪಠ್ಯಕ್ರಮದ ವಿಷಯಗಳು'}
              </p>
            </div>

            <Link
              to="/student/register"
              className="text-xs font-black text-[#4136CA] hover:underline flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Class selection chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none">
            {INDIVIDUAL_CLASSES.map((cls) => {
              const isSelected = selectedClassChip === cls.id;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelectedClassChip(cls.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#4136CA] text-white border-[#4136CA] shadow-xs'
                      : 'bg-[#FAF9FE] text-[#686487] border-[#DFD8F3] hover:bg-[#EDE9FE]'
                  }`}
                >
                  {cls.label}
                </button>
              );
            })}
          </div>

          {/* Subject tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {SCHOOL_SUBJECTS.map((sub) => {
              const bgClass = getSubjectBg(sub.id);
              const icon = getSubjectIcon(sub.id);
              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(user ? '/student/dashboard' : '/student/register')}
                  className={`p-3 rounded-2xl border ${bgClass} hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between space-y-2`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white/95 shadow-xs flex items-center justify-center">
                      {icon}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#686487] opacity-60" />
                  </div>
                  <div>
                    <h5 className="font-display font-black text-xs text-[#1C1938] leading-tight">
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
        <div className="text-center pt-2 pb-1">
          {user ? (
            <p className="text-xs text-[#686487] font-medium">
              Signed in as <span className="font-black text-[#1C1938]">{profile?.name || user.email}</span>.{' '}
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
                className="font-black text-[#4136CA] hover:underline inline-flex items-center gap-1"
              >
                Go to Dashboard &rarr;
              </Link>
            </p>
          ) : (
            <p className="text-xs text-[#686487] font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-[#4136CA] hover:underline">
                Sign in to Shikshan
              </Link>
            </p>
          )}
        </div>
      </main>

      {/* PARENT / GUARDIAN GUIDE MODAL */}
      {showParentModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guardian-modal-title"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#DFD8F3] space-y-4 text-left">
            <div className="flex items-start justify-between pb-3 border-b border-[#F3EFFB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="guardian-modal-title" className="text-base font-black text-[#1C1938]">
                    Parent & Guardian Safeguards
                  </h3>
                  <p className="text-xs text-[#686487] font-kannada">ಪೋಷಕರ ಮತ್ತು ಪಾಲಕರ ಸುರಕ್ಷತಾ ಮಾಹಿತಿ</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="w-8 h-8 rounded-xl bg-[#FAF9FE] border border-[#DFD8F3] text-[#686487] hover:text-[#1C1938] flex items-center justify-center cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4A4668] leading-relaxed">
              <p>
                Shikshan provides school students (Classes 1–10) with verified, focused academic mentoring in Kannada and English in small groups of strictly up to 4 students.
              </p>

              <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] flex-shrink-0 mt-0.5" />
                  <span><strong>Verified Educators:</strong> Every tutor is verified manually outside the app before profile approval.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] flex-shrink-0 mt-0.5" />
                  <span><strong>Small Micro-Batches:</strong> Strictly 4 students maximum per batch for personal attention.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#065F46] flex-shrink-0 mt-0.5" />
                  <span><strong>Privacy Protection:</strong> Phone numbers are never shared until a learning request is reviewed and accepted.</span>
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
                className="w-full py-2.5 px-4 rounded-xl bg-[#4136CA] hover:bg-[#5348E0] text-white text-xs font-black text-center shadow-clay-button transition-all cursor-pointer"
              >
                Register Your Child
              </button>
              <button
                type="button"
                onClick={() => setShowParentModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF9FE] hover:bg-[#EDE9FE] border border-[#DFD8F3] text-[#1C1938] text-xs font-bold text-center transition-all cursor-pointer"
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
