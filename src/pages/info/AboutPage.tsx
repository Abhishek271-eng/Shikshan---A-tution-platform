import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Target,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayGraduationCap, ClayLearningScene } from '../../components/common/Clay3DIllustrations';

export const AboutPage: React.FC = () => {
  return (
    <ClayBackground className="min-h-screen flex flex-col">
      <Header title="About Shikshan" subtitle="Our Vision & Model" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* Mission Statement Hero */}
        <ClayCard className="p-6 sm:p-8 space-y-4 text-left border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <ClayGraduationCap size={64} className="flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                About Shikshan
              </h2>
              <p className="text-sm font-bold text-[#7C3AED] mt-1">
                Learn with confidence. Grow with guidance.
              </p>
              <p className="text-xs text-slate-500 font-kannada mt-0.5">
                ಶಿಕ್ಷಣ — ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ. ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed pt-2 font-medium">
            “Shikshan aims to make academic guidance more accessible by connecting students with tutors who can support their learning over an agreed period.”
          </p>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Many school students across Karnataka, especially those from rural communities and Kannada-medium schooling, struggle with fundamental concepts in Mathematics, Science, and English. Isolated doubt-clearing apps fail to provide the consistency children need. Shikshan bridges this gap by connecting students directly with verified local educators for continuous, structured guidance.
          </p>
        </ClayCard>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <ClayCard className="p-5 space-y-2 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-[#7C3AED] shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">Continuous Mentorship</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We focus on sustained academic growth rather than isolated one-hour lessons. Students build trust and conceptual clarity with dedicated educators.
            </p>
          </ClayCard>

          <ClayCard className="p-5 space-y-2 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">Manual Tutor Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tutors are verified manually by our founder and trusted teachers. Qualifications and subject competence are thoroughly reviewed outside the app before profile approval.
            </p>
          </ClayCard>

          <ClayCard className="p-5 space-y-2 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-inner">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">Kannada-Medium Focus</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We embrace native language explanations, ensuring students can grasp technical concepts without the barrier of unfamiliar jargon.
            </p>
          </ClayCard>

          <ClayCard className="p-5 space-y-2 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">Affordability First</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Designed to remain accessible for everyday working families without demanding expensive subscription locks or surprise fees.
            </p>
          </ClayCard>
        </div>

        {/* 3D Visual Scene */}
        <div className="flex justify-center py-2">
          <ClayLearningScene size={160} />
        </div>

        {/* Transparent Operations Note */}
        <ClayCard className="p-6 text-left space-y-3 bg-purple-50/70 border border-purple-100 shadow-clay-card backdrop-blur-sm">
          <h3 className="font-extrabold text-sm text-slate-800">Our Quality Commitment</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            We do not claim that all registered applicants are instantly certified. A tutor is never represented as approved or verified until our review team has thoroughly verified their qualifications and suitability outside the app.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link to="/student/register" className="w-full">
              <ClayButton variant="primary" fullWidth size="sm">
                Register as Student
              </ClayButton>
            </Link>
            <Link to="/tutor/register" className="w-full">
              <ClayButton variant="secondary" fullWidth size="sm">
                Apply as Tutor
              </ClayButton>
            </Link>
          </div>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
