import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { SCHOOL_SUBJECTS, INDIVIDUAL_CLASSES, EDUCATION_BOARDS, TEACHING_LANGUAGES } from '../../config/options';

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
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by tutor name, subject, or keyword..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="clay-input pl-10 pr-9 text-xs sm:text-sm"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`h-12 px-3.5 rounded-2xl border font-bold text-xs flex items-center gap-1.5 transition-all select-none ${
            showAdvanced || hasActiveFilters
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          )}
        </button>
      </div>

      {/* Advanced Filter Drawer / Controls */}
      {showAdvanced && (
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-md space-y-3 animate-fade-in text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Subject Filter */}
            <div>
              <label htmlFor="filter-subject" className="text-[11px] font-bold text-slate-600 block mb-1">
                Subject
              </label>
              <select
                id="filter-subject"
                value={filters.selectedSubject}
                onChange={(e) => onChange({ ...filters, selectedSubject: e.target.value })}
                className="clay-input py-2 text-xs"
              >
                <option value="">All Subjects</option>
                {SCHOOL_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Level */}
            <div>
              <label htmlFor="filter-class" className="text-[11px] font-bold text-slate-600 block mb-1">
                Class Level
              </label>
              <select
                id="filter-class"
                value={filters.selectedClass}
                onChange={(e) => onChange({ ...filters, selectedClass: e.target.value })}
                className="clay-input py-2 text-xs"
              >
                <option value="">All Classes (1–10)</option>
                {INDIVIDUAL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Board */}
            <div>
              <label htmlFor="filter-board" className="text-[11px] font-bold text-slate-600 block mb-1">
                Curriculum / Board
              </label>
              <select
                id="filter-board"
                value={filters.selectedBoard}
                onChange={(e) => onChange({ ...filters, selectedBoard: e.target.value })}
                className="clay-input py-2 text-xs"
              >
                <option value="">All Boards</option>
                {EDUCATION_BOARDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Teaching Language */}
            <div>
              <label htmlFor="filter-lang" className="text-[11px] font-bold text-slate-600 block mb-1">
                Teaching Language
              </label>
              <select
                id="filter-lang"
                value={filters.selectedLanguage}
                onChange={(e) => onChange({ ...filters, selectedLanguage: e.target.value })}
                className="clay-input py-2 text-xs"
              >
                <option value="">All Languages</option>
                {TEACHING_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">
              Showing <strong>{resultCount}</strong> matching verified tutors
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Result Count Strip when filter box is collapsed */}
      {!showAdvanced && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500">
          <span>
            Found <strong>{resultCount}</strong> approved tutors
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};
