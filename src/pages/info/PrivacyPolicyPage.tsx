import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Privacy Policy" subtitle="Initial Draft for Founder Review" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6 text-left">
        {/* Draft Notice */}
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Initial Draft — Pending Founder & Legal Review</p>
            <p className="leading-relaxed">
              This document is an operational draft designed for the Shikshan MVP. All legal, child protection, and jurisdictional provisions must be formally reviewed and ratified by the founder and legal counsel prior to commercial launch.
            </p>
          </div>
        </div>

        <ClayCard className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-1 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-black text-slate-900">
              Shikshan Privacy Policy
            </h2>
            <p className="text-slate-400">Effective Date: October 2026 • Version 1.0 (Draft)</p>
          </div>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">1. Information We Collect</h3>
            <p>
              Shikshan follows data minimization principles. We collect only what is strictly required to facilitate academic mentorship:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li><strong>Tutors:</strong> Full name, email address, mobile number (+91), education level, qualification/college, teaching subjects, class levels, teaching languages, availability schedule, proposed rate, and uploaded academic marksheets.</li>
              <li><strong>Students:</strong> Student name, email or family contact email, mobile number, school class (Classes 1–10), curriculum/board (e.g. Karnataka State Board), preferred learning language, and subjects requiring support.</li>
              <li><strong>Irrelevant Personal Data:</strong> We explicitly do NOT collect date of birth (unless mandated by future law), caste, religion, parents’ marriage status, native place, or full residential addresses.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">2. Why We Collect This Data</h3>
            <p>
              Information is collected solely to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Authenticate your account securely via Supabase Auth without storing plaintext passwords.</li>
              <li>Manually review and verify tutor eligibility outside the platform.</li>
              <li>Coordinate 3 or 6 months mentor allocation based on student language and curriculum.</li>
              <li>Deliver administrative and application status notifications.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">3. Protection of Academic Marksheets</h3>
            <p>
              Tutor academic marksheets (PDF/JPG/PNG) are stored in an encrypted, private cloud storage bucket. They are NEVER publicly accessible on the web. Only the document owner and authenticated Shikshan administrators can access these files via time-limited signed URLs. Marksheets are never indexed by search engines or shared with third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">4. Who Can Review Tutor Applications</h3>
            <p>
              Only the platform founder and explicitly authorized trusted teachers have access to tutor applications and marksheets. Ordinary students, unverified tutors, and the general public cannot view pending tutor dossiers or private marks.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">5. Children & Guardian Consent</h3>
            <p>
              Because Shikshan serves school-age children, we take minors’ data protection seriously. A parent or legal guardian must provide contact details and explicit consent during registration. We do not engage in behavioral tracking or targeted advertising directed at children.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-900">6. Access, Updating, and Account Deletion</h3>
            <p>
              Users have the right to access and correct their profile details. If you wish to delete your account and associated documents, email our support team at <strong className="text-slate-900">support@shikshan.org</strong>. Upon verified request, we remove authentication records, profile records, and purge uploaded marksheet files from storage.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">7. Contact the Platform</h3>
            <p>
              For privacy inquiries, child protection concerns, or data requests, contact:
            </p>
            <p className="font-mono text-slate-800">
              Shikshan Data Governance Team • Email: privacy@shikshan.org
            </p>
          </section>
        </ClayCard>
      </main>
    </div>
  );
};
