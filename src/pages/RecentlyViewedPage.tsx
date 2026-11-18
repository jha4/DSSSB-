import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useStudyVault } from '../context/StudyVaultContext';
import { formatShortDate, REVISION_STATUS_LABELS } from '../utils/formatters';

export const RecentlyViewedPage: React.FC = () => {
  const { notes, recentNoteIds, clearRecentViews, notify } = useStudyVault();
  const [confirmClear, setConfirmClear] = useState(false);

  const recentNotes = useMemo(() => {
    const map = new Map(notes.map((n) => [n.id, n]));
    return recentNoteIds
      .map((id) => map.get(id))
      .filter((n): n is NonNullable<typeof n> => Boolean(n));
  }, [notes, recentNoteIds]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recently Viewed History
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Jump right back into the notes you studied most recently.
          </p>
        </div>

        {recentNotes.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {recentNotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Clock className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No reading history yet
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Notes you open in the reader will appear here in chronological order.
          </p>
          <Link
            to="/notes"
            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
          >
            Open All Notes
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {recentNotes.map((note, idx) => (
            <div
              key={note.id}
              className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="tabular-nums font-mono text-slate-400">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {note.subject}
                  </span>
                  <span aria-hidden="true">/</span>
                  <span>{note.chapter}</span>
                  <span aria-hidden="true">/</span>
                  <span>{note.topic}</span>
                </div>
                <Link
                  to={`/notes/${note.id}`}
                  className="mt-1 block truncate text-base font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                >
                  {note.title}
                </Link>
              </div>

              <div className="flex shrink-0 items-center gap-4 text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {REVISION_STATUS_LABELS[note.revisionStatus]}
                </span>
                <span className="tabular-nums text-slate-500 dark:text-slate-400">
                  {note.lastViewedAt
                    ? formatShortDate(note.lastViewedAt)
                    : formatShortDate(note.updatedAt)}
                </span>
                <Link
                  to={`/notes/${note.id}`}
                  className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Read Note
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear reading history?"
        description="This clears your recently viewed list. Your notes themselves will not be deleted."
        confirmLabel="Clear History"
        onConfirm={() => {
          clearRecentViews();
          setConfirmClear(false);
          notify('Cleared recently viewed history');
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
};
