import React, { useState, useEffect } from 'react';
import {
  Mail,
  MapPin,
  Sparkles,
  Heart,
  BookOpen,
  Users,
  ShieldCheck,
  GraduationCap,
  Linkedin,
  Edit3,
  Check,
  X,
  Camera,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayStudentReading } from '../../components/common/Clay3DIllustrations';

const STORAGE_KEY = 'shikshan_developer_profile';

export const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();

  // Editable developer details persisted locally
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Abhishek Devanagaon');
  const [email, setEmail] = useState('abhishekdevanagaon2712005@gmail.com');
  const [linkedin, setLinkedin] = useState('https://www.linkedin.com/in/abhishek-devanagaon/');
  const [title, setTitle] = useState('Founder & Full-Stack Developer, Shikshan');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Load from local storage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.linkedin) setLinkedin(parsed.linkedin);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.photoUrl) setPhotoUrl(parsed.photoUrl);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name, email, linkedin, title, photoUrl })
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPhotoUrl(result);
        try {
          const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, photoUrl: result }));
        } catch {
          // Ignore
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
        subtitle="The Vision Behind Shikshan"
        showBack={true}
        onBack={handleBack}
      />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 space-y-6 text-left">
        {/* Founder Profile Card with Overlapping / 3D Raised Photo */}
        <ClayCard className="p-6 sm:p-7 space-y-5 border border-purple-100 shadow-clay bg-white/95">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Developer Photograph / Interactive 3D Clay Frame */}
              <div className="relative group flex-shrink-0">
                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#8B5CF6] text-white flex items-center justify-center font-black text-2xl shadow-clay-button border-4 border-white/90">
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Photo Upload Overlay Button */}
                <label
                  htmlFor="dev-photo-upload"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-[#7C3AED] border border-purple-200 shadow-sm flex items-center justify-center cursor-pointer hover:bg-purple-50 transition-all active:scale-95"
                  title="Update photograph"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    id="dev-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Developer Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                    {name}
                  </h2>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
                <p className="text-xs font-bold text-[#7C3AED] mt-0.5 truncate">{title}</p>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-[#7C3AED]" />
                  <span>Karnataka, India</span>
                </p>
              </div>
            </div>

            {/* Edit Details Toggle */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-purple-50 text-[#7C3AED] hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isEditing ? 'Cancel' : 'Edit'}</span>
            </button>
          </div>

          {/* Inline Edit Form (When Active) */}
          {isEditing && (
            <div className="p-4 rounded-2xl bg-[#FAF9FE] border border-purple-200 space-y-3 animate-fade-in text-xs">
              <h4 className="font-extrabold text-slate-800 text-xs">Edit Developer Information</h4>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  placeholder="Abhishek Devanagaon"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  placeholder="abhishekdevanagaon2712005@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  placeholder="https://www.linkedin.com/in/abhishek-devanagaon/"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Meaningful Mission Introduction */}
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100/80 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
            <p className="font-semibold text-slate-800">
              Shikshan (ಶಿಕ್ಷಣ) was created with a clear and heartfelt mission: to ensure that every school child in Karnataka, especially those in rural and regional areas studying in Kannada and English medium from Classes 1 to 10, has direct access to caring, qualified academic mentors.
            </p>
            <p className="text-slate-600">
              Growing up in Karnataka, I witnessed firsthand the disparity in access to high-quality academic guidance between metropolitan centres and tier-2/tier-3 towns. Dedicated teachers and college scholars are everywhere in our state, yet families often struggle to find safe, trusted local mentors for their children. Shikshan bridges this gap by creating small, focused 4-student learning batches with capped fees and verified educators.
            </p>
          </div>

          {/* Contact Direct Strips */}
          <div className="pt-2 border-t border-purple-100 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Connect with Abhishek
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <a
                href={`mailto:${email}`}
                className="p-3 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 flex items-center gap-2.5 font-semibold text-slate-800 transition-colors shadow-xs group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{email}</span>
              </a>

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 flex items-center gap-2.5 font-semibold text-slate-800 transition-colors shadow-xs group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Linkedin className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">LinkedIn Profile</span>
                </a>
              )}
            </div>
          </div>
        </ClayCard>

        {/* Guiding Principles */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-[#1C1938] px-1">
            Our Guiding Commitments
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-[#1C1938]">
                  Karnataka State Syllabus & Bilingual Learning
                </h4>
                <p className="text-[11px] text-[#686487] leading-relaxed font-medium">
                  Designed for Classes 1 to 10 in Kannada and English medium, empowering children with personalized curriculum guidance.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-[#1C1938]">
                  Micro-Batches (Strictly Max 4 Students)
                </h4>
                <p className="text-[11px] text-[#686487] leading-relaxed font-medium">
                  Every batch is strictly capped at 4 students per 3-hour session, ensuring individual academic attention.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFF8] shadow-clay-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-[#1C1938]">
                  Fair Fee Cap & Verified Educators
                </h4>
                <p className="text-[11px] text-[#686487] leading-relaxed font-medium">
                  Fees capped at maximum ₹3,000/month. Educators undergo identity and credential verification before approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Heartfelt Note Card with 3D Illustration */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-100/60 to-indigo-100/60 border border-purple-200/80 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#7C3AED]">
              <Heart className="w-3.5 h-3.5 fill-[#7C3AED]" />
              <span>Built with Care for Karnataka</span>
            </div>
            <p className="text-[11px] text-[#4A4668] leading-relaxed font-medium">
              Created to support students, parents, and dedicated educators across Karnataka.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ClayStudentReading size={56} />
          </div>
        </div>
      </main>
    </ClayBackground>
  );
};
