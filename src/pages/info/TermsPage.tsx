import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayBackground } from '../../components/common/ClayBackground';

export const TermsPage: React.FC = () => {
  return (
    <ClayBackground className="min-h-screen flex flex-col">
      <Header title="Terms and Conditions" subtitle="Initial Draft for Founder Review" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6 text-left">
        {/* Draft Notice */}
        <div className="p-4 rounded-3xl bg-purple-50/90 border border-purple-200/80 text-slate-800 text-xs flex items-start gap-3 shadow-clay-card backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-slate-900">Initial Draft — Subject to Founder Approval</p>
            <p className="leading-relaxed text-slate-600 font-medium">
              These terms outline the operating rules of the Shikshan service model. They must be ratified by the platform founder before formal legal deployment.
            </p>
          </div>
        </div>

        <ClayCard className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
          <div className="space-y-1 pb-4 border-b border-purple-100">
            <h2 className="text-xl font-black text-slate-800">
              Shikshan Platform Terms of Service
            </h2>
            <p className="text-slate-400">Version 1.0 (Draft) • Last Updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800">1. Continuous Educational Model</h3>
            <p>
              Shikshan connects school students with tutors for dedicated, continuous educational guidance over an agreed period. Shikshan is not an ad-hoc, per-minute, or per-doubt marketplace. Both tutors and students commit to consistent mutual engagement for steady conceptual learning.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800">2. Tutor Application and Manual Review</h3>
            <p>
              Tutors must submit truthful academic qualifications and background information. A submission does not constitute verification or approval. Tutors cannot represent themselves as verified until the founder and review team have formally approved their application.
            </p>
            <p>
              Shikshan does NOT conduct automated quizzes or automated exams inside the app. Manual reviews are carried out directly by experienced educators outside the app.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800">3. Student Registration and Guardian Consent</h3>
            <p>
              School students under 18 years old must register with the knowledge and consent of their parent or legal guardian. Guardians retain the right to inspect academic communication and request account updates.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800">4. Pricing and Proposed Fees (MVP Scope)</h3>
            <p>
              Any rates entered during tutor onboarding represent proposed tutoring rates pending review and mutual agreement. The current platform version does not process payments or store credit card details.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800">5. Safety and Code of Conduct</h3>
            <p>
              Respectful, constructive, and child-safe behavior is strictly enforced. Any form of harassment, misconduct, academic dishonesty, or misrepresentation will result in immediate termination of the account and referral to relevant authorities if required.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-purple-100">
            <h3 className="font-extrabold text-sm text-slate-800">6. Contact & Disputes</h3>
            <p>
              Questions regarding these terms should be directed to:
            </p>
            <p className="font-mono text-[#7C3AED]">
              Shikshan Legal & Founder Office • Email: terms@shikshan.org
            </p>
          </section>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
