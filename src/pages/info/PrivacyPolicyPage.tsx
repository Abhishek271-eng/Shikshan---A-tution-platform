import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6FC]">
      <Header title="Privacy Policy" subtitle="Initial Draft for Founder Review" />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6 text-left">
        {/* Draft Notice */}
        <div className="p-4 rounded-3xl bg-[#F4F1FA] border border-[#DFD8F3] text-[#1C1938] text-xs flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#4136CA] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Initial Draft — Pending Founder & Legal Review</p>
            <p className="leading-relaxed text-slate-600">
              This document is an operational draft designed for the Shikshan MVP. All legal, child protection, and jurisdictional provisions must be formally reviewed and ratified by the founder and legal counsel prior to commercial launch.
            </p>
          </div>
        </div>

        <ClayCard className="p-6 sm:p-8 space-y-6 text-xs text-slate-700 leading-relaxed border border-[#DFD8F3] shadow-clay-card bg-white">
          <div className="space-y-1 pb-4 border-b border-[#DFD8F3]">
            <h2 className="text-xl font-black text-[#1C1938]">
              Shikshan Privacy Policy
            </h2>
            <p className="text-slate-400">Effective Date: October 2026 • Version 1.0 (Draft)</p>
          </div>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#1C1938]">1. Information We Collect</h3>
            <p>
              Shikshan follows data minimization principles. We collect only what is strictly required to facilitate academic mentorship:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li><strong>Tutors:</strong> Full name, email address, mobile number (+91), education level, qualification/college, teaching subjects, class levels, teaching languages, availability schedule, and proposed tuition rate.</li>
              <li><strong>Students:</strong> Student name, family contact email, mobile number, school class (Classes 1–10), curriculum/board (e.g. Karnataka State Board), preferred learning language, and subjects requiring support.</li>
              <li><strong>Irrelevant Personal Data:</strong> We explicitly do NOT collect date of birth (unless mandated by future law), caste, religion, parents’ marriage status, native place, or full residential addresses.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#1C1938]">2. Why We Collect This Data</h3>
            <p>
              Information is collected solely to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
              <li>Authenticate your account securely via Supabase Auth without storing plaintext passwords.</li>
              <li>Manually review and verify tutor eligibility outside the platform.</li>
              <li>Coordinate tutor-student matching based on student language and curriculum.</li>
              <li>Deliver administrative and application status notifications.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#1C1938]">3. Protection of Educational Credentials and User Data</h3>
            <p>
              Tutor and student account information is stored in encrypted, private cloud databases. It is NEVER publicly accessible on the web. Contact details and personal identifiers are never indexed by search engines or sold to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#1C1938]">4. Who Can Review Tutor Applications</h3>
            <p>
              Only the platform founder and explicitly authorized trusted teachers have access to tutor application data. Ordinary students, unverified tutors, and the general public cannot view pending tutor applications.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#1C1938]">5. Children & Guardian Consent</h3>
            <p>
              Because Shikshan serves school-age children, we take minors’ data protection seriously. A parent or legal guardian must provide contact details and explicit consent during registration. We do not engage in behavioral tracking or targeted advertising directed at children.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-sm text-[#1C1938]">6. Access, Updating, and Account Deletion</h3>
            <p>
              Users have the right to access and correct their profile details. If you wish to delete your account, email our support team at <strong className="text-[#1C1938]">support@shikshan.org</strong>. Upon verified request, we remove authentication records and profile records from storage.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-[#DFD8F3]">
            <h3 className="font-extrabold text-sm text-[#1C1938]">7. Contact the Platform</h3>
            <p>
              For privacy inquiries, child protection concerns, or data requests, contact:
            </p>
            <p className="font-mono text-[#4136CA]">
              Shikshan Data Governance Team • Email: privacy@shikshan.org
            </p>
          </section>
        </ClayCard>
      </main>
    </div>
  );
};
