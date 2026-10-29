import React from 'react';
import { Code2, Github, Mail, Terminal } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';

export const DeveloperPage: React.FC = () => {
  // Configuration placeholders for founder & developer details
  // These placeholders can be updated in code or via environment configuration
  const founderConfig = {
    name: '[Founder / Lead Engineer Name]',
    role: 'Founder & Full-Stack Lead, Shikshan',
    location: 'Karnataka, India',
    bio: 'Dedicated to building equitable educational infrastructure for rural and regional-medium school students. Architecting accessible, secure, mobile-first tools with modern web standards.',
    emailPlaceholder: 'contact@shikshan.org',
    githubPlaceholder: 'https://github.com',
    linkedinPlaceholder: 'https://linkedin.com',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF4FA]">
      <Header title="Developer & Founder" subtitle="Engineering & Leadership" />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Founder Profile Card */}
        <ClayCard className="p-6 sm:p-8 space-y-5 text-left">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-500/25">
              <Code2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {founderConfig.name}
              </h2>
              <p className="text-xs font-bold text-blue-700 mt-0.5">{founderConfig.role}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{founderConfig.location}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mission & Background
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {founderConfig.bio}
            </p>
          </div>

          {/* Contact Placeholders */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Contact & Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href={`mailto:${founderConfig.emailPlaceholder}`}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 flex items-center gap-2.5 font-semibold text-slate-700 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">{founderConfig.emailPlaceholder}</span>
              </a>

              <a
                href={founderConfig.githubPlaceholder}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 flex items-center gap-2.5 font-semibold text-slate-700 transition-colors shadow-sm"
              >
                <Github className="w-4 h-4 text-slate-800 flex-shrink-0" />
                <span>GitHub Profile</span>
              </a>
            </div>
          </div>
        </ClayCard>

        {/* Technical Stack Architecture */}
        <ClayCard className="p-6 text-left space-y-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Architecture & Security</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Frontend:</strong> React 18, TypeScript, Vite, Responsive Mobile-First Claymorphism.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Edge Hosting:</strong> Cloudflare Pages static edge network.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Authentication:</strong> Supabase Auth with encrypted password hashing.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Database & Access Control:</strong> Supabase PostgreSQL with strict Row Level Security (RLS) policies.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
              <span><strong>Private Storage:</strong> Private encrypted bucket for academic marksheets with time-limited signed URLs.</span>
            </li>
          </ul>
        </ClayCard>
      </main>
    </div>
  );
};
