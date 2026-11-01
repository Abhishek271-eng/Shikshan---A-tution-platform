import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface ClaySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  activeFilterCount?: number;
  className?: string;
  autoFocus?: boolean;
}

export const ClaySearchBar: React.FC<ClaySearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by tutor name, subject or topic...',
  onFilterClick,
  activeFilterCount = 0,
  className = '',
  autoFocus = false,
}) => {
  return (
    <div
      className={`relative flex items-center w-full rounded-2xl bg-white border border-[#E4DDF7] shadow-clay-sm transition-all focus-within:border-[#7C3AED] focus-within:ring-2 focus-within:ring-[#EDE9FE] ${className}`}
    >
      {/* Search Icon Container */}
      <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-[#7C3AED]">
        <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center">
          <Search className="w-4 h-4 text-[#7C3AED]" />
        </div>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 min-w-0 bg-transparent py-3 pr-2 text-xs sm:text-sm font-semibold text-[#1C1938] placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none"
      />

      {/* Clear Button (when text entered) */}
      {value.trim().length > 0 && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search query"
          className="p-1.5 mr-1 text-[#9CA3AF] hover:text-[#1C1938] hover:bg-[#F5F3FF] rounded-full transition-colors active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Optional Filter Bottom Sheet Trigger Button */}
      {onFilterClick && (
        <button
          type="button"
          onClick={onFilterClick}
          aria-label="Open filter options"
          className={`mr-2 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 border ${
            activeFilterCount > 0
              ? 'bg-[#7C3AED] text-white border-[#6D28D9] shadow-button-primary'
              : 'bg-[#F7F5FC] text-[#4A4668] hover:bg-[#EDE9FE] hover:text-[#6D28D9] border-[#E4DDF7]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-[#7C3AED] text-[10px] font-black flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};
