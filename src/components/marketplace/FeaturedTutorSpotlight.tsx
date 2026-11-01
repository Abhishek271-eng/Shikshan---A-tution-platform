import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS } from '../../config/options';
import { ClayAvatar } from '../common/ClayAvatar';

interface FeaturedTutorSpotlightProps {
  tutors: TutorApplication[];
  onSelectTutor: (tutor: TutorApplication) => void;
  onSeeAll: () => void;
}

export const FeaturedTutorSpotlight: React.FC<FeaturedTutorSpotlightProps> = ({
  tutors,
  onSelectTutor,
  onSeeAll,
}) => {
  if (tutors.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      {/* Header with "See all" link */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-black text-[#1C1938] tracking-tight">
            Featured Tutors on Shikshan
          </h3>
          <p className="text-[11px] text-[#686487] font-medium">
            Verified academic mentors for Classes 1–10
          </p>
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className="text-xs font-bold text-[#6D28D9] hover:underline cursor-pointer"
        >
          See all
        </button>
      </div>

      {/* Horizontal Scrollable Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {tutors.slice(0, 5).map((tutor, idx) => {
          const tutorName = tutor.tutor_profile?.name || (tutor as any).name || 'Verified Educator';
          const nameParts = tutorName.trim().split(/\s+/);
          const spotlightName =
            nameParts.length > 1
              ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
              : nameParts[0];
          const photoUrl = tutor.photo_url || tutor.tutor_profile?.photo_url || undefined;
          const fee = tutor.fee_amount || tutor.proposed_rate || 350;
          const subject = (tutor.subjects || [])[0]
            ? SCHOOL_SUBJECTS.find((s) => s.id === tutor.subjects[0])?.label.split(' ')[0]
            : 'Mathematics';

          return (
            <div
              key={tutor.id || idx}
              onClick={() => onSelectTutor(tutor)}
              className="w-48 flex-shrink-0 bg-white rounded-[28px] p-4 border border-[#E9E4F5] shadow-clay-sm hover:shadow-clay-card transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group active:scale-[0.98]"
            >
              {/* Concentric Purple Circular Arcs behind Tutor Photo */}
              <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-[#F8F7FD]">
                {/* Decorative Arcs */}
                <div className="absolute w-28 h-28 rounded-full border border-[#DDD6FE] opacity-60" />
                <div className="absolute w-20 h-20 rounded-full border-2 border-[#C4B5FD] opacity-70" />
                <div className="absolute w-14 h-14 rounded-full bg-[#EDE9FE]" />

                {/* Tutor Real Avatar / 3D Clay Initial Monogram */}
                <div className="z-10 transition-transform group-hover:scale-105">
                  <ClayAvatar
                    name={tutorName}
                    photoUrl={photoUrl}
                    size="lg"
                    isVerified={tutor.status === 'approved'}
                  />
                </div>

                {/* Verified Badge */}
                {tutor.status === 'approved' && (
                  <div className="absolute top-2 left-2 z-20 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-black text-emerald-800 flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </div>
                )}
              </div>

              {/* Tutor Info */}
              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#1C1938] truncate">{spotlightName}</h4>
                  <span className="text-xs font-black text-[#6D28D9]">₹{fee}/mo</span>
                </div>
                <p className="text-[10px] text-[#686487] font-semibold truncate">
                  📍 Karnataka Board • {subject}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
