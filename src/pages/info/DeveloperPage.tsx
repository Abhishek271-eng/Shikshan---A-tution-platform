
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
  ArrowUpRight,
  Quote,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { ClayCard } from '../../components/common/ClayCard';
import { ClayBackground } from '../../components/common/ClayBackground';
import { ClayStudentReading } from '../../components/common/Clay3DIllustrations';

const STORAGE_KEY = 'shikshan_developer_profile';

// Set your actual image path here if you have one in public/images.
// Example: '/images/abhishek.jpg'
const DEFAULT_DEVELOPER_PHOTO = '/images/abhishek.jpg';

export const DeveloperPage: React.FC = () => {
  const navigate = useNavigate();

  // Existing developer profile state - names preserved
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('Abhishek Devanagaon');
  const [email, setEmail] = useState(
    'abhishekdevanagaon2712005@gmail.com'
  );
  const [linkedin, setLinkedin] = useState(
    'https://www.linkedin.com/in/abhishek-devanagaon-19668b219/'
  );
  const [title, setTitle] = useState(
    'Founder & Full-Stack Developer, Shikshan'
  );
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Load previously saved developer information
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
      // Ignore local storage parsing errors
    }
  }, []);

  // Save developer information
  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name,
          email,
          linkedin,
          title,
          photoUrl,
        })
      );
      setIsEditing(false);
    } catch {
      alert('Unable to save changes. Please check available storage.');
    }
  };

  // Existing photograph upload functionality
  const handlePhotoSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setPhotoUrl(result);

      try {
        const current = JSON.parse(
          localStorage.getItem(STORAGE_KEY) || '{}'
        );

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...current,
            photoUrl: result,
          })
        );
      } catch {
        // Ignore storage errors
      }
    };

    reader.onerror = () => {
      alert('Unable to load this photograph.');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Existing back navigation
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const displayPhoto = photoUrl || DEFAULT_DEVELOPER_PHOTO;

  return (
    <ClayBackground className="min-h-screen flex flex-col">

      <Header
        title="Developer & Founder"
        subtitle="The person behind Shikshan"
        showBack={true}
        onBack={handleBack}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-28 space-y-7">

        {/* =========================================
            FOUNDER HERO SECTION
        ========================================= */}

        <section
          className="relative overflow-hidden rounded-[34px] p-5 sm:p-8 border border-white/80"
          style={{
            background:
              'linear-gradient(145deg, #F0E8FF 0%, #FCE8F0 48%, #FFF0DC 100%)',
            boxShadow:
              '10px 12px 30px rgba(137, 111, 173, 0.13), -7px -7px 20px rgba(255,255,255,0.85)',
          }}
        >
          {/* Decorative crayon-style elements */}

          <div className="absolute -top-9 -right-7 w-32 h-32 rounded-full bg-purple-300/30 blur-xl" />
          <div className="absolute bottom-5 -left-8 w-28 h-28 rounded-full bg-pink-300/30 blur-xl" />

          <div className="absolute top-7 right-9 text-amber-500/80 rotate-12">
            <Sparkles size={28} />
          </div>

          <div className="absolute top-24 right-7 text-purple-400/70 -rotate-12">
            <span className="text-3xl font-black">✳</span>
          </div>

          <div className="absolute bottom-9 right-8 text-pink-400/70 rotate-12">
            <Heart size={25} />
          </div>

          <div className="relative z-10">

            {/* Small label */}

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/75 border border-white shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-black tracking-[1.5px] uppercase text-purple-700">
                The mind behind Shikshan
              </span>
            </div>

            {/* Founder photo and information */}

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">

              {/* Photograph */}

              <div className="relative flex-shrink-0">

                <div
                  className="w-36 h-36 sm:w-40 sm:h-40 rounded-[38px] p-2 bg-white"
                  style={{
                    boxShadow:
                      '8px 9px 18px rgba(111, 80, 155, 0.18), -4px -4px 12px rgba(255,255,255,0.9)',
                    transform: 'rotate(-3deg)',
                  }}
                >
                  <div className="w-full h-full rounded-[30px] overflow-hidden bg-gradient-to-br from-purple-300 via-pink-200 to-orange-200 flex items-center justify-center">

                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <GraduationCap
                        size={65}
                        className="text-white"
                      />
                    )}

                  </div>
                </div>

                {/* Photo upload button */}

                <label
                  htmlFor="dev-photo-upload"
                  title="Upload developer photograph"
                  className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-white text-purple-600 flex items-center justify-center cursor-pointer border-2 border-purple-100 transition-transform hover:scale-110 active:scale-95"
                  style={{
                    boxShadow:
                      '4px 5px 12px rgba(100,70,150,0.18)',
                  }}
                >
                  <Camera size={19} />

                  <input
                    id="dev-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>

                <div className="absolute -top-3 -left-3 w-9 h-9 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 shadow-md rotate-12">
                  <Sparkles size={17} />
                </div>
              </div>

              {/* Founder details */}

              <div className="text-center sm:text-left flex-1 min-w-0">

                <p className="text-xs font-bold text-purple-600 mb-2 tracking-wide">
                  HELLO, I'M
                </p>

                <h1 className="text-3xl sm:text-4xl font-black text-[#35264F] tracking-tight leading-tight break-words">
                  {name}
                </h1>

                <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/75 border border-white">
                  <span className="text-xs font-bold text-purple-700">
                    {title}
                  </span>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-3 text-xs font-semibold text-[#796A91]">
                  <MapPin size={14} />
                  Karnataka, India
                </div>

              </div>

            </div>

            {/* Edit profile */}

            <div className="flex justify-end mt-6">

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/85 border border-white text-purple-700 font-bold text-xs shadow-sm hover:bg-white transition-all active:scale-95"
              >
                {isEditing ? (
                  <X size={15} />
                ) : (
                  <Edit3 size={15} />
                )}

                {isEditing ? 'Close Editor' : 'Edit Profile'}
              </button>

            </div>

          </div>
        </section>


        {/* =========================================
            EDIT PROFILE PANEL
        ========================================= */}

        {isEditing && (
          <ClayCard className="p-5 sm:p-6 rounded-[28px] border border-purple-100 space-y-4">

            <div>
              <h3 className="text-lg font-black text-[#35264F]">
                Your Profile
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Update your public developer information.
              </p>
            </div>

            {[
              {
                label: 'Full Name',
                value: name,
                setter: setName,
                type: 'text',
                placeholder: 'Your full name',
              },
              {
                label: 'Email Address',
                value: email,
                setter: setEmail,
                type: 'email',
                placeholder: 'Your email address',
              },
              {
                label: 'LinkedIn Profile',
                value: linkedin,
                setter: setLinkedin,
                type: 'url',
                placeholder: 'https://linkedin.com/in/your-profile',
              },
              {
                label: 'Designation',
                value: title,
                setter: setTitle,
                type: 'text',
                placeholder: 'Your designation',
              },
            ].map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="text-xs font-bold text-slate-600">
                  {field.label}
                </label>

                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full min-w-0 px-4 py-3 rounded-2xl bg-[#F6F2FC] border border-purple-100 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-500 text-white text-sm font-extrabold shadow-lg shadow-purple-200 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Check size={17} />
              Save Profile
            </button>

          </ClayCard>
        )}


        {/* =========================================
            DEVELOPER'S PERSONAL NOTE
        ========================================= */}

        <section
          className="relative overflow-hidden rounded-[30px] p-6 sm:p-8 border border-amber-100"
          style={{
            background:
              'linear-gradient(135deg, #FFF8DF, #FFF0E6)',
            boxShadow:
              '7px 9px 20px rgba(190, 154, 105, 0.12), -5px -5px 15px rgba(255,255,255,0.9)',
          }}
        >

          {/* Decorative crayon strokes */}

          <div className="absolute top-4 right-5 text-orange-300 text-4xl font-black rotate-12">
            ✳
          </div>

          <div className="absolute bottom-4 right-7 text-pink-300 text-3xl -rotate-12">
            ♥
          </div>

          <div className="relative z-10">

            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                <Quote size={21} />
              </div>

              <div>
                <p className="text-xs font-black text-orange-700 tracking-wide uppercase">
                  A little note from the founder
                </p>
                <p className="text-[10px] font-semibold text-orange-500">
                  More than just an application
                </p>
              </div>
            </div>

            <p className="text-lg sm:text-xl font-black text-[#67452E] leading-relaxed tracking-tight">
              "Every child deserves someone who believes in their potential, even when opportunities are limited."
            </p>

            <div className="w-20 h-1.5 rounded-full bg-orange-300 mt-5 mb-4 rotate-[-2deg]" />

            <p className="text-sm text-[#80664F] leading-relaxed font-medium">
              Shikshan started with a simple thought: learning should not
              become a privilege available only to families who can afford
              expensive tuition. I wanted to build something that brings
              students and dedicated mentors closer, one small learning
              community at a time.
            </p>

            <p className="mt-5 text-sm font-black text-orange-700">
              — Founder, Shikshan
            </p>

          </div>
        </section>


        {/* =========================================
            WHY SHIKSHAN EXISTS
        ========================================= */}

        <section className="space-y-4">

          <div className="px-1">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-purple-500 mb-1">
              The purpose
            </p>

            <h2 className="text-2xl font-black text-[#35264F]">
              Why Shikshan?
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              A little idea with a bigger purpose.
            </p>
          </div>

          <div
            className="rounded-[28px] p-5 sm:p-6 bg-white/90 border border-purple-100"
            style={{
              boxShadow:
                '7px 8px 20px rgba(115,90,150,0.09), -4px -4px 12px rgba(255,255,255,0.9)',
            }}
          >

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                <GraduationCap size={25} />
              </div>

              <div className="min-w-0">
                <h3 className="font-black text-[#35264F] text-base mb-2">
                  Learning without boundaries
                </h3>

                <p className="text-sm leading-relaxed text-slate-600">
                  Across Karnataka, many students studying in Kannada and
                  English medium struggle to access personal academic
                  guidance. Shikshan aims to connect these students with
                  dedicated mentors who can make learning easier and
                  more approachable.
                </p>
              </div>

            </div>

            <div className="my-5 border-t border-dashed border-purple-200" />

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Heart size={24} />
              </div>

              <div className="min-w-0">
                <h3 className="font-black text-[#35264F] text-base mb-2">
                  Personal attention matters
                </h3>

                <p className="text-sm leading-relaxed text-slate-600">
                  Instead of overcrowded classrooms, the idea is to
                  create small, focused learning groups where every
                  student gets the opportunity to ask questions,
                  understand concepts and grow confidently.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* =========================================
            THREE CORE COMMITMENTS
        ========================================= */}

        <section className="space-y-4">

          <div className="px-1">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-purple-500 mb-1">
              What we believe in
            </p>

            <h2 className="text-2xl font-black text-[#35264F]">
              Our little promises
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Commitment 1 */}

            <div
              className="rounded-[25px] p-5 bg-[#EAE4FF] border border-white"
              style={{
                boxShadow:
                  '5px 7px 15px rgba(110,90,160,0.10), -4px -4px 10px white',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-purple-600 shadow-sm mb-4">
                <BookOpen size={24} />
              </div>

              <h3 className="text-sm font-black text-[#44346B] mb-2">
                Karnataka State Syllabus & Bilingual Learning
              </h3>

              <p className="text-xs leading-relaxed font-medium text-[#71628F]">
                Karnataka syllabus learning in Kannada and English medium.
              </p>
            </div>


            {/* Commitment 2 */}

            <div
              className="rounded-[25px] p-5 bg-[#FFE9DF] border border-white"
              style={{
                boxShadow:
                  '5px 7px 15px rgba(190,120,90,0.09), -4px -4px 10px white',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-orange-600 shadow-sm mb-4">
                <Users size={24} />
              </div>

              <h3 className="text-sm font-black text-[#794D3B] mb-2">
                Micro-Batches (Strictly Max 4 Students)
              </h3>

              <p className="text-xs leading-relaxed font-medium text-[#9A7667]">
                A maximum of four students for focused attention.
              </p>
            </div>


            {/* Commitment 3 */}

            <div
              className="rounded-[25px] p-5 bg-[#DFF5E9] border border-white"
              style={{
                boxShadow:
                  '5px 7px 15px rgba(90,150,110,0.09), -4px -4px 10px white',
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-emerald-600 shadow-sm mb-4">
                <ShieldCheck size={24} />
              </div>

              <h3 className="text-sm font-black text-[#365F49] mb-2">
                Fair Fee Cap & Verified Educators
              </h3>

              <p className="text-xs leading-relaxed font-medium text-[#648C74]">
                Educators undergo verification before approval.
              </p>
            </div>

          </div>
        </section>


        {/* =========================================
            CONTACT THE FOUNDER
        ========================================= */}

        <section className="space-y-4">

          <div className="px-1">
            <p className="text-[10px] font-black uppercase tracking-[2px] text-purple-500 mb-1">
              Let's connect
            </p>

            <h2 className="text-2xl font-black text-[#35264F]">
              Say hello! 👋
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Have an idea, suggestion or feedback?
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Email */}

            <a
              href={`mailto:${email}`}
              className="group flex items-center gap-3 p-4 rounded-[24px] bg-white border border-purple-100 transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                boxShadow:
                  '5px 6px 15px rgba(110,90,160,0.09)',
              }}
            >

              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Mail size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-wide text-purple-500">
                  Email me
                </p>

                <p className="text-xs font-bold text-[#44346B] truncate mt-1">
                  {email}
                </p>
              </div>

              <ArrowUpRight
                size={17}
                className="text-purple-400 flex-shrink-0"
              />

            </a>


            {/* LinkedIn */}

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-4 rounded-[24px] bg-white border border-blue-100 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  boxShadow:
                    '5px 6px 15px rgba(90,110,160,0.09)',
                }}
              >

                <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-110 transition-transform">
                  <Linkedin size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-wide text-blue-500">
                    Find me on
                  </p>

                  <p className="text-xs font-bold text-[#354C70] mt-1">
                    LinkedIn Profile
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-blue-400 flex-shrink-0"
                />

              </a>
            )}

          </div>
        </section>


        {/* =========================================
            FOOTER / BRAND SIGNATURE
        ========================================= */}

        <section
          className="relative overflow-hidden rounded-[30px] p-5 sm:p-6 flex items-center justify-between gap-3 border border-white"
          style={{
            background:
              'linear-gradient(120deg, #E8E1FF, #FBE6F0, #FFEFD9)',
            boxShadow:
              '6px 8px 20px rgba(110,90,150,0.10), -4px -4px 12px white',
          }}
        >

          <div className="flex-1 min-w-0 relative z-10">

            <div className="flex items-center gap-2 mb-2">
              <Heart
                size={16}
                className="text-pink-500 fill-pink-400"
              />

              <p className="text-xs font-black text-purple-700">
                Made with a purpose
              </p>
            </div>

            <h3 className="text-xl font-black text-[#35264F]">
              Shikshan
            </h3>

            <p className="text-xs font-medium text-[#75658F] mt-1 leading-relaxed">
              Small steps. Strong foundations. Brighter futures.
            </p>

            <p className="text-[10px] font-bold text-purple-500 mt-4">
              © {new Date().getFullYear()} Shikshan
            </p>

          </div>

          <div className="flex-shrink-0 relative z-10">
            <div className="w-24 h-24 flex items-center justify-center rounded-[28px] bg-white/50">
              <ClayStudentReading size={85} />
            </div>
          </div>

          <div className="absolute -top-5 -right-5 w-20 h-20 bg-purple-300/20 rounded-full blur-xl" />

        </section>

      </main>
    </ClayBackground>
  );
};
