import React, { useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Heart,
  Send,
  Phone,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS, WEEKDAYS } from '../../config/options';
import { useNavigation } from '../../context/NavigationContext';

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
  const { registerBackHandler } = useNavigation();

  // Android hardware back button closes this modal first
  useEffect(() => {
    if (isOpen) {
      return registerBackHandler(() => {
        onClose();
        return true;
      });
    }
  }, [isOpen, registerBackHandler, onClose]);

  if (!isOpen || !tutor) return null;

  const tutorName = tutor.tutor_profile?.name || (tutor as any).name || 'Verified Educator';
  const feeDisplay = tutor.fee_amount || tutor.proposed_rate || 3000;
  const hoursDisplay = tutor.hours_per_day
    ? tutor.hours_per_day === 5
      ? '5+ hrs/day'
      : `${tutor.hours_per_day} hrs/day`
    : '2 hrs/day';

  const initials =
    tutorName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'TR';

  // Real numerical experience check
  const expNum = tutor.teaching_experience ? parseInt(tutor.teaching_experience.toString(), 10) : 0;
  const hasExperience = !isNaN(expNum) && expNum > 0;

  const photoUrl = tutor.photo_url || tutor.tutor_profile?.photo_url;
  const phone = tutor.tutor_profile?.phone || (tutor as any).phone;
  const isPhoneRevealed = Boolean(tutor.is_phone_revealed && phone);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Tutor Profile Details"
    >
      <div className="w-full max-w-lg bg-white rounded-[36px] shadow-2xl border border-purple-100 overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Top Decorative Ambient Banner (Narrow, clean, no overlapping text) */}
        <div className="relative h-28 sm:h-32 w-full bg-gradient-to-r from-[#2E1065] via-[#4338CA] to-[#7C3AED] flex items-center justify-between px-6 overflow-hidden">
          {/* Subtle starry backdrop */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="flex items-center gap-1.5 text-white/80 z-10">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold tracking-wide uppercase text-purple-100">
              Verified Academic Mentor
            </span>
          </div>

          {/* Close Button at Top Right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Profile Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-left">
          {/* Circular Portrait with Action Buttons (Zero overlap over text) */}
          <div className="flex items-center justify-center gap-5 -mt-14 sm:-mt-16 relative z-20">
            {/* Quick Action: Inquire */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestTutor(tutor);
              }}
              title="Request Mentor"
              className="w-11 h-11 rounded-full bg-purple-50 text-[#7C3AED] border-2 border-white shadow-md flex items-center justify-center hover:bg-purple-100 active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>

            {/* Completely Unobstructed Profile Photo */}
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={tutorName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl bg-purple-50"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#4338CA] to-[#7C3AED] text-white flex items-center justify-center font-black text-2xl border-4 border-white shadow-xl ${
                  photoUrl ? '-z-10 absolute inset-0' : ''
                }`}
              >
                {initials}
              </div>
              {/* Online verified dot */}
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
            </div>

            {/* Quick Action: Favorite */}
            <button
              type="button"
              onClick={() => onToggleFavorite(tutor.tutor_id || tutor.id)}
              title="Favorite Tutor"
              className={`w-11 h-11 rounded-full border-2 border-white shadow-md flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-purple-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-600 text-rose-600' : ''}`} />
            </button>
          </div>

          {/* Centered Name, Credentials & Verification Badge */}
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              {tutorName}
            </h2>

            {/* Narrow, Repositioned Verification Strip (Does not overlap photo) */}
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Shikshan Verified Educator</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 font-semibold flex items-center justify-center gap-1.5 pt-0.5">
              <GraduationCap className="w-4 h-4 text-[#7C3AED]" />
              <span>{tutor.course_qualification || tutor.education_level || 'Academic Mentor'}</span>
              <span>•</span>
              <span>{tutor.institution_name || 'Karnataka'}</span>
            </p>
          </div>

          {/* 4-Metric Real Information Grid */}
          <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-purple-50/60 border border-purple-100/80 text-center shadow-clay-sm">
            {/* Monthly Fee */}
            <div className="space-y-0.5">
              <span className="text-sm font-black text-[#7C3AED]">₹{feeDisplay}</span>
              <span className="text-[10px] text-slate-500 font-bold block">/ Month</span>
            </div>

            {/* Daily Commitment */}
            <div className="space-y-0.5 border-l border-purple-200/60">
              <span className="text-sm font-black text-slate-800">{hoursDisplay}</span>
              <span className="text-[10px] text-slate-500 font-bold block">Commitment</span>
            </div>

            {/* Experience (Shown only if > 0) */}
            <div className="space-y-0.5 border-l border-purple-200/60">
              <span className="text-sm font-black text-slate-800">
                {hasExperience ? `${expNum}+ Yrs` : 'Fresher'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block">
                {hasExperience ? 'Experience' : 'Educator'}
              </span>
            </div>

            {/* Status */}
            <div className="space-y-0.5 border-l border-purple-200/60">
              <span className="text-sm font-black text-emerald-600">Active</span>
              <span className="text-[10px] text-slate-500 font-bold block">Status</span>
            </div>
          </div>

          {/* Private Phone Number Section (Revealed ONLY after acceptance) */}
          <div className="p-3.5 rounded-2xl border bg-slate-50 border-slate-200/80 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-bold text-slate-700">Contact Number</span>
              </div>
              {isPhoneRevealed ? (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call {phone}</span>
                </a>
              ) : (
                <span className="text-[11px] font-semibold text-slate-500 italic">
                  Protected (revealed upon acceptance)
                </span>
              )}
            </div>
          </div>

          {/* Bio / Teaching Philosophy */}
          {tutor.bio_intro && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Teaching Approach & Bio
              </h4>
              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 text-xs text-slate-700 leading-relaxed font-medium">
                "{tutor.bio_intro}"
              </div>
            </div>
          )}

          {/* Subjects & Classes */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Subjects & Classes
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(tutor.subjects || []).map((sub, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-xs font-bold border border-purple-200"
                >
                  {SCHOOL_SUBJECTS.find((s) => s.id === sub)?.label || sub}
                </span>
              ))}
              {(tutor.class_levels || []).map((cls, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200"
                >
                  {cls.replace('_', ' ').toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Available Days */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
              <span>Teaching Schedule</span>
              <span className="text-[10px] text-slate-500 font-medium lowercase">4 students max per batch</span>
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => {
                const isAvail = (tutor.available_days || []).includes(day.id);
                return (
                  <div
                    key={day.id}
                    className={`py-2 px-1 rounded-xl text-center text-[10px] font-bold border ${
                      isAvail
                        ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}
                  >
                    {day.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action CTA */}
        <div className="p-4 sm:p-5 border-t border-purple-100 bg-white flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">
              Monthly Fee (Max ₹3,000)
            </span>
            <span className="text-lg font-black text-[#7C3AED]">
              ₹{Number(feeDisplay).toLocaleString('en-IN')}{' '}
              <span className="text-xs font-semibold text-slate-600">/ month</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestTutor(tutor);
            }}
            className="py-3 px-6 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white font-black text-xs sm:text-sm shadow-clay-button hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Request This Tutor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
