import React from 'react';
import { Star } from 'lucide-react';
import { TutorApplication } from '../../types';
import { SCHOOL_SUBJECTS } from '../../config/options';

interface FeaturedTutorSpotlightProps {
  tutors: TutorApplication[];
  onSelectTutor: (tutor: TutorApplication) => void;
  onSeeAll: () => void;
}

const SPOTLIGHT_AVATARS: string[] = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1580894732454-defbe4d04f29?auto=format&fit=crop&q=80&w=250',
];

export const FeaturedTutorSpotlight: React.FC<FeaturedTutorSpotlightProps> = ({
  tutors,
  onSelectTutor,
  onSeeAll,
}) => {
  if (tutors.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      {/* Header with "See all" link (Image 2 bottom-center) */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-base font-black text-[#1C1938] tracking-tight">
            Featured Tutors on Shikshan
          </h3>
          <p className="text-[11px] text-[#686487] font-medium">
            Top-rated verified mentors for Classes 1–10
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

      {/* Horizontal Scrollable Carousel (Image 2 bottom-center) */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {tutors.slice(0, 5).map((tutor, idx) => {
          const tutorName = tutor.tutor_profile?.name || (tutor as any).name || 'Verified Educator';
          const nameParts = tutorName.trim().split(/\s+/);
          // Format as "FirstName L." matching Image 2 reference ("Remi C.", "Marc N.")
          const spotlightName = nameParts.length > 1
            ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
            : nameParts[0];
          const avatarUrl = SPOTLIGHT_AVATARS[idx % SPOTLIGHT_AVATARS.length];
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
              {/* Concentric Purple Circular Arcs behind Tutor Photo (Image 2 bottom-center) */}
              <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-[#F8F7FD]">
                {/* Decorative Arcs */}
                <div className="absolute w-28 h-28 rounded-full border border-[#DDD6FE] opacity-60" />
                <div className="absolute w-20 h-20 rounded-full border-2 border-[#C4B5FD] opacity-70" />
                <div className="absolute w-14 h-14 rounded-full bg-[#EDE9FE]" />

                {/* Tutor Photo */}
                <img
                  src={avatarUrl}
                  alt={spotlightName}
                  className="w-20 h-20 rounded-full object-cover z-10 border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                />

                {/* Rating Badge */}
                <div className="absolute top-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-[#D97706] flex items-center gap-0.5 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-[#F59E0B]" />
                  4.9
                </div>
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
