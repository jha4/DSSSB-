import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { formatShortDate } from '../utils/formatters';
import { getAvailableChapterOptions } from '../utils/noteFilters';

export const TopicsPage: React.FC = () => {
  const { subjectSlug: routeSubjectSlug, chapterSlug: routeChapterSlug } =
    useParams<{ subjectSlug?: string; chapterSlug?: string }>();
  const { notes, subjects, chapters } = useStudyVault();

  const [subjectSlug, setSubjectSlug] = useState(routeSubjectSlug ?? '');
  const [chapterSlug, setChapterSlug] = useState(routeChapterSlug ?? '');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setSubjectSlug(routeSubjectSlug ?? '');
    setChapterSlug(routeChapterSlug ?? '');
  }, [routeSubjectSlug, routeChapterSlug]);

  const activeChapter = useMemo(() => {
    if (!routeSubjectSlug || !routeChapterSlug) return undefined;
    return chapters.find(
      (c) =>
        c.subjectSlug === routeSubjectSlug && c.slug === routeChapterSlug
    );
  }, [chapters, routeSubjectSlug, routeChapterSlug]);

  const chapterOptions = useMemo(
    () => getAvailableChapterOptions(notes, subjectSlug),
    [notes, subjectSlug]
  );

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((note) => {
        if (subjectSlug && note.subjectSlug !== subjectSlug) return false;
        if (chapterSlug && note.chapterSlug !== chapterSlug) return false;
        if (
          q &&
          !note.topic.toLowerCase().includes(q) &&
          !note.title.toLowerCase().includes(q) &&
          !note.chapter.toLowerCase().includes(q) &&
          !note.subject.toLowerCase().includes(q) &&
          !note.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.topic.localeCompare(b.topic));
  }, [notes, subjectSlug, chapterSlug, query]);

  if (routeSubjectSlug && routeChapterSlug && !activeChapter) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Chapter not found
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          No topics exist in the static index for this subject and chapter.
        </p>
        <Link
          to="/chapters"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
        >
          <span>Browse All Chapters</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeChapter && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <Link
                to="/subjects"
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Subjects
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to={`/subjects/${activeChapter.subjectSlug}`}
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {activeChapter.subject}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {activeChapter.name}
              </span>
            </nav>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeChapter.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="tabular-nums">{activeChapter.topicCount}</span>{' '}
              {activeChapter.topicCount === 1 ? 'topic' : 'topics'}
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="tabular-nums">{activeChapter.noteCount}</span>{' '}
              {activeChapter.noteCount === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <Link
            to={`/notes?subject=${encodeURIComponent(activeChapter.subjectSlug)}&chapter=${encodeURIComponent(activeChapter.slug)}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span>Open in All Notes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {!activeChapter && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, titles, or tags..."
              aria-label="Search topics"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            aria-label="Filter topics by subject"
            value={subjectSlug}
            onChange={(e) => {
              setSubjectSlug(e.target.value);
              setChapterSlug('');
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter topics by chapter"
            value={chapterSlug}
            onChange={(e) => setChapterSlug(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">All Chapters</option>
            {chapterOptions.map((ch) => (
              <option key={ch.slug} value={ch.slug}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No topics match your selection.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <th className="px-5 py-3">Topic &amp; Note</th>
                <th className="hidden px-4 py-3 md:table-cell">Subject / Chapter</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNotes.map((note) => (
                <tr
                  key={note.id}
                  className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/notes/${note.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                    >
                      {note.topic}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {note.title}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3.5 text-xs text-slate-600 md:table-cell dark:text-slate-400">
                    <Link
                      to={`/subjects/${note.subjectSlug}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {note.subject}
                    </Link>
                    <span className="mx-1.5" aria-hidden="true">
                      /
                    </span>
                    <Link
                      to={`/subjects/${note.subjectSlug}/${note.chapterSlug}`}
                      className="hover:text-slate-900 dark:hover:text-slate-200"
                    >
                      {note.chapter}
                    </Link>
                  </td>
                  <td className="tabular-nums hidden px-4 py-3.5 text-right text-xs text-slate-500 sm:table-cell dark:text-slate-400">
                    {formatShortDate(note.date)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      to={`/notes/${note.id}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
