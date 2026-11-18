import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { REVISION_STATUS_LABELS } from '../utils/formatters';

interface ChapterGroup {
  key: string;
  subject: string;
  chapter: string;
  topics: Set<string>;
  notes: ReturnType<typeof useStudyVault>['notes'];
  revisedCount: number;
}

export const ChaptersPage: React.FC = () => {
  const { notes, subjects } = useStudyVault();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [query, setQuery] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const subjectOptions = useMemo(() => {
    const set = new Set(subjects.map((s) => s.name));
    notes.forEach((n) => set.add(n.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subjects, notes]);

  const chapters = useMemo(() => {
    const map = new Map<string, ChapterGroup>();
    const q = query.trim().toLowerCase();

    for (const note of notes) {
      if (
        subjectFilter &&
        note.subject.toLowerCase() !== subjectFilter.toLowerCase()
      ) {
        continue;
      }
      const key = `${note.subject.toLowerCase()}::${note.chapter.toLowerCase()}`;
      if (
        q &&
        !note.chapter.toLowerCase().includes(q) &&
        !note.subject.toLowerCase().includes(q) &&
        !note.topic.toLowerCase().includes(q)
      ) {
        continue;
      }

      let group = map.get(key);
      if (!group) {
        group = {
          key,
          subject: note.subject,
          chapter: note.chapter,
          topics: new Set(),
          notes: [],
          revisedCount: 0,
        };
        map.set(key, group);
      }
      group.topics.add(note.topic);
      group.notes.push(note);
      if (note.revisionStatus === 'revised' || note.revisionStatus === 'mastered') {
        group.revisedCount += 1;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const subCmp = a.subject.localeCompare(b.subject);
      return subCmp !== 0 ? subCmp : a.chapter.localeCompare(b.chapter);
    });
  }, [notes, subjectFilter, query]);

  return (
    <div className="space-y-6">
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

        <div className="sm:w-64">
          <label htmlFor="chapters-subject-filter" className="sr-only">
            Filter by subject
          </label>
          <select
            id="chapters-subject-filter"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
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
      </div>

      {chapters.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No chapters match your current filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((group) => {
            const isExpanded = expandedKey === group.key;
            return (
              <section
                key={group.key}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setExpandedKey(isExpanded ? null : group.key)}
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
                      <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {group.chapter}
                      </h2>
                    </div>
                  </button>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="tabular-nums">
                      {group.topics.size} {group.topics.size === 1 ? 'topic' : 'topics'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {group.notes.length} {group.notes.length === 1 ? 'note' : 'notes'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {group.revisedCount}/{group.notes.length} revised
                    </span>
                    <Link
                      to={`/notes?subject=${encodeURIComponent(group.subject)}&chapter=${encodeURIComponent(group.chapter)}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <span>Filter Notes</span>
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
                          <span className="shrink-0 text-xs font-medium text-slate-600 dark:text-slate-400">
                            {REVISION_STATUS_LABELS[note.revisionStatus]}
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
