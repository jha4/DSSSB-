import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterX, LayoutGrid, List, Search } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { useStudyVault } from '../context/StudyVaultContext';
import type { NoteFilterState, SortOption } from '../types/note';
import {
  createDefaultFilterState,
  filterAndSortNotes,
  getAllTags,
  getAvailableChapterOptions,
  hasActiveFilters,
} from '../utils/noteFilters';

export const AllNotesPage: React.FC = () => {
  const { notes, subjects, defaultViewMode, setDefaultViewMode } = useStudyVault();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filter, setFilter] = useState<NoteFilterState>(() => ({
    ...createDefaultFilterState(),
    query: searchParams.get('q') ?? '',
    subjectSlug: searchParams.get('subject') ?? '',
    chapterSlug: searchParams.get('chapter') ?? '',
    tag: searchParams.get('tag') ?? '',
  }));

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const subjectSlug = searchParams.get('subject') ?? '';
    const chapterSlug = searchParams.get('chapter') ?? '';
    const tag = searchParams.get('tag') ?? '';

    setFilter((prev) => ({
      ...prev,
      query: q,
      subjectSlug,
      chapterSlug,
      tag,
    }));
  }, [searchParams]);

  const syncParams = (next: NoteFilterState) => {
    const params = new URLSearchParams();
    if (next.query.trim()) params.set('q', next.query.trim());
    if (next.subjectSlug) params.set('subject', next.subjectSlug);
    if (next.chapterSlug) params.set('chapter', next.chapterSlug);
    if (next.tag) params.set('tag', next.tag);
    setSearchParams(params, { replace: true });
  };

  const updateFilter = (patch: Partial<NoteFilterState>) => {
    const next: NoteFilterState = { ...filter, ...patch };
    if (
      patch.subjectSlug !== undefined &&
      patch.subjectSlug !== filter.subjectSlug
    ) {
      next.chapterSlug = '';
    }
    setFilter(next);
    syncParams(next);
  };

  const clearAllFilters = () => {
    const reset: NoteFilterState = {
      ...createDefaultFilterState(),
      sortBy: filter.sortBy,
    };
    setFilter(reset);
    setSearchParams({}, { replace: true });
  };

  const chapterOptions = useMemo(
    () => getAvailableChapterOptions(notes, filter.subjectSlug),
    [notes, filter.subjectSlug]
  );

  const tagOptions = useMemo(() => getAllTags(notes), [notes]);

  const filteredNotes = useMemo(
    () => filterAndSortNotes(notes, filter),
    [notes, filter]
  );

  const filtersActive = hasActiveFilters(filter);

  return (
    <div className="space-y-6">
      {/* Search & Filter Panel */}
      <section
        aria-label="Search and filter notes"
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filter.query}
              onChange={(e) => updateFilter({ query: e.target.value })}
              placeholder="Search by title, subject, chapter, topic, summary, or tags..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setDefaultViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={defaultViewMode === 'grid'}
                className={`rounded-md p-1.5 transition-colors ${
                  defaultViewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDefaultViewMode('list')}
                aria-label="List view"
                aria-pressed={defaultViewMode === 'list'}
                className={`rounded-md p-1.5 transition-colors ${
                  defaultViewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="filter-subject"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Subject
            </label>
            <select
              id="filter-subject"
              value={filter.subjectSlug}
              onChange={(e) => updateFilter({ subjectSlug: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.slug} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-chapter"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Chapter
            </label>
            <select
              id="filter-chapter"
              value={filter.chapterSlug}
              onChange={(e) => updateFilter({ chapterSlug: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Chapters</option>
              {chapterOptions.map((ch) => (
                <option key={ch.slug} value={ch.slug}>
                  {ch.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-tag"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Tag
            </label>
            <select
              id="filter-tag"
              value={filter.tag}
              onChange={(e) => updateFilter({ tag: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Tags</option>
              {tagOptions.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-sort"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Sort Order
            </label>
            <select
              id="filter-sort"
              value={filter.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as SortOption })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Alphabetical (A–Z)</option>
              <option value="title_desc">Alphabetical (Z–A)</option>
            </select>
          </div>
        </div>

        {/* Count & Clear bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">
            Showing {filteredNotes.length} of {notes.length}{' '}
            {notes.length === 1 ? 'note' : 'notes'}
          </span>

          {filtersActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FilterX className="h-3.5 w-3.5" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            No matching notes found
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Try broadening your search keywords or clearing active filters.
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <FilterX className="h-4 w-4" />
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
      ) : defaultViewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};
