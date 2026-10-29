import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Terms and Conditions" subtitle="Initial Draft for Founder Review" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 text-left">
        {/* Draft Notice */}
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Initial Draft — Subject to Founder Approval</p>
            <p className="leading-relaxed">
              These terms outline the operating rules of the Shikshan service model. They must be ratified by the platform founder before formal legal deployment.
            </p>
          </div>
        </div>

        <ClayCard className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              Shikshan Platform Terms of Service
            </h2>
            <p className="text-slate-400">Version 1.0 (Draft) • Last Updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">1. Long-Term Educational Model</h3>
            <p>
              Shikshan connects school students with tutors for dedicated commitments of <strong>3 or 6 months</strong>. Shikshan is not an ad-hoc, per-minute, or per-doubt marketplace. Both tutors and students commit to consistent mutual engagement for steady conceptual learning.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">2. Tutor Application and Manual Review</h3>
            <p>
              Tutors must submit truthful academic information and marksheets. A submission does not constitute verification or approval. Tutors cannot represent themselves as verified until the founder and review team have formally approved their application.
            </p>
            <p>
              Shikshan does NOT conduct automated quizzes or automated exams inside the app. Manual reviews are carried out directly by experienced educators.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">3. Student Registration and Guardian Consent</h3>
            <p>
              School students under 18 years old must register with the knowledge and consent of their parent or legal guardian. Guardians retain the right to inspect academic communication and request account updates.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">4. Pricing and Payments (MVP Scope)</h3>
            <p>
              Any rates entered during tutor onboarding represent proposed monthly rates pending review and mutual agreement. The current platform version does not process payments or store credit card details.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">5. Safety and Code of Conduct</h3>
            <p>
              Respectful, constructive, and child-safe behavior is strictly enforced. Any form of harassment, misconduct, academic dishonesty, or misrepresentation will result in immediate termination of the account and referral to relevant authorities if required.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">6. Contact & Disputes</h3>
            <p>
              Questions regarding these terms should be directed to:
            </p>
            <p className="font-mono text-slate-800">
              Shikshan Legal & Founder Office • Email: terms@shikshan.org
            </p>
          </section>
        </ClayCard>
      </main>
    </div>
  );
};
