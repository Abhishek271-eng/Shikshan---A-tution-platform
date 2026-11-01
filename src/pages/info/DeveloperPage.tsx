import React from 'react';
import { Code2, Github, Mail, Terminal, Sparkles } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayBackground } from '../../components/common/ClayBackground';

export const DeveloperPage: React.FC = () => {
  // Configuration placeholders for founder & developer details
  // These placeholders can be updated in code or via environment configuration
  const founderConfig = {
    name: 'Abhishek Devanagaon',
    role: 'Founder & Full-Stack Lead, Shikshan',
    location: 'Karnataka, India',
    bio: 'Dedicated to building equitable educational infrastructure for rural and regional-medium school students in Karnataka. Architecting accessible, secure, mobile-first 3D claymorphism tools with modern cloud standards.',
    emailPlaceholder: 'contact@shikshan.org',
    githubPlaceholder: 'https://github.com',
    linkedinPlaceholder: 'https://linkedin.com',
  };

  return (
    <ClayBackground className="min-h-screen flex flex-col">
      <Header title="Developer & Founder" subtitle="Engineering & Leadership" />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6">
        {/* Founder Profile Card */}
        <ClayCard className="p-6 sm:p-8 space-y-5 text-left border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center font-black text-2xl shadow-clay-button border border-white/40">
              <Code2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  {founderConfig.name}
                </h2>
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              </div>
              <p className="text-xs font-bold text-[#7C3AED] mt-0.5">{founderConfig.role}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{founderConfig.location}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-100/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mission & Background
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {founderConfig.bio}
            </p>
          </div>

          {/* Contact Placeholders */}
          <div className="pt-2 border-t border-purple-100/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Contact & Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href={`mailto:${founderConfig.emailPlaceholder}`}
                className="p-3 rounded-2xl bg-white/95 border border-purple-100 hover:border-purple-300 flex items-center gap-2.5 font-semibold text-slate-800 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                <span className="truncate">{founderConfig.emailPlaceholder}</span>
              </a>

              <a
                href={founderConfig.githubPlaceholder}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-white/95 border border-purple-100 hover:border-purple-300 flex items-center gap-2.5 font-semibold text-slate-800 transition-colors shadow-sm"
              >
                <Github className="w-4 h-4 text-slate-800 flex-shrink-0" />
                <span>GitHub Profile</span>
              </a>
            </div>
          </div>
        </ClayCard>

        {/* Technical Stack Architecture */}
        <ClayCard className="p-6 text-left space-y-3 border border-white/80 shadow-clay-card bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="font-extrabold text-sm text-slate-800">Architecture & Security</h3>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 font-medium">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span><strong>Frontend:</strong> React 18, TypeScript, Vite, Responsive Mobile-First 3D Claymorphism.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span><strong>Android App:</strong> Capacitor native shell with hardware back button and keyboard padding.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span><strong>Backend API:</strong> Cloudflare Workers serverless edge runtime + Express REST API with bcrypt password hashing and secure JWT authentication.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span><strong>Database:</strong> Cloudflare D1 distributed SQLite database & local MySQL with photo support.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 flex-shrink-0" />
              <span><strong>Quality Assurance:</strong> 100% passing Vitest automated suites and Gradle APK validation.</span>
            </li>
          </ul>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
