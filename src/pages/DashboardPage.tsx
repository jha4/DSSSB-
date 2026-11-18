import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, FolderKanban, Layers, Search } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { formatShortDate } from '../utils/formatters';
import { getStaticDashboardStats } from '../utils/noteFilters';
import { getSubjectColorMeta } from '../utils/subjectColors';

export const DashboardPage: React.FC = () => {
  const { notes, chapters } = useStudyVault();
  const [quickQuery, setQuickQuery] = useState('');
  const navigate = useNavigate();

  const stats = useMemo(() => getStaticDashboardStats(notes), [notes]);

  const recentlyAdded = useMemo(() => {
    return [...notes]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [notes]);

  const featuredChapters = useMemo(() => {
    return [...chapters]
      .sort((a, b) => b.noteCount - a.noteCount || a.name.localeCompare(b.name))
      .slice(0, 5);
  }, [chapters]);

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
            Exam Preparation Study Library
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Browse, search, and read static HTML exam notes organized by subject, chapter, and topic.
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
              placeholder="Search notes, chapters, or tags..."
              aria-label="Quick search notes"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Search
          </button>
        </form>
      </section>

      {/* Metrics Strip */}
      <section aria-label="Study library metrics overview">
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
              Static HTML study guides
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
              Derived from index
            </p>
          </Link>

          <Link
            to="/chapters"
            className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Chapters
            </p>
            <p className="tabular-nums mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.totalChapters}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Organized by subject
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
              Ready for quick revision
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
              Subjects Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a subject to explore its chapters and HTML study notes.
            </p>
          </div>
          <Link
            to="/subjects"
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span>All Subjects</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.subjectBreakdown.map((item) => {
            const meta = getSubjectColorMeta(item.slug);
            return (
              <Link
                key={item.slug}
                to={`/subjects/${item.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`} />
                      <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                        {item.name}
                      </h3>
                    </div>
                    <span className="tabular-nums shrink-0 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {item.noteCount} {item.noteCount === 1 ? 'note' : 'notes'}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums">{item.chapterCount}</span>{' '}
                    {item.chapterCount === 1 ? 'chapter' : 'chapters'}
                    <span className="mx-1.5" aria-hidden="true">
                      ·
                    </span>
                    <span className="tabular-nums">{item.topicCount}</span>{' '}
                    {item.topicCount === 1 ? 'topic' : 'topics'}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-medium text-indigo-600 dark:border-slate-800 dark:text-indigo-400">
                  <span>Browse chapters</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently Added + Browse by Chapter */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <BookOpen className="h-4 w-4 text-slate-400" />
              <span>Recently Added Notes</span>
            </h2>
            <Link
              to="/notes"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentlyAdded.map((note) => (
              <li key={note.id} className="py-3 first:pt-0 last:pb-0">
                <Link
                  to={`/notes/${note.id}`}
                  className="group flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                      {note.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      <span>{note.subject}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        /
                      </span>
                      <span>{note.chapter}</span>
                    </p>
                  </div>
                  <span className="tabular-nums shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {formatShortDate(note.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <FolderKanban className="h-4 w-4 text-slate-400" />
              <span>Active Chapters</span>
            </h2>
            <Link
              to="/chapters"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              All chapters
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {featuredChapters.map((chap) => (
              <li
                key={`${chap.subjectSlug}::${chap.slug}`}
                className="py-3 first:pt-0 last:pb-0"
              >
                <Link
                  to={`/subjects/${chap.subjectSlug}/${chap.slug}`}
                  className="group flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                      {chap.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {chap.subject}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {chap.noteCount} {chap.noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
