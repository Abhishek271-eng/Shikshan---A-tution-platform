import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Calendar,
  Target,
} from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayButton } from '../../components/common/ClayButton';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="About Shikshan" subtitle="Our Vision & Model" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Mission Statement Hero */}
        <ClayCard className="p-6 sm:p-8 space-y-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              About Shikshan
            </h2>
            <p className="text-sm font-bold text-blue-700 mt-1">
              Learn with confidence. Grow with guidance.
            </p>
            <p className="text-xs text-slate-500 font-kannada mt-0.5">
              ಶಿಕ್ಷಣ — ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಕಲಿಯಿರಿ. ಮಾರ್ಗದರ್ಶನದೊಂದಿಗೆ ಮುನ್ನಡೆಯಿರಿ.
            </p>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed pt-2">
            “Shikshan aims to make academic guidance more accessible by connecting students with tutors who can support their learning over an agreed period.”
          </p>

          <p className="text-xs text-slate-600 leading-relaxed">
            Many school students across Karnataka, especially those from rural communities and Kannada-medium schooling, struggle with fundamental concepts in Mathematics, Science, and English. Isolated 1-hour doubt apps fail to provide the consistency children need. Shikshan bridges this gap with structured 3 and 6 months mentor relationships.
          </p>
        </ClayCard>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <ClayCard className="p-5 space-y-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">3 & 6 Months Cohorts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We focus on sustained academic growth rather than isolated one-hour lessons. Students build trust and clarity with the same mentor over months.
            </p>
          </ClayCard>

          <ClayCard className="p-5 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Manual Tutor Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tutors are verified manually by our founder and trusted teachers. Marksheets and subject competence are scrutinized before matching.
            </p>
          </ClayCard>

          <ClayCard className="p-5 space-y-2">
            <HeartHandshake className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Kannada-Medium Focus</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We embrace native language explanations, ensuring students can grasp technical concepts without the barrier of unfamiliar jargon.
            </p>
          </ClayCard>

          <ClayCard className="p-5 space-y-2">
            <Target className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Affordability First</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed to remain accessible for everyday working families without demanding expensive subscription locks or surprise fees.
            </p>
          </ClayCard>
        </div>

        {/* Transparent Operations Note */}
        <ClayCard className="p-6 text-left space-y-3 bg-blue-50/60 border border-blue-100">
          <h3 className="font-extrabold text-sm text-slate-900">Our Quality Commitment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not claim that all registered applicants are instantly certified. A tutor is never represented as approved or verified until our review team has thoroughly verified their academic marksheets and suitability outside the app.
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
    </div>
  );
};
