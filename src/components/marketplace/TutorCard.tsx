import React from 'react';
import { ShieldCheck, Heart, ArrowRight, Clock, Globe2, GraduationCap, Award } from 'lucide-react';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES, TEACHING_LANGUAGES } from '../../config/options';

interface TutorCardProps {
  tutor: TutorApplication;
  isFavorite: boolean;
  onToggleFavorite: (tutorId: string) => void;
  onViewProfile: (tutor: TutorApplication) => void;
  onRequestTutor: (tutor: TutorApplication) => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  isFavorite,
  onToggleFavorite,
  onViewProfile,
  onRequestTutor,
}) => {
  const tutorName = tutor.tutor_profile?.name || (tutor as any).name || 'Verified Educator';
  const photoUrl = tutor.photo_url || tutor.tutor_profile?.photo_url || undefined;
  const feeDisplay = tutor.fee_amount || tutor.proposed_rate || 3000;
  const hoursDisplay = tutor.hours_per_day
    ? tutor.hours_per_day === 5
      ? '5+ hrs/day'
      : `${tutor.hours_per_day} hrs/day`
    : '2 hrs/day';

  // Format subjects with readable labels
  const subjectLabels = (tutor.subjects || []).map(
    (s) => SCHOOL_SUBJECTS.find((sub) => sub.id === s)?.label.split(' ')[0] || s
  );

  // Format classes taught (e.g. "Classes 6, 7, 8" or "Classes 1–10")
  const classLabels = (tutor.class_levels || []).map(
    (c) => INDIVIDUAL_CLASSES.find((cl) => cl.id === c)?.label.replace('Class ', '') || c
  );
  const classesTaughtDisplay =
    classLabels.length > 0 ? `Classes ${classLabels.join(', ')}` : 'Classes 1–10';

  // Format teaching languages
  const languageLabels = (tutor.teaching_languages || []).map(
    (l) => TEACHING_LANGUAGES.find((lang) => lang.id === l)?.label.split(' ')[0] || l
  );
  const languagesDisplay = languageLabels.length > 0 ? languageLabels.join(', ') : 'Kannada & English';

  // Numerical experience check: strictly positive display ("1 Year Experience", "${exp} Years Experience")
  // Completely omitted if 0, null, or undefined
  const expNum = tutor.teaching_experience ? parseInt(tutor.teaching_experience.toString(), 10) : 0;
  const hasExperience = !isNaN(expNum) && expNum > 0;

  // Initials & pastel palette for 3D clay monogram fallback
  const initials =
    tutorName
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TR';

  const hash = (tutorName || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const colorPalettes = [
    { bg: 'from-[#C4B5FD] to-[#8B5CF6]', text: 'text-white' },
    { bg: 'from-[#93C5FD] to-[#3B82F6]', text: 'text-white' },
    { bg: 'from-[#A7F3D0] to-[#10B981]', text: 'text-[#064E3B]' },
    { bg: 'from-[#FDE68A] to-[#F59E0B]', text: 'text-[#78350F]' },
    { bg: 'from-[#FBCFE8] to-[#EC4899]', text: 'text-[#831843]' },
  ];
  const palette = colorPalettes[hash % colorPalettes.length];

  return (
    <div className="relative overflow-visible pt-7 mt-5 bg-white rounded-[24px] p-4.5 sm:p-5 border border-[#E9E4F5] shadow-clay hover:shadow-clay-md transition-all flex flex-col justify-between space-y-3.5 group text-left">
      {/* Overlapping Raised 3D Photograph / Avatar extending beyond the upper boundary */}
      <div className="absolute -top-5 left-5 z-10">
        <div className="relative inline-block select-none flex-shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-white shadow-clay-md flex items-center justify-center font-black bg-white transition-transform group-hover:scale-105">
            {photoUrl ? (
              <img src={photoUrl} alt={tutorName} className="w-full h-full object-cover" />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-base font-black bg-gradient-to-br ${palette.bg} ${palette.text}`}
              >
                <span>{initials}</span>
              </div>
            )}
          </div>
          {tutor.status === 'approved' && (
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] border-2 border-white flex items-center justify-center text-white shadow-xs"
              title="Verified Mentor"
            >
              <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
            </span>
          )}
        </div>
      </div>

      {/* Top Header Row (Badges & Actions) */}
      <div className="flex items-center justify-end gap-2 min-h-[28px]">
        {tutor.status === 'approved' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Verified Mentor
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(tutor.tutor_id || tutor.id)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-purple-50/60 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-purple-100'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </div>

      {/* Tutor Information */}
      <div className="space-y-1 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-black text-base text-[#1C1938] leading-tight truncate">{tutorName}</h4>
          {hasExperience && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
              <Award className="w-3 h-3 text-amber-600" />
              {expNum === 1 ? '1 Year Experience' : `${expNum} Years Experience`}
            </span>
          )}
        </div>

        <p className="text-xs text-[#686487] font-semibold truncate flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
          <span>{tutor.course_qualification || tutor.education_level || 'Academic Mentor'}</span>
          <span>•</span>
          <span className="truncate">{tutor.institution_name || 'Karnataka'}</span>
        </p>

        {/* Classes Taught & Languages */}
        <div className="flex items-center gap-1.5 pt-0.5 text-[11px] font-medium text-slate-500 flex-wrap">
          <span className="inline-flex items-center gap-1 text-slate-700 font-bold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/80">
            <Clock className="w-3 h-3 text-[#7C3AED]" />
            {classesTaughtDisplay}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/80">
            <Globe2 className="w-3 h-3 text-emerald-600" />
            {languagesDisplay}
          </span>
        </div>
      </div>

      {/* Teaching Bio Snippet (if available) */}
      {tutor.bio_intro && (
        <p className="text-xs text-[#4A4668] line-clamp-2 leading-relaxed text-left bg-[#FAF9FE] p-3 rounded-2xl border border-[#E9E4F5] font-medium">
          "{tutor.bio_intro}"
        </p>
      )}

      {/* Subject Pills */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F1EDFB] flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {subjectLabels.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#6D28D9] font-bold text-[11px] border border-[#DDD6FE]"
            >
              {sub}
            </span>
          ))}
          {subjectLabels.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
              +{subjectLabels.length - 3} more
            </span>
          )}
        </div>

        <span className="text-[11px] font-bold text-[#7C3AED] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
          Max 4 students/batch
        </span>
      </div>

      {/* Pricing & Primary Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Monthly Fee Display (Strictly Monthly, Max ₹3,000) */}
        <div className="text-left">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
            Monthly Fee • {hoursDisplay}
          </span>
          <span className="text-base font-black text-[#7C3AED]">
            ₹{Number(feeDisplay).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-semibold text-slate-600">/ month</span>
          </span>
        </div>

        {/* Buttons: Details and Request */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(tutor)}
            className="px-3.5 py-2 rounded-full bg-purple-50/80 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onRequestTutor(tutor)}
            className="px-4.5 py-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-xs font-bold shadow-clay-button hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
