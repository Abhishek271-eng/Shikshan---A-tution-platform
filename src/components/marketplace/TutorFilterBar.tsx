import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES, TEACHING_LANGUAGES } from '../../config/options';
import { ClaySearchBar } from '../common/ClaySearchBar';
import { ClayChip } from '../common/ClayChip';

export interface TutorFilters {
  searchQuery: string;
  selectedSubject: string;
  selectedClass: string;
  selectedBoard: string;
  selectedLanguage: string;
  maxPrice: number;
}

interface TutorFilterBarProps {
  filters: TutorFilters;
  onChange: (filters: TutorFilters) => void;
  onReset: () => void;
  resultCount: number;
}

export const TutorFilterBar: React.FC<TutorFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  resultCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount = [
    filters.selectedClass,
    filters.selectedBoard,
    filters.selectedLanguage,
    filters.maxPrice < 5000,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.selectedSubject ||
    filters.selectedClass ||
    filters.selectedBoard ||
    filters.selectedLanguage ||
    filters.maxPrice < 5000
  );

  return (
    <div className="w-full space-y-3 text-left">
      {/* Clay Search Input Bar with Filter Toggle */}
      <ClaySearchBar
        value={filters.searchQuery}
        onChange={(query) => onChange({ ...filters, searchQuery: query })}
        placeholder="Search by tutor name, subject, or keyword..."
        onFilterClick={() => setShowAdvanced(!showAdvanced)}
        activeFilterCount={activeFilterCount}
      />

      {/* Horizontal Subject Pill Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1 select-none">
        <ClayChip
          label="All Subjects"
          isActive={!filters.selectedSubject}
          onClick={() => onChange({ ...filters, selectedSubject: '' })}
          size="sm"
        />
        {SCHOOL_SUBJECTS.map((sub) => {
          const isSelected = filters.selectedSubject === sub.id;
          return (
            <ClayChip
              key={sub.id}
              label={sub.label.split(' ')[0]}
              kannadaLabel={sub.kannadaLabel?.split(' ')[0]}
              isActive={isSelected}
              onClick={() => onChange({ ...filters, selectedSubject: isSelected ? '' : sub.id })}
              size="sm"
            />
          );
        })}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="p-5 rounded-[28px] bg-white border border-[#E5DFF8] shadow-clay space-y-4 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-[#EFEBF8] pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#7C3AED]" />
              <span className="font-black text-[#1C1938] text-sm">Filter Tutors</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-bold text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Class Level */}
            <div>
              <label htmlFor="filter-class" className="text-[11px] font-bold text-[#1C1938] block mb-1">
                Class Level
              </label>
              <select
                id="filter-class"
                value={filters.selectedClass}
                onChange={(e) => onChange({ ...filters, selectedClass: e.target.value })}
                className="w-full bg-[#FAF9FE] border border-[#E5DFF8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] rounded-xl px-3 py-2.5 text-xs font-bold text-[#1C1938] outline-none"
              >
                <option value="">All Classes (1 to 10)</option>
                {INDIVIDUAL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Teaching Language */}
            <div>
              <label htmlFor="filter-lang" className="text-[11px] font-bold text-[#1C1938] block mb-1">
                Teaching Language
              </label>
              <select
                id="filter-lang"
                value={filters.selectedLanguage}
                onChange={(e) => onChange({ ...filters, selectedLanguage: e.target.value })}
                className="w-full bg-[#FAF9FE] border border-[#E5DFF8] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#EDE9FE] rounded-xl px-3 py-2.5 text-xs font-bold text-[#1C1938] outline-none"
              >
                <option value="">Any Language</option>
                {TEACHING_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Proposed Monthly Fee */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="filter-price" className="text-[11px] font-bold text-[#1C1938]">
                  Max Monthly Fee
                </label>
                <span className="text-[11px] font-black text-[#7C3AED]">
                  ₹{filters.maxPrice}/mo
                </span>
              </div>
              <input
                id="filter-price"
                type="range"
                min="500"
                max="5000"
                step="100"
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-[#7C3AED] cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#EFEBF8]">
            <span className="text-[11px] text-[#686487] font-semibold">
              Found <strong className="text-[#1C1938] font-bold">{resultCount}</strong> approved educators matching filters
            </span>
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#EDE9FE] text-[#6D28D9] font-bold text-xs hover:bg-[#DDD6FE] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
