import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { getAvailableChapters } from '../utils/noteFilters';

interface TopicGroup {
  key: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopics: string[];
  noteIds: string[];
  firstNoteTitle: string;
  revisedCount: number;
}

export const TopicsPage: React.FC = () => {
  const { notes, subjects } = useStudyVault();
  const [subjectFilter, setSubjectFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [query, setQuery] = useState('');

  const subjectOptions = useMemo(() => {
    const set = new Set(subjects.map((s) => s.name));
    notes.forEach((n) => set.add(n.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subjects, notes]);

  const chapterOptions = useMemo(
    () => getAvailableChapters(notes, subjectFilter),
    [notes, subjectFilter]
  );

  const topics = useMemo(() => {
    const map = new Map<string, TopicGroup>();
    const q = query.trim().toLowerCase();

    for (const note of notes) {
      if (
        subjectFilter &&
        note.subject.toLowerCase() !== subjectFilter.toLowerCase()
      ) {
        continue;
      }
      if (
        chapterFilter &&
        note.chapter.toLowerCase() !== chapterFilter.toLowerCase()
      ) {
        continue;
      }
      if (
        q &&
        !note.topic.toLowerCase().includes(q) &&
        !note.subtopic.toLowerCase().includes(q) &&
        !note.chapter.toLowerCase().includes(q) &&
        !note.subject.toLowerCase().includes(q)
      ) {
        continue;
      }

      const key = `${note.subject.toLowerCase()}::${note.chapter.toLowerCase()}::${note.topic.toLowerCase()}`;
      let group = map.get(key);
      if (!group) {
        group = {
          key,
          subject: note.subject,
          chapter: note.chapter,
          topic: note.topic,
          subtopics: [],
          noteIds: [],
          firstNoteTitle: note.title,
          revisedCount: 0,
        };
        map.set(key, group);
      }
      group.noteIds.push(note.id);
      if (note.subtopic && !group.subtopics.includes(note.subtopic)) {
        group.subtopics.push(note.subtopic);
      }
      if (note.revisionStatus === 'revised' || note.revisionStatus === 'mastered') {
        group.revisedCount += 1;
      }
    }

    return Array.from(map.values()).sort((a, b) => a.topic.localeCompare(b.topic));
  }, [notes, subjectFilter, chapterFilter, query]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics or subtopics..."
            aria-label="Search topics"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        <select
          aria-label="Filter topics by subject"
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setChapterFilter('');
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="">All Subjects</option>
          {subjectOptions.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter topics by chapter"
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="">All Chapters</option>
          {chapterOptions.map((ch) => (
            <option key={ch} value={ch}>
              {ch}
            </option>
          ))}
        </select>
      </div>

      {topics.length === 0 ? (
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
                <th className="px-5 py-3">Topic</th>
                <th className="hidden px-4 py-3 md:table-cell">Subject / Chapter</th>
                <th className="px-4 py-3 text-right">Notes</th>
                <th className="hidden px-4 py-3 text-right sm:table-cell">Revised</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {topics.map((t) => {
                const targetUrl =
                  t.noteIds.length === 1
                    ? `/notes/${t.noteIds[0]}`
                    : `/notes?subject=${encodeURIComponent(t.subject)}&chapter=${encodeURIComponent(t.chapter)}&topic=${encodeURIComponent(t.topic)}`;

                return (
                  <tr
                    key={t.key}
                    className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to={targetUrl}
                        className="font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                      >
                        {t.topic}
                      </Link>
                      {t.subtopics.length > 0 && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {t.subtopics.join(' · ')}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 text-xs text-slate-600 md:table-cell dark:text-slate-400">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        {t.subject}
                      </span>
                      <span className="mx-1.5" aria-hidden="true">
                        /
                      </span>
                      <span>{t.chapter}</span>
                    </td>
                    <td className="tabular-nums px-4 py-3.5 text-right text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t.noteIds.length}
                    </td>
                    <td className="tabular-nums hidden px-4 py-3.5 text-right text-xs text-slate-600 sm:table-cell dark:text-slate-400">
                      {t.revisedCount}/{t.noteIds.length}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={targetUrl}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        <span>{t.noteIds.length === 1 ? 'Read' : 'Open'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
