import React from 'react';
import { ShieldCheck, Heart, ArrowRight, Clock, Globe2, GraduationCap, Award } from 'lucide-react';
import { TutorApplication, TutorRequestStatus } from '../../types';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES, TEACHING_LANGUAGES } from '../../config/options';

interface TutorCardProps {
  tutor: TutorApplication;
  isFavorite: boolean;
  onToggleFavorite: (tutorId: string) => void;
  onViewProfile: (tutor: TutorApplication) => void;
  onRequestTutor: (tutor: TutorApplication) => void;
  existingRequestStatus?: TutorRequestStatus | null;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  isFavorite,
  onToggleFavorite,
  onViewProfile,
  onRequestTutor,
  existingRequestStatus,
}) => {
  const tutorName = tutor.tutor_profile?.name || (tutor as any).name || 'Verified Educator';
  const photoUrl = tutor.photo_url || tutor.tutor_profile?.photo_url || undefined;
  const feeDisplay = tutor.fee_amount || tutor.proposed_rate || 2500;

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
    { bg: 'from-[#DFD8F3] to-[#C7BBEA]', text: 'text-[#3128A3]' },
    { bg: 'from-[#C4C6F0] to-[#A7AAE5]', text: 'text-[#231C7A]' },
    { bg: 'from-[#D1FAE5] to-[#A7F3D0]', text: 'text-[#065F46]' },
    { bg: 'from-[#FEF3C7] to-[#FDE68A]', text: 'text-[#92400E]' },
    { bg: 'from-[#FCE7F3] to-[#FBCFE8]', text: 'text-[#9D174D]' },
  ];
  const palette = colorPalettes[hash % colorPalettes.length];

  return (
    <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-[#DFD8F3] shadow-clay hover:shadow-clay-hover transition-all flex flex-col justify-between gap-3.5 text-left group">
      {/* 1. Header: Prominent Profile Photo, Name, Verified Badge, Favorite Heart */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Prominent Profile Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-clay-sm flex items-center justify-center font-black bg-[#FAF9FE] transition-transform group-hover:scale-105">
              {photoUrl ? (
                <img src={photoUrl} alt={tutorName} className="w-full h-full object-cover" />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-base font-extrabold bg-gradient-to-br ${palette.bg} ${palette.text}`}
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

          {/* Name & Academic Credentials */}
          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-base text-[#1C1938] leading-tight truncate">
                {tutorName}
              </h4>
              {hasExperience && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  <Award className="w-3 h-3 text-amber-600" />
                  {expNum === 1 ? '1 Year Experience' : `${expNum} Years Experience`}
                </span>
              )}
            </div>

            <p className="text-xs text-[#686487] font-semibold truncate flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#4136CA] flex-shrink-0" />
              <span className="truncate">{tutor.course_qualification || tutor.education_level || 'Academic Mentor'}</span>
              <span>•</span>
              <span className="truncate">{tutor.institution_name || 'Karnataka'}</span>
            </p>
          </div>
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(tutor.tutor_id || tutor.id)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-xs ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-[#FAF9FE] text-[#686487] hover:text-rose-500 hover:bg-rose-50 border border-[#DFD8F3]'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </div>

      {/* 2. Compact Info Badges: Subjects, Classes, Languages */}
      <div className="space-y-2">
        {/* Subject Pills */}
        <div className="flex flex-wrap gap-1.5">
          {subjectLabels.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-lg bg-[#FAF9FE] text-[#4136CA] font-bold text-xs border border-[#DFD8F3]"
            >
              {sub}
            </span>
          ))}
          {subjectLabels.length > 3 && (
            <span className="px-2 py-0.5 rounded-lg bg-[#FAF9FE] text-[#686487] font-semibold text-[11px] border border-[#DFD8F3]">
              +{subjectLabels.length - 3} more
            </span>
          )}
        </div>

        {/* Classes Taught & Languages */}
        <div className="flex items-center gap-2 text-[11px] text-[#686487] font-medium flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#4136CA]" />
            <span>{classesTaughtDisplay}</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-[#10B981]" />
            <span>{languagesDisplay}</span>
          </span>
        </div>

        {/* Short Bio Snippet (if available) */}
        {tutor.bio_intro && (
          <p className="text-xs text-[#4A4668] line-clamp-2 leading-relaxed bg-[#FAF9FE] p-2.5 rounded-xl border border-[#DFD8F3] font-medium">
            &quot;{tutor.bio_intro}&quot;
          </p>
        )}
      </div>

      {/* 3. Footer: Transparent Pricing & Contained Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#DFD8F3]">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#686487] block tracking-wider">
            Monthly Fee
          </span>
          <span className="text-base font-black text-[#4136CA]">
            ₹{Number(feeDisplay).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-semibold text-[#686487]">/ month</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(tutor)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF9FE] text-[#4136CA] border border-[#DFD8F3] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onRequestTutor(tutor)}
            disabled={existingRequestStatus === 'pending' || existingRequestStatus === 'accepted'}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-clay-button ${
              existingRequestStatus === 'pending'
                ? 'bg-amber-100 text-amber-800 border border-amber-200 cursor-not-allowed opacity-90'
                : existingRequestStatus === 'accepted'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-[#4136CA] to-[#5348E0] hover:opacity-95 text-white active:scale-95 cursor-pointer'
            }`}
          >
            <span>
              {existingRequestStatus === 'pending'
                ? 'Requested'
                : existingRequestStatus === 'accepted'
                ? 'Enrolled'
                : 'Request'}
            </span>
            {!existingRequestStatus && <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
