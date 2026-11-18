import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Copy,
  Download,
  Edit3,
  Star,
  Trash2,
} from 'lucide-react';
import type { Note, RevisionStatus } from '../types/note';
import {
  formatShortDate,
  REVISION_STATUS_LABELS,
  sanitizeFileSlug,
} from '../utils/formatters';
import { noteToMarkdown } from '../utils/importExport';
import { stripMarkdownSnippet } from '../utils/markdownHelpers';

interface NoteCardProps {
  note: Note;
  viewMode?: 'grid' | 'list';
  onToggleFavorite: (id: string) => void;
  onDeleteRequest: (note: Note) => void;
  onCopied?: (title: string) => void;
  onExported?: (title: string) => void;
}

const STATUS_TEXT_TONE: Record<RevisionStatus, string> = {
  not_started: 'text-slate-500 dark:text-slate-400',
  learning: 'text-amber-700 dark:text-amber-400',
  revised: 'text-sky-700 dark:text-sky-400',
  mastered: 'text-emerald-700 dark:text-emerald-400',
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  viewMode = 'grid',
  onToggleFavorite,
  onDeleteRequest,
  onCopied,
  onExported,
}) => {
  const snippet = stripMarkdownSnippet(note.content, viewMode === 'list' ? 120 : 145);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      onCopied?.(note.title);
    } catch {
      // Clipboard unsupported
    }
  };

  const handleExportMd = () => {
    const md = noteToMarkdown(note);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFileSlug(note.title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onExported?.(note.title);
  };

  if (viewMode === 'list') {
    return (
      <article className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {note.subject}
            </span>
            <span aria-hidden="true">/</span>
            <span>{note.chapter}</span>
            <span aria-hidden="true">/</span>
            <span>{note.topic}</span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${STATUS_TEXT_TONE[note.revisionStatus]}`}>
              {REVISION_STATUS_LABELS[note.revisionStatus]}
            </span>
            {note.important && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                  <Bookmark className="h-3 w-3" />
                  High-Yield
                </span>
              </>
            )}
          </div>

          <Link
            to={`/notes/${note.id}`}
            className="mt-1 block truncate text-base font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
          >
            {note.title}
          </Link>

          <p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-400">
            {snippet || 'Empty note'}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">
            {formatShortDate(note.updatedAt)}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFavorite(note.id)}
              aria-label={
                note.favorite
                  ? `Remove "${note.title}" from favorites`
                  : `Mark "${note.title}" as favorite`
              }
              title={note.favorite ? 'Remove from favorites' : 'Mark as favorite'}
              className={`rounded-lg p-2 transition-colors ${
                note.favorite
                  ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Star className={`h-4 w-4 ${note.favorite ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy markdown for "${note.title}"`}
              title="Copy Markdown"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleExportMd}
              aria-label={`Export "${note.title}" as Markdown`}
              title="Export Markdown"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Download className="h-4 w-4" />
            </button>
            <Link
              to={`/notes/${note.id}/edit`}
              aria-label={`Edit "${note.title}"`}
              title="Edit Note"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <Edit3 className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => onDeleteRequest(note)}
              aria-label={`Delete "${note.title}"`}
              title="Delete Note"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {note.subject}
            </span>
            <span className="mx-1.5" aria-hidden="true">
              /
            </span>
            <span className="truncate">{note.chapter}</span>
          </div>
          <button
            type="button"
            onClick={() => onToggleFavorite(note.id)}
            aria-label={
              note.favorite
                ? `Remove "${note.title}" from favorites`
                : `Mark "${note.title}" as favorite`
            }
            title={note.favorite ? 'Favorited' : 'Mark as favorite'}
            className={`-mt-1 -mr-1 rounded-lg p-1.5 transition-colors ${
              note.favorite
                ? 'text-amber-500 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Star className={`h-4 w-4 ${note.favorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <Link
          to={`/notes/${note.id}`}
          className="mt-2 block text-base font-semibold leading-snug text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
        >
          {note.title}
        </Link>

        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>{note.topic}</span>
          {note.subtopic ? (
            <>
              <span className="mx-1.5" aria-hidden="true">
                ·
              </span>
              <span>{note.subtopic}</span>
            </>
          ) : null}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {snippet || 'No content added yet.'}
        </p>

        {note.tags.length > 0 && (
          <p className="mt-3 truncate text-xs text-slate-500 dark:text-slate-400">
            {note.tags.map((tag, idx) => (
              <React.Fragment key={tag}>
                {idx > 0 && (
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                )}
                <span>#{tag}</span>
              </React.Fragment>
            ))}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs">
          <span className={`font-medium ${STATUS_TEXT_TONE[note.revisionStatus]}`}>
            {REVISION_STATUS_LABELS[note.revisionStatus]}
          </span>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">
            ·
          </span>
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            {formatShortDate(note.updatedAt)}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy markdown for "${note.title}"`}
            title="Copy Markdown"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExportMd}
            aria-label={`Export "${note.title}" as Markdown`}
            title="Export as .md"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <Link
            to={`/notes/${note.id}/edit`}
            aria-label={`Edit "${note.title}"`}
            title="Edit Note"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => onDeleteRequest(note)}
            aria-label={`Delete "${note.title}"`}
            title="Delete Note"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
