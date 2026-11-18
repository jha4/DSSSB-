import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  FileCode2,
  FolderKanban,
  Layers,
  Search,
} from 'lucide-react';
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
    <div className="space-y-5">
      {/* Top Welcome + Quick Search */}
      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
            Exam Preparation Study Library
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            Browse, search, and read static HTML exam notes organized by subject, chapter, and topic.
          </p>
        </div>

        <form
          onSubmit={handleQuickSearch}
          className="flex w-full items-center gap-2 sm:max-w-sm"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Search notes, chapters, tags..."
              aria-label="Quick search notes"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none sm:text-[13px] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400"
            />
          </div>
          <button
            type="submit"
            className="whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Search
          </button>
        </form>
      </section>

      {/* Metrics Strip */}
      <section aria-label="Study library metrics overview">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link
            to="/notes"
            className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Notes
            </p>
            <p className="tabular-nums mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {stats.totalNotes}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              HTML study guides
            </p>
          </Link>

          <Link
            to="/subjects"
            className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Subjects
            </p>
            <p className="tabular-nums mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {stats.totalSubjects}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Derived from index
            </p>
          </Link>

          <Link
            to="/chapters"
            className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Chapters
            </p>
            <p className="tabular-nums mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {stats.totalChapters}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Organized by subject
            </p>
          </Link>

          <Link
            to="/topics"
            className="rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
          >
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total Topics
            </p>
            <p className="tabular-nums mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              {stats.totalTopics}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Ready for revision
            </p>
          </Link>
        </div>
      </section>

      {notes.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <FileCode2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Your StudyVault is ready for your first note
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Add semantic HTML note fragments inside{' '}
                <code className="break-all rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  public/notes/&lt;subject&gt;/&lt;chapter&gt;/&lt;topic&gt;.html
                </code>{' '}
                and register each entry in{' '}
                <code className="break-all rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  src/data/notes-index.json
                </code>
                . Subjects, chapters, and topics will populate automatically.
              </p>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
{`[
  {
    "id": "linear-equations",
    "title": "Linear Equations",
    "subject": "Mathematics",
    "subjectSlug": "mathematics",
    "chapter": "Algebra",
    "chapterSlug": "algebra",
    "topic": "Linear Equations",
    "tags": ["algebra", "math"],
    "date": "2026-11-18",
    "summary": "Standard forms and consistency conditions.",
    "file": "notes/mathematics/algebra/linear-equations.html"
  }
]`}
              </pre>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Subject-wise Notes Overview */}
          <section aria-labelledby="subject-overview-heading">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="subject-overview-heading"
                  className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white"
                >
                  Subjects Overview
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tap a subject to explore chapters and HTML study notes.
                </p>
              </div>
              <Link
                to="/subjects"
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <span>All Subjects</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.subjectBreakdown.map((item) => {
                const meta = getSubjectColorMeta(item.slug);
                return (
                  <Link
                    key={item.slug}
                    to={`/subjects/${item.slug}`}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 sm:p-4 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${meta.dotClass}`}
                          />
                          <h3 className="truncate text-[13px] font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                            {item.name}
                          </h3>
                        </div>
                        <span className="tabular-nums shrink-0 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {item.noteCount} {item.noteCount === 1 ? 'note' : 'notes'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="tabular-nums">{item.chapterCount}</span>{' '}
                        {item.chapterCount === 1 ? 'chapter' : 'chapters'}
                        <span className="mx-1" aria-hidden="true">
                          ·
                        </span>
                        <span className="tabular-nums">{item.topicCount}</span>{' '}
                        {item.topicCount === 1 ? 'topic' : 'topics'}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-medium text-indigo-600 dark:border-slate-800 dark:text-indigo-400">
                      <span>Browse chapters</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Recently Added + Active Chapters */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  <span>Recently Added Notes</span>
                </h2>
                <Link
                  to="/notes"
                  className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentlyAdded.map((note) => (
                  <li key={note.id} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      to={`/notes/${note.id}`}
                      className="group flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                          {note.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{note.subject}</span>
                          <span className="mx-1" aria-hidden="true">
                            /
                          </span>
                          <span>{note.chapter}</span>
                        </p>
                      </div>
                      <span className="tabular-nums shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                        {formatShortDate(note.date)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 sm:text-sm dark:text-white">
                  <FolderKanban className="h-3.5 w-3.5 text-slate-400" />
                  <span>Active Chapters</span>
                </h2>
                <Link
                  to="/chapters"
                  className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  All chapters
                </Link>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {featuredChapters.map((chap) => (
                  <li
                    key={`${chap.subjectSlug}::${chap.slug}`}
                    className="py-2.5 first:pt-0 last:pb-0"
                  >
                    <Link
                      to={`/subjects/${chap.subjectSlug}/${chap.slug}`}
                      className="group flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400">
                          {chap.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                          {chap.subject}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                          {chap.noteCount} {chap.noteCount === 1 ? 'note' : 'notes'}
                        </span>
                        <Layers className="h-3 w-3 text-slate-400" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
