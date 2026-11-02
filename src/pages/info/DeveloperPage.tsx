import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Linkedin, MapPin, ArrowUpRight } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayBackground } from '../../components/common/ClayBackground';
import { getDeveloperPhoto, DEVELOPER_STORAGE_KEY } from '../../lib/developerProfile';

export const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();

  // Developer profile state with fallback defaults
  const [name, setName] = useState('Abhishek Devanagaon');
  const [title, setTitle] = useState('Founder & Full-Stack Developer');
  const [email, setEmail] = useState('abhishekdevanagaon2712005@gmail.com');
  const [linkedin, setLinkedin] = useState('https://www.linkedin.com/in/abhishek-devanagaon-19668b219/');
  const [photoUrl, setPhotoUrl] = useState<string>(getDeveloperPhoto);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEVELOPER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.linkedin) setLinkedin(parsed.linkedin);
        if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
      }
    } catch {
      // Ignore local storage parsing errors
    }
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <ClayBackground className="min-h-screen flex flex-col">
      <Header
        title="Developer & Founder"
        subtitle="The person behind Shikshan"
        showBack={true}
        onBack={handleBack}
      />

      <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-6 pb-24 flex flex-col items-center">
        {/* Compact Claymorphic Developer Card */}
        <ClayCard className="w-full p-6 sm:p-7 rounded-[32px] border border-white/80 shadow-clay-card bg-white/95 backdrop-blur-md flex flex-col items-center text-center space-y-4">
          {/* Top Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] border border-[#DDD6FE] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[10px] font-black uppercase tracking-[1.5px] text-[#4136CA]">
              Developer
            </span>
          </div>

          {/* Clean Circular Photograph (Fixed display, no edit controls) */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-[#5348E0] via-[#7C3AED] to-[#C7D2FE] shadow-clay">
              <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/abhishek.jpg';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Identity & Designation (Complete name strictly fits on one line) */}
          <div className="space-y-1 w-full px-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#1C1938] tracking-tight font-display whitespace-nowrap overflow-hidden text-ellipsis">
              {name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#4136CA]">
              {title}
            </p>
            <div className="pt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#686487]">
              <MapPin className="w-3.5 h-3.5 text-[#4136CA]" />
              <span>Karnataka, India</span>
            </div>
          </div>

          {/* Contact Information Directly Below Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 w-full border-t border-[#F3EFFB]">
            {/* Email Contact Tile */}
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] shadow-clay-sm hover:shadow-clay hover:border-[#C7D2FE] hover:bg-white transition-all active:scale-[0.98] group text-left cursor-pointer min-w-0"
              title={`Send email to ${email}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#4136CA] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#686487] block">
                  Email Me
                </span>
                <span className="text-xs font-bold text-[#1C1938] block truncate" title={email}>
                  {email}
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#4136CA] flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* LinkedIn Contact Tile */}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF9FE] border border-[#E5DFF8] shadow-clay-sm hover:shadow-clay hover:border-[#C7D2FE] hover:bg-white transition-all active:scale-[0.98] group text-left cursor-pointer min-w-0"
                title="Open LinkedIn Profile"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E0E7FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] block">
                    LinkedIn
                  </span>
                  <span className="text-xs font-bold text-[#1C1938] block truncate">
                    Connect on LinkedIn
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#2563EB] flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </ClayCard>
      </main>
    </ClayBackground>
  );
};
