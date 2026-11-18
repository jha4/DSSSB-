import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bookmark,
  FilterX,
  LayoutGrid,
  List,
  Plus,
  Search,
  Star,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NoteCard } from '../components/NoteCard';
import { useStudyVault } from '../context/StudyVaultContext';
import type { Note, NoteFilterState, RevisionStatus, SortOption } from '../types/note';
import { REVISION_STATUS_LABELS, REVISION_STATUS_ORDER } from '../utils/formatters';
import {
  createDefaultFilterState,
  filterAndSortNotes,
  getAllTags,
  getAvailableChapters,
  getAvailableTopics,
  hasActiveFilters,
} from '../utils/noteFilters';

export const AllNotesPage: React.FC = () => {
  const { notes, subjects, settings, toggleFavorite, deleteNote, notify } =
    useStudyVault();
  const [searchParams, setSearchParams] = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(settings.defaultViewMode);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const [filter, setFilter] = useState<NoteFilterState>(() => ({
    ...createDefaultFilterState(),
    query: searchParams.get('q') ?? '',
    subject: searchParams.get('subject') ?? '',
    chapter: searchParams.get('chapter') ?? '',
    topic: searchParams.get('topic') ?? '',
    tag: searchParams.get('tag') ?? '',
    favoritesOnly: searchParams.get('fav') === '1',
  }));

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const subject = searchParams.get('subject') ?? '';
    const chapter = searchParams.get('chapter') ?? '';
    const topic = searchParams.get('topic') ?? '';
    const tag = searchParams.get('tag') ?? '';
    const fav = searchParams.get('fav') === '1';

    setFilter((prev) => ({
      ...prev,
      query: q,
      subject,
      chapter,
      topic,
      tag,
      favoritesOnly: fav,
    }));
  }, [searchParams]);

  const syncParams = (next: NoteFilterState) => {
    const params = new URLSearchParams();
    if (next.query.trim()) params.set('q', next.query.trim());
    if (next.subject) params.set('subject', next.subject);
    if (next.chapter) params.set('chapter', next.chapter);
    if (next.topic) params.set('topic', next.topic);
    if (next.tag) params.set('tag', next.tag);
    if (next.favoritesOnly) params.set('fav', '1');
    setSearchParams(params, { replace: true });
  };

  const updateFilter = (patch: Partial<NoteFilterState>) => {
    const next: NoteFilterState = { ...filter, ...patch };
    if (patch.subject !== undefined && patch.subject !== filter.subject) {
      next.chapter = '';
      next.topic = '';
    }
    if (patch.chapter !== undefined && patch.chapter !== filter.chapter) {
      next.topic = '';
    }
    setFilter(next);
    syncParams(next);
  };

  const clearAllFilters = () => {
    const reset = {
      ...createDefaultFilterState(),
      sortBy: filter.sortBy,
    };
    setFilter(reset);
    setSearchParams({}, { replace: true });
  };

  const subjectOptions = useMemo(() => {
    const set = new Set(subjects.map((s) => s.name));
    notes.forEach((n) => {
      if (n.subject.trim()) set.add(n.subject.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subjects, notes]);

  const chapterOptions = useMemo(
    () => getAvailableChapters(notes, filter.subject),
    [notes, filter.subject]
  );

  const topicOptions = useMemo(
    () => getAvailableTopics(notes, filter.subject, filter.chapter),
    [notes, filter.subject, filter.chapter]
  );

  const tagOptions = useMemo(() => getAllTags(notes), [notes]);

  const filteredNotes = useMemo(
    () => filterAndSortNotes(notes, filter),
    [notes, filter]
  );

  const filtersActive = hasActiveFilters(filter);

  const handleDeleteRequest = (note: Note) => {
    if (settings.confirmBeforeDelete) {
      setNoteToDelete(note);
    } else {
      deleteNote(note.id);
      notify(`Deleted "${note.title}"`, 'neutral');
    }
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;
    const title = noteToDelete.title;
    deleteNote(noteToDelete.id);
    setNoteToDelete(null);
    notify(`Deleted "${title}"`, 'neutral');
  };

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
              placeholder="Search by title, Markdown content, tags, or important points..."
              aria-label="Search notes"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateFilter({ favoritesOnly: !filter.favoritesOnly })}
              aria-pressed={filter.favoritesOnly}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                filter.favoritesOnly
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Star
                className={`h-3.5 w-3.5 ${filter.favoritesOnly ? 'fill-current' : ''}`}
              />
              <span>Favorites</span>
            </button>

            <button
              type="button"
              onClick={() => updateFilter({ importantOnly: !filter.importantOnly })}
              aria-pressed={filter.importantOnly}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                filter.importantOnly
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>High-Yield</span>
            </button>

            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cascading Filter Dropdowns */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label
              htmlFor="filter-subject"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Subject
            </label>
            <select
              id="filter-subject"
              value={filter.subject}
              onChange={(e) => updateFilter({ subject: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Subjects</option>
              {subjectOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
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
              value={filter.chapter}
              onChange={(e) => updateFilter({ chapter: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Chapters</option>
              {chapterOptions.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-topic"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Topic
            </label>
            <select
              id="filter-topic"
              value={filter.topic}
              onChange={(e) => updateFilter({ topic: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Topics</option>
              {topicOptions.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
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
              htmlFor="filter-status-sort"
              className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Sort Order
            </label>
            <select
              id="filter-status-sort"
              value={filter.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as SortOption })}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="updated">Recently Updated</option>
              <option value="title_asc">Alphabetical (A–Z)</option>
              <option value="title_desc">Alphabetical (Z–A)</option>
            </select>
          </div>
        </div>

        {/* Revision status filter strip + count + clear */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateFilter({ revisionStatus: 'all' })}
              className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filter.revisionStatus === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              All Statuses
            </button>
            {REVISION_STATUS_ORDER.map((status: RevisionStatus) => (
              <button
                key={status}
                type="button"
                onClick={() => updateFilter({ revisionStatus: status })}
                className={`whitespace-nowrap shrink-0 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter.revisionStatus === status
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {REVISION_STATUS_LABELS[status]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
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
        </div>
      </section>

      {/* Results */}
      {filteredNotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {notes.length === 0 ? 'Your StudyVault is empty' : 'No matching notes found'}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-slate-600 dark:text-slate-400">
            {notes.length === 0
              ? 'Create your first exam note or import Markdown notes generated with ChatGPT.'
              : 'Try broadening your search keywords or clearing one or more active filters.'}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {filtersActive && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FilterX className="h-4 w-4" />
                <span>Clear All Filters</span>
              </button>
            )}
            <Link
              to="/notes/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Add Note</span>
            </Link>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode="grid"
              onToggleFavorite={toggleFavorite}
              onDeleteRequest={handleDeleteRequest}
              onCopied={(title) => notify(`Copied "${title}" Markdown`, 'success')}
              onExported={(title) => notify(`Exported "${title}.md"`, 'success')}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              viewMode="list"
              onToggleFavorite={toggleFavorite}
              onDeleteRequest={handleDeleteRequest}
              onCopied={(title) => notify(`Copied "${title}" Markdown`, 'success')}
              onExported={(title) => notify(`Exported "${title}.md"`, 'success')}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(noteToDelete)}
        title="Delete this note?"
        description={
          noteToDelete
            ? `"${noteToDelete.title}" will be permanently removed from localStorage. Consider exporting it as Markdown first if you need a backup.`
            : ''
        }
        confirmLabel="Delete Note"
        onConfirm={confirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};
