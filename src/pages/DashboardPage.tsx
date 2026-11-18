import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Plus,
  Search,
  Star,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { formatShortDate, REVISION_STATUS_LABELS } from '../utils/formatters';
import { getDashboardStats } from '../utils/noteFilters';
import { getSubjectColorMeta } from '../utils/subjectColors';

export const DashboardPage: React.FC = () => {
  const { notes, subjects, recentNoteIds } = useStudyVault();
  const [quickQuery, setQuickQuery] = useState('');
  const navigate = useNavigate();

  const stats = useMemo(
    () => getDashboardStats(notes, subjects),
    [notes, subjects]
  );

  const recentlyAdded = useMemo(() => {
    return [...notes]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5);
  }, [notes]);

  const recentlyViewed = useMemo(() => {
    const byId = new Map(notes.map((n) => [n.id, n]));
    return recentNoteIds
      .map((id) => byId.get(id))
      .filter((n): n is NonNullable<typeof n> => Boolean(n))
      .slice(0, 5);
  }, [notes, recentNoteIds]);

  const favoriteNotes = useMemo(() => {
    return notes.filter((n) => n.favorite).slice(0, 5);
  }, [notes]);

  const subjectLookup = useMemo(() => {
    return new Map(subjects.map((s) => [s.name.toLowerCase(), s]));
  }, [subjects]);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    if (trimmed) {
      navigate(`/notes?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/notes');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome + Quick Search */}
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Exam Preparation Knowledge Base
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Organize, search, and revise your structured Markdown exam notes offline.
          </p>
        </div>

        <form
          onSubmit={handleQuickSearch}
          className="flex w-full max-w-md items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search notes, topics, or concepts..."
              aria-label="Quick search notes"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Search
          </button>
        </form>
      </section>

      {/* Metrics Strip */}
      <section aria-label="Study metrics overview">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Link
            to="/notes"
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Notes
            </p>
            <p className="tabular-nums mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.totalNotes}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {stats.importantCount} marked high-yield
            </p>
          </Link>

          <Link
            to="/subjects"
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Subjects
            </p>
            <p className="tabular-nums mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.totalSubjects}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {stats.totalChapters} active chapters
            </p>
          </Link>

          <Link
            to="/topics"
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Topics
            </p>
            <p className="tabular-nums mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.totalTopics}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Indexed across subjects
            </p>
          </Link>

          <Link
            to="/revision"
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Revised &amp; Mastered
            </p>
            <p className="tabular-nums mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.revisedOrMasteredCount}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {stats.favoriteCount} starred favorites
            </p>
          </Link>
        </div>
      </section>

      {/* Subject-wise Notes Overview */}
      <section aria-labelledby="subject-overview-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2
              id="subject-overview-heading"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Subject-Wise Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a subject to filter notes or manage your subject list.
            </p>
          </div>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span>Manage Subjects</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {stats.subjectBreakdown.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No subjects configured yet. Add your first subject to organize exam notes.
            </p>
            <Link
              to="/subjects"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>Add Subject</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stats.subjectBreakdown.map((item) => {
              const meta = getSubjectColorMeta(
                subjectLookup.get(item.name.toLowerCase())?.color
              );
              const pct =
                item.noteCount > 0
                  ? Math.round((item.revisedOrMasteredCount / item.noteCount) * 100)
                  : 0;

              return (
                <Link
                  key={item.name}
                  to={`/notes?subject=${encodeURIComponent(item.name)}`}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                        {item.name}
                      </h3>
                      <span className="tabular-nums shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.noteCount} {item.noteCount === 1 ? 'note' : 'notes'}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="tabular-nums">{item.chapterCount}</span>{' '}
                      {item.chapterCount === 1 ? 'chapter' : 'chapters'}
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="tabular-nums">{item.topicCount}</span>{' '}
                      {item.topicCount === 1 ? 'topic' : 'topics'}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Revision progress</span>
                      <span className="tabular-nums font-medium">{pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${meta.barClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent & Favorite Lists */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recently Added */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recently Added
            </h2>
            <Link
              to="/notes"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          {recentlyAdded.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No notes added yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentlyAdded.map((note) => (
                <li key={note.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/notes/${note.id}`}
                    className="block rounded-lg py-0.5 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {note.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      <span>{note.subject}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span className="tabular-nums">
                        {formatShortDate(note.createdAt)}
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recently Viewed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Recently Viewed</span>
            </h2>
            <Link
              to="/recent"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              History
            </Link>
          </div>
          {recentlyViewed.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Open any note to track your reading history.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentlyViewed.map((note) => (
                <li key={note.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/notes/${note.id}`}
                    className="block rounded-lg py-0.5 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {note.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      <span>{note.subject}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span>{REVISION_STATUS_LABELS[note.revisionStatus]}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Favorite Notes */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Favorite Notes</span>
            </h2>
            <Link
              to="/favorites"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          {favoriteNotes.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Star high-value notes for fast access before exams.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {favoriteNotes.map((note) => (
                <li key={note.id} className="py-2.5 first:pt-0 last:pb-0">
                  <Link
                    to={`/notes/${note.id}`}
                    className="block rounded-lg py-0.5 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {note.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      <span>{note.subject}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        /
                      </span>
                      <span>{note.topic}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};
