import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Play,
  Square,
  X,
} from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useStudyVault } from '../context/StudyVaultContext';
import type { RevisionStatus } from '../types/note';
import { REVISION_STATUS_LABELS, REVISION_STATUS_ORDER } from '../utils/formatters';

type RevisionTab =
  | 'all'
  | 'needs_revision'
  | 'favorites'
  | 'important'
  | 'recent'
  | RevisionStatus;

export const RevisionPage: React.FC = () => {
  const { notes, subjects, recentNoteIds, setRevisionStatus, notify } =
    useStudyVault();

  const [activeTab, setActiveTab] = useState<RevisionTab>('needs_revision');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [quickModeOpen, setQuickModeOpen] = useState(false);
  const [quickIndex, setQuickIndex] = useState(0);
  const [revealContent, setRevealContent] = useState(false);

  const counts = useMemo(() => {
    const map = {
      not_started: 0,
      learning: 0,
      revised: 0,
      mastered: 0,
      favorites: 0,
      important: 0,
    };
    for (const n of notes) {
      map[n.revisionStatus] += 1;
      if (n.favorite) map.favorites += 1;
      if (n.important) map.important += 1;
    }
    return map;
  }, [notes]);

  const subjectOptions = useMemo(() => {
    const set = new Set(subjects.map((s) => s.name));
    notes.forEach((n) => set.add(n.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subjects, notes]);

  const filteredQueue = useMemo(() => {
    const recentSet = new Set(recentNoteIds);
    return notes.filter((n) => {
      if (
        subjectFilter &&
        n.subject.toLowerCase() !== subjectFilter.toLowerCase()
      ) {
        return false;
      }
      switch (activeTab) {
        case 'needs_revision':
          return n.revisionStatus === 'not_started' || n.revisionStatus === 'learning';
        case 'favorites':
          return n.favorite;
        case 'important':
          return n.important;
        case 'recent':
          return recentSet.has(n.id);
        case 'not_started':
        case 'learning':
        case 'revised':
        case 'mastered':
          return n.revisionStatus === activeTab;
        case 'all':
        default:
          return true;
      }
    });
  }, [notes, recentNoteIds, activeTab, subjectFilter]);

  const startQuickRevision = () => {
    if (filteredQueue.length === 0) {
      notify('No notes in the current revision queue.', 'error');
      return;
    }
    setQuickIndex(0);
    setRevealContent(false);
    setQuickModeOpen(true);
  };

  const currentQuickNote = filteredQueue[quickIndex] ?? filteredQueue[0];

  const handleToggleChecklist = (noteId: string, currentStatus: RevisionStatus) => {
    const nextStatus: RevisionStatus =
      currentStatus === 'revised' || currentStatus === 'mastered'
        ? 'learning'
        : 'revised';
    setRevisionStatus(noteId, nextStatus);
    notify(`Marked as ${REVISION_STATUS_LABELS[nextStatus]}`, 'success');
  };

  const tabs: { key: RevisionTab; label: string; count?: number }[] = [
    {
      key: 'needs_revision',
      label: 'Due for Revision',
      count: counts.not_started + counts.learning,
    },
    { key: 'favorites', label: 'Favorites', count: counts.favorites },
    { key: 'important', label: 'High-Yield', count: counts.important },
    { key: 'recent', label: 'Recently Viewed' },
    { key: 'not_started', label: 'Not Started', count: counts.not_started },
    { key: 'learning', label: 'Learning', count: counts.learning },
    { key: 'revised', label: 'Revised', count: counts.revised },
    { key: 'mastered', label: 'Mastered', count: counts.mastered },
    { key: 'all', label: 'All', count: notes.length },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {REVISION_STATUS_ORDER.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveTab(status)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              activeTab === status
                ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-950/30'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
            }`}
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {REVISION_STATUS_LABELS[status]}
            </p>
            <p className="tabular-nums mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {counts[status]}
            </p>
          </button>
        ))}
      </section>

      {/* Queue Controls & Quick Revision Launcher */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setQuickIndex(0);
                }}
                className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="tabular-nums ml-1.5 opacity-75">
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter revision checklist by subject"
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setQuickIndex(0);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="">All Subjects</option>
              {subjectOptions.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={startQuickRevision}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Quick Revision Mode</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Revision Deck Panel */}
      {quickModeOpen && currentQuickNote && (
        <section
          aria-label="Quick revision mode"
          className="rounded-xl border border-indigo-200 bg-white p-6 dark:border-indigo-900/60 dark:bg-slate-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Quick Revision Card
              </span>
              <span className="mx-2" aria-hidden="true">
                ·
              </span>
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                {quickIndex + 1} of {filteredQueue.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setQuickModeOpen(false)}
              aria-label="Close Quick Revision Mode"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {currentQuickNote.subject} / {currentQuickNote.chapter} /{' '}
              {currentQuickNote.topic}
            </p>
            <h3 className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
              {currentQuickNote.title}
            </h3>

            {currentQuickNote.importantPoints.length > 0 && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide dark:text-slate-300">
                  Key Exam Takeaways
                </h4>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-slate-700 dark:text-slate-300">
                  {currentQuickNote.importantPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setRevealContent((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {revealContent ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Hide Full Note</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Reveal Full Note</span>
                  </>
                )}
              </button>
            </div>

            {revealContent && (
              <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <MarkdownRenderer content={currentQuickNote.content} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Update status:
                </span>
                {REVISION_STATUS_ORDER.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setRevisionStatus(currentQuickNote.id, status);
                      notify(
                        `"${currentQuickNote.title}" → ${REVISION_STATUS_LABELS[status]}`,
                        'success'
                      );
                    }}
                    className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      currentQuickNote.revisionStatus === status
                        ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {REVISION_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={quickIndex === 0}
                  onClick={() => {
                    setQuickIndex((i) => Math.max(0, i - 1));
                    setRevealContent(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={quickIndex >= filteredQueue.length - 1}
                  onClick={() => {
                    setQuickIndex((i) => Math.min(filteredQueue.length - 1, i + 1));
                    setRevealContent(false);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Revision Checklist */}
      {filteredQueue.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No notes match this revision filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Topic &amp; Note Revision Checklist ({filteredQueue.length})
            </h2>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredQueue.map((note) => {
              const isDone =
                note.revisionStatus === 'revised' ||
                note.revisionStatus === 'mastered';

              return (
                <li
                  key={note.id}
                  className="flex flex-col justify-between gap-3 px-5 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleChecklist(note.id, note.revisionStatus)
                      }
                      aria-label={
                        isDone
                          ? `Unmark "${note.title}" as revised`
                          : `Mark "${note.title}" as revised`
                      }
                      className={`mt-0.5 shrink-0 rounded p-0.5 transition-colors ${
                        isDone
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <Link
                        to={`/notes/${note.id}`}
                        className={`block truncate text-sm font-semibold transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                          isDone
                            ? 'text-slate-500 line-through dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {note.title}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        <span>{note.subject}</span>
                        <span className="mx-1.5" aria-hidden="true">
                          /
                        </span>
                        <span>{note.chapter}</span>
                        <span className="mx-1.5" aria-hidden="true">
                          /
                        </span>
                        <span>{note.topic}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3 pl-8 sm:pl-0">
                    <select
                      aria-label={`Revision status for ${note.title}`}
                      value={note.revisionStatus}
                      onChange={(e) => {
                        const status = e.target.value as RevisionStatus;
                        setRevisionStatus(note.id, status);
                        notify(
                          `"${note.title}" → ${REVISION_STATUS_LABELS[status]}`,
                          'success'
                        );
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    >
                      {REVISION_STATUS_ORDER.map((status) => (
                        <option key={status} value={status}>
                          {REVISION_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>

                    <Link
                      to={`/notes/${note.id}`}
                      className="whitespace-nowrap text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
