import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { StaticNoteMeta } from '../types/note';
import { formatShortDate } from '../utils/formatters';
import { getSubjectColorMeta } from '../utils/subjectColors';

interface NoteCardProps {
  note: StaticNoteMeta;
  viewMode?: 'grid' | 'list';
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, viewMode = 'grid' }) => {
  const colorMeta = getSubjectColorMeta(note.subjectSlug);

  if (viewMode === 'list') {
    return (
      <article className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className={`h-2 w-2 shrink-0 rounded-full ${colorMeta.dotClass}`} />
            <Link
              to={`/subjects/${note.subjectSlug}`}
              className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {note.subject}
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              to={`/subjects/${note.subjectSlug}/${note.chapterSlug}`}
              className="hover:text-slate-800 dark:hover:text-slate-200"
            >
              {note.chapter}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{note.topic}</span>
          </div>

          <Link
            to={`/notes/${note.id}`}
            className="mt-1 block truncate text-base font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
          >
            {note.title}
          </Link>

          <p className="mt-1 line-clamp-1 text-sm text-slate-600 dark:text-slate-400">
            {note.summary}
          </p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
          <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">
            {formatShortDate(note.date)}
          </span>
          <Link
            to={`/notes/${note.id}`}
            className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <span>Read</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className={`h-2 w-2 shrink-0 rounded-full ${colorMeta.dotClass}`} />
          <Link
            to={`/subjects/${note.subjectSlug}`}
            className="truncate font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {note.subject}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/subjects/${note.subjectSlug}/${note.chapterSlug}`}
            className="truncate hover:text-slate-800 dark:hover:text-slate-200"
          >
            {note.chapter}
          </Link>
        </div>

        <Link
          to={`/notes/${note.id}`}
          className="mt-2.5 block text-base font-semibold leading-snug text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
        >
          {note.title}
        </Link>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Topic: {note.topic}
        </p>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {note.summary}
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
        <span className="tabular-nums text-xs text-slate-500 dark:text-slate-400">
          {formatShortDate(note.date)}
        </span>

        <Link
          to={`/notes/${note.id}`}
          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span>Open Note</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
};
