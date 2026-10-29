import React from 'react';
import {
  BookOpen,
  Languages,
  Clock,
  Heart,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { ClayCard } from '../common/ClayCard';
import { ClayButton } from '../common/ClayButton';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS, FEE_UNITS } from '../../config/options';

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
  const tutorName = tutor.tutor_profile?.name || 'Verified Educator';
  const feeUnitLabel = FEE_UNITS.find((u) => u.id === tutor.fee_unit)?.shortLabel || '/mo';
  const feeDisplay = tutor.fee_amount || tutor.proposed_rate || 300;

  // Initials for avatar
  const initials = tutorName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TR';

  // Format subjects
  const subjectLabels = tutor.subjects
    .map((s) => SCHOOL_SUBJECTS.find((sub) => sub.id === s)?.label.split(' ')[0] || s)
    .slice(0, 3);

  return (
    <ClayCard className="p-5 text-left border border-[#DFD8F3] hover:border-[#A7AAE5] transition-all flex flex-col justify-between space-y-4 shadow-clay-card bg-white">
      {/* Top Header: Avatar, Name, Verification, Favorite */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4136CA] to-[#A7AAE5] text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-base text-[#1C1938] leading-snug truncate">
                {tutorName}
              </h4>
              {tutor.status === 'approved' && (
                <span
                  title="Verified by Shikshan team"
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#EBF3E8] text-[#3B522F] border border-[#3B522F]/20 text-[10px] font-bold"
                >
                  <ShieldCheck className="w-3 h-3 text-[#3B522F]" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {tutor.course_qualification || tutor.education_level}
            </p>
          </div>
        </div>

        {/* Favorite Shortlist Button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(tutor.tutor_id)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isFavorite
              ? 'bg-[#DFD8F3] text-rose-600 border border-rose-200'
              : 'text-slate-400 hover:text-rose-500 hover:bg-[#F4F1FA]'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Bio / Teaching Approach Snippet */}
      {tutor.bio_intro && (
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {tutor.bio_intro}
        </p>
      )}

      {/* Badges: Subjects & Languages */}
      <div className="space-y-2 pt-1 border-t border-[#DFD8F3]/60">
        <div className="flex items-center gap-1.5 flex-wrap">
          {subjectLabels.map((sub, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-[#F4F1FA] text-[#4136CA] border border-[#DFD8F3] text-[11px] font-semibold flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-[#4136CA]" />
              {sub}
            </span>
          ))}
          {tutor.subjects.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400">
              +{tutor.subjects.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1 truncate max-w-[180px]">
            <Languages className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{tutor.teaching_languages.join(', ')}</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-[#1C1938]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {tutor.hours_per_day} hr/day
          </span>
        </div>
      </div>

      {/* Bottom Bar: Fee & Action Buttons */}
      <div className="pt-2 border-t border-[#DFD8F3]/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Proposed Fee</span>
          <div className="flex items-baseline gap-0.5 font-extrabold text-[#4136CA] text-base">
            <span className="text-sm">₹</span>
            <span>{feeDisplay}</span>
            <span className="text-xs font-normal text-slate-500">{feeUnitLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(tutor)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#1C1938] hover:bg-[#F4F1FA] transition-colors"
          >
            Details
          </button>
          <ClayButton
            type="button"
            size="sm"
            variant="primary"
            onClick={() => onRequestTutor(tutor)}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Request
          </ClayButton>
        </div>
      </div>
    </ClayCard>
  );
};
