import React from 'react';
import { ShieldCheck, Heart, ArrowRight, Clock, Globe2, GraduationCap, Award } from 'lucide-react';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES, TEACHING_LANGUAGES } from '../../config/options';
import { ClayAvatar } from '../common/ClayAvatar';

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

  // Format classes taught (e.g. "C-6 to C-10" or "Classes 6–10")
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

  // Numerical experience check: only show if > 0 (never show "0 years")
  const expNum = tutor.teaching_experience ? parseInt(tutor.teaching_experience.toString(), 10) : 0;
  const hasExperience = !isNaN(expNum) && expNum > 0;

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-purple-100 shadow-clay hover:shadow-clay-lg transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group text-left">
      {/* Top Section: Avatar, Tutor Details, Verification Badge & Favorite Heart */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with Clay styling */}
          <ClayAvatar
            name={tutorName}
            photoUrl={tutor.photo_url || tutor.tutor_profile?.photo_url}
            size="lg"
            isVerified={tutor.status === 'approved'}
          />

          {/* Tutor Info */}
          <div className="min-w-0 space-y-1 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-black text-base text-slate-800 leading-tight truncate">
                {tutorName}
              </h4>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified
              </span>
              {hasExperience && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                  <Award className="w-3 h-3 text-amber-600" />
                  {expNum}+ yrs exp
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-semibold truncate flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0" />
              <span>{tutor.course_qualification || tutor.education_level || 'Academic Mentor'}</span>
              <span>•</span>
              <span className="truncate">{tutor.institution_name || 'Karnataka'}</span>
            </p>

            {/* Classes & Language Metadata (Real Data) */}
            <div className="flex items-center gap-2 pt-0.5 text-[11px] font-medium text-slate-500 flex-wrap">
              <span className="inline-flex items-center gap-1 text-slate-700 font-bold">
                <Clock className="w-3 h-3 text-[#7C3AED]" />
                {classesTaughtDisplay}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <Globe2 className="w-3 h-3 text-emerald-600" />
                {languagesDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(tutor.tutor_id || tutor.id)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
            isFavorite
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-purple-50/60 text-slate-400 hover:text-rose-500 hover:bg-rose-50 border border-purple-100'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>
      </div>

      {/* Teaching Bio Snippet */}
      {tutor.bio_intro && (
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed text-left bg-purple-50/40 p-3 rounded-2xl border border-purple-100/70 font-medium">
          "{tutor.bio_intro}"
        </p>
      )}

      {/* Subject Pills (Real Data) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-purple-100/70 flex-wrap">
        <div className="flex flex-wrap gap-1.5">
          {subjectLabels.slice(0, 3).map((sub, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#6D28D9] font-bold text-[11px] border border-purple-200"
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
            className="px-4 py-2.5 rounded-full bg-purple-50/80 hover:bg-purple-100 text-[#7C3AED] border border-purple-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onRequestTutor(tutor)}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white text-xs font-bold shadow-clay-button hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Request</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
