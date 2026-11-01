import React from 'react';
import { Mail, MapPin, Sparkles, Heart, BookOpen, Users, ShieldCheck, GraduationCap } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayStudentReading, ClayGraduationCap } from '../../components/common/Clay3DIllustrations';

export const DeveloperPage: React.FC = () => {
  const founder = {
    name: 'Abhishek Devanagaon',
    title: 'Founder & Creator of Shikshan',
    location: 'Karnataka, India',
    email: 'abhishekdevanagaon2712005@gmail.com',
    vision:
      'Shikshan (ಶಿಕ್ಷಣ) was created with a clear and heartfelt mission: to ensure that every school child in Karnataka, especially those in rural and regional areas studying in Kannada and English medium from Classes 1 to 10, has direct access to caring, qualified academic mentors.',
    story:
      'Growing up in Karnataka, I witnessed firsthand the disparity in access to high-quality academic guidance between metropolitan centres and tier-2/tier-3 towns. Dedicated teachers and college scholars are everywhere in our state, yet families often struggle to find safe, trusted local mentors for their children. Shikshan bridges this gap by creating small, focused 4-student learning batches with capped fees and verified educators.',
  };

  return (
    <ClayBackground className="min-h-screen flex flex-col">
      <Header title="Developer & Founder" subtitle="The Vision Behind Shikshan" />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6 text-left">
        {/* Founder Hero Card */}
        <ClayCard className="p-6 sm:p-7 space-y-5 border border-purple-100 shadow-clay bg-white/95">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center font-black text-2xl shadow-clay-button border border-white/50 flex-shrink-0">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    {founder.name}
                  </h2>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
                <p className="text-xs font-bold text-[#7C3AED] mt-0.5">{founder.title}</p>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#7C3AED]" />
                  <span>{founder.location}</span>
                </p>
              </div>
            </div>

            <div className="hidden xs:block flex-shrink-0">
              <ClayGraduationCap size={64} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/80 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
            <p className="font-semibold text-slate-800">
              {founder.vision}
            </p>
            <p className="text-slate-600">
              {founder.story}
            </p>
          </div>

          {/* Contact Direct Strip */}
          <div className="pt-2 border-t border-purple-100 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Get in Touch with the Founder
            </h3>
            <a
              href={`mailto:${founder.email}`}
              className="p-3.5 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 flex items-center justify-between gap-3 text-xs font-bold text-slate-800 hover:text-[#7C3AED] shadow-sm transition-all group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="truncate">{founder.email}</span>
              </div>
              <span className="text-[11px] font-semibold text-[#7C3AED] group-hover:underline flex-shrink-0">
                Send Email &rarr;
              </span>
            </a>
          </div>
        </ClayCard>

        {/* Core Principles */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-800 px-1">
            Our Guiding Commitments
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-800">
                  Karnataka State Syllabus & Bilingual Learning
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Designed specifically for Karnataka syllabus students in Classes 1 to 10, empowering children to learn in their mother tongue Kannada and English with complete confidence.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-800">
                  Micro-Batches (Strictly Maximum 4 Students)
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  No overcrowded coaching centers. Every tutor teaches a maximum of 4 students per 3-hour batch, ensuring individual academic attention and personal growth for each child.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-slate-800">
                  Fair Fee Cap & Verified Educators
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Monthly tutor fees are capped at ₹3,000 to keep mentorship affordable for every family. All educators undergo manual credential verification before mentoring students.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Heartfelt Note Card with Illustration */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-100/60 to-indigo-100/60 border border-purple-200/80 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#7C3AED]">
              <Heart className="w-4 h-4 fill-[#7C3AED]" />
              <span>Built for Karnataka's Future</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Have questions or suggestions? We are always listening and eager to support every student, parent, and teacher.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ClayStudentReading size={72} />
          </div>
        </div>
      </main>
    </ClayBackground>
  );
};
