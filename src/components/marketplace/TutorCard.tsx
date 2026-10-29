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
    <ClayCard className="p-5 text-left border border-slate-200/90 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 shadow-md bg-white">
      {/* Top Header: Avatar, Name, Verification, Favorite */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-md flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-base text-slate-900 leading-snug truncate">
                {tutorName}
              </h4>
              {tutor.status === 'approved' && (
                <span
                  title="Verified by Shikshan team"
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
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
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
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
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          {subjectLabels.map((sub, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 text-[11px] font-semibold flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-blue-600" />
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
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {tutor.hours_per_day} hr/day
          </span>
        </div>
      </div>

      {/* Bottom Bar: Fee & Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Proposed Fee</span>
          <div className="flex items-baseline gap-0.5 font-extrabold text-slate-900 text-base">
            <span className="text-sm">₹</span>
            <span>{feeDisplay}</span>
            <span className="text-xs font-normal text-slate-500">{feeUnitLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewProfile(tutor)}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
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
