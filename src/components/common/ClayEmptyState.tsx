import React from 'react';
import { Sparkles, RotateCcw, Compass, FilterX } from 'lucide-react';
import { ClayEmptyStateIllustration } from './Clay3DIllustrations';
import { ClayButton } from './ClayButton';

interface ClayEmptyStateProps {
  title?: string;
  subtitle?: string;
  onExploreAll?: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export const ClayEmptyState: React.FC<ClayEmptyStateProps> = ({
  title = 'Your learning partner is on the way!',
  subtitle = 'Explore other subjects or check back soon as more mentors join Shikshan.',
  onExploreAll,
  onClearFilters,
  onRefresh,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[32px] p-6 sm:p-8 bg-gradient-to-b from-[#FFFFFF] to-[#FAF8FF] border border-[#E5DFF8] shadow-clay text-center space-y-4 max-w-md mx-auto my-6 animate-fade-in ${className}`}
    >
      {/* 3D Clay Illustration */}
      <div className="flex justify-center">
        <ClayEmptyStateIllustration size={130} />
      </div>

      {/* Headings */}
      <div className="space-y-1.5 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6D28D9] text-[11px] font-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mentors Joining Regularly</span>
        </div>

        <h3 className="text-lg sm:text-xl font-black text-[#1C1938] tracking-tight">
          {title}
        </h3>

        <p className="text-xs text-[#686487] leading-relaxed max-w-sm mx-auto">
          {subtitle}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        {onExploreAll && (
          <ClayButton
            variant="primary"
            size="sm"
            onClick={onExploreAll}
            icon={<Compass className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Explore All Subjects
          </ClayButton>
        )}

        {onClearFilters && (
          <ClayButton
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
            icon={<FilterX className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </ClayButton>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-2 text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] hover:bg-[#EDE9FE] rounded-xl transition-colors flex items-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
};
