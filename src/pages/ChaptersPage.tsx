import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { formatShortDate } from '../utils/formatters';

export const ChaptersPage: React.FC = () => {
  const { subjectSlug: routeSubjectSlug } = useParams<{ subjectSlug?: string }>();
  const { subjects, chapters } = useStudyVault();
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState(
    routeSubjectSlug ?? ''
  );
  const [query, setQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSubjectSlug(routeSubjectSlug ?? '');
  }, [routeSubjectSlug]);

  const activeSubject = useMemo(
    () =>
      routeSubjectSlug
        ? subjects.find((s) => s.slug === routeSubjectSlug)
        : undefined,
    [subjects, routeSubjectSlug]
  );

  const filteredChapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((chap) => {
      if (selectedSubjectSlug && chap.subjectSlug !== selectedSubjectSlug) {
        return false;
      }
      if (
        q &&
        !chap.name.toLowerCase().includes(q) &&
        !chap.subject.toLowerCase().includes(q) &&
        !chap.notes.some(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.topic.toLowerCase().includes(q)
        )
      ) {
        return false;
      }
      return true;
    });
  }, [chapters, selectedSubjectSlug, query]);

  if (routeSubjectSlug && !activeSubject) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Subject not found
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          No notes exist in the static index for subject "{routeSubjectSlug}".
        </p>
        <Link
          to="/subjects"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
        >
          <span>Back to Subjects</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeSubject && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <Link to="/subjects" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Subjects
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {activeSubject.name}
              </span>
            </nav>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeSubject.name} Chapters
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="tabular-nums">{activeSubject.chapterCount}</span>{' '}
              {activeSubject.chapterCount === 1 ? 'chapter' : 'chapters'}
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="tabular-nums">{activeSubject.topicCount}</span>{' '}
              {activeSubject.topicCount === 1 ? 'topic' : 'topics'}
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span className="tabular-nums">{activeSubject.noteCount}</span>{' '}
              {activeSubject.noteCount === 1 ? 'note' : 'notes'}
            </p>
          </div>
          <Link
            to={`/notes?subject=${encodeURIComponent(activeSubject.slug)}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <span>All {activeSubject.name} Notes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter chapters by name, subject, or topic..."
            aria-label="Filter chapters"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {!routeSubjectSlug && (
          <div className="sm:w-64">
            <label htmlFor="chapters-subject-filter" className="sr-only">
              Filter by subject
            </label>
            <select
              id="chapters-subject-filter"
              value={selectedSubjectSlug}
              onChange={(e) => setSelectedSubjectSlug(e.target.value)}
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
        )}
      </div>

      {filteredChapters.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No chapters match your current filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChapters.map((group) => {
            const key = `${group.subjectSlug}::${group.slug}`;
            const isExpanded = routeSubjectSlug
              ? expandedKey !== `collapsed:${key}`
              : expandedKey === key;

            const toggleExpand = () => {
              if (routeSubjectSlug) {
                setExpandedKey(isExpanded ? `collapsed:${key}` : null);
              } else {
                setExpandedKey(isExpanded ? null : key);
              }
            };

            return (
              <section
                key={key}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <button
                    type="button"
                    onClick={toggleExpand}
                    aria-expanded={isExpanded}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {group.subject}
                      </p>
                      <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {group.name}
                      </h3>
                    </div>
                  </button>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums">
                      {group.topicCount}{' '}
                      {group.topicCount === 1 ? 'topic' : 'topics'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {group.noteCount}{' '}
                      {group.noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <Link
                      to={`/subjects/${group.subjectSlug}/${group.slug}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <span>Open Chapter</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {group.notes.map((note) => (
                        <li
                          key={note.id}
                          className="flex items-center justify-between gap-4 py-2.5"
                        >
                          <div className="min-w-0">
                            <Link
                              to={`/notes/${note.id}`}
                              className="block truncate text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                            >
                              {note.title}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Topic: {note.topic}
                            </p>
                          </div>
                          <span className="tabular-nums shrink-0 text-xs text-slate-500 dark:text-slate-400">
                            {formatShortDate(note.date)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
