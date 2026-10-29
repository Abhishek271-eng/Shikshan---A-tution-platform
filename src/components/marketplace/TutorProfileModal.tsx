import React from 'react';
import {
  X,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Languages,
  Clock,
  IndianRupee,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { ClayButton } from '../common/ClayButton';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS, FEE_UNITS, EDUCATION_BOARDS } from '../../config/options';

interface TutorProfileModalProps {
  tutor: TutorApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestTutor: (tutor: TutorApplication) => void;
  isFavorite: boolean;
  onToggleFavorite: (tutorId: string) => void;
}

export const TutorProfileModal: React.FC<TutorProfileModalProps> = ({
  tutor,
  isOpen,
  onClose,
  onRequestTutor,
  isFavorite,
  onToggleFavorite,
}) => {
  if (!isOpen || !tutor) return null;

  const tutorName = tutor.tutor_profile?.name || 'Verified Educator';
  const feeUnitLabel = FEE_UNITS.find((u) => u.id === tutor.fee_unit)?.label || 'Per Month';
  const feeDisplay = tutor.fee_amount || tutor.proposed_rate || 300;

  const initials = tutorName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'TR';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#DFD8F3] overflow-hidden flex flex-col max-h-[90vh] animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Tutor Profile Details"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#DFD8F3] flex items-center justify-between bg-[#F4F1FA]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4136CA] to-[#A7AAE5] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-[#1C1938] leading-tight">
                  {tutorName}
                </h3>
                {tutor.status === 'approved' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF3E8] text-[#3B522F] border border-[#3B522F]/20 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#3B522F]" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {tutor.course_qualification || tutor.education_level}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(tutor.tutor_id)}
              className={`p-2 rounded-xl transition-colors ${
                isFavorite ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:bg-[#DFD8F3]/50'
              }`}
              aria-label="Favorite tutor"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-[#1C1938] hover:bg-[#DFD8F3]/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-left text-xs text-[#1C1938]">
          {/* Bio & Teaching Approach */}
          {tutor.bio_intro && (
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                Teaching Approach & Bio
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-[#F4F1FA] p-3.5 rounded-2xl border border-[#DFD8F3]">
                {tutor.bio_intro}
              </p>
            </div>
          )}

          {/* Academic Qualifications */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Qualifications & Institution
            </h4>
            <div className="p-3.5 rounded-2xl bg-white border border-[#DFD8F3] space-y-1.5">
              <div className="flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-[#4136CA] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1C1938]">{tutor.education_level}</p>
                  {tutor.course_qualification && (
                    <p className="text-slate-600">{tutor.course_qualification}</p>
                  )}
                  {tutor.institution_name && (
                    <p className="text-slate-500 text-[11px]">{tutor.institution_name}</p>
                  )}
                </div>
              </div>

              {tutor.teaching_experience && (
                <div className="pt-2 border-t border-[#DFD8F3] text-slate-600">
                  <strong>Teaching Experience:</strong> {tutor.teaching_experience}
                </div>
              )}
            </div>
          </div>

          {/* Subjects and Classes */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
              Subjects & Classes Supported
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tutor.subjects.map((subId) => {
                const subObj = SCHOOL_SUBJECTS.find((s) => s.id === subId);
                return (
                  <span
                    key={subId}
                    className="px-3 py-1.5 rounded-xl bg-[#F4F1FA] border border-[#DFD8F3] text-[#4136CA] font-semibold text-xs flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#4136CA]" />
                    <span>{subObj?.label || subId}</span>
                  </span>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              <strong>Classes:</strong>{' '}
              {tutor.class_levels.map((c) => c.replace('class_', 'Class ')).join(', ')}
            </p>

            {tutor.board_familiarity && tutor.board_familiarity.length > 0 && (
              <p className="text-[11px] text-slate-500">
                <strong>Curriculum Familiarity:</strong>{' '}
                {tutor.board_familiarity
                  .map((b) => EDUCATION_BOARDS.find((board) => board.id === b)?.label || b)
                  .join(', ')}
              </p>
            )}
          </div>

          {/* Languages & Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-white border border-[#DFD8F3] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Languages className="w-3 h-3 text-[#4136CA]" /> Teaching Languages
              </span>
              <p className="font-bold text-[#1C1938]">
                {tutor.teaching_languages.join(', ')}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-[#DFD8F3] space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#4136CA]" /> Daily Availability
              </span>
              <p className="font-bold text-[#1C1938]">
                {tutor.hours_per_day} hrs/day ({tutor.available_days.map((d) => d.toUpperCase()).join(', ')})
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Fee and Request Action */}
        <div className="p-5 border-t border-[#DFD8F3] bg-[#F4F1FA] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Proposed Fee</span>
            <div className="flex items-baseline gap-1 font-extrabold text-[#4136CA] text-lg">
              <IndianRupee className="w-4 h-4 self-center text-[#4136CA]" />
              <span>{feeDisplay}</span>
              <span className="text-xs font-normal text-slate-500">/ {feeUnitLabel}</span>
            </div>
          </div>

          <ClayButton
            type="button"
            variant="primary"
            onClick={() => {
              onClose();
              onRequestTutor(tutor);
            }}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Request This Tutor
          </ClayButton>
        </div>
      </div>
    </div>
  );
};
