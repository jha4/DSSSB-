import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Copy,
  Download,
  Edit3,
  Maximize2,
  Minimize2,
  Moon,
  Star,
  Sun,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useStudyVault } from '../context/StudyVaultContext';
import type { RevisionStatus } from '../types/note';
import {
  formatShortDate,
  REVISION_STATUS_LABELS,
  REVISION_STATUS_ORDER,
  sanitizeFileSlug,
} from '../utils/formatters';
import { noteToMarkdown } from '../utils/importExport';
import { estimateReadTimeMinutes, extractHeadings } from '../utils/markdownHelpers';

export const NoteReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    notes,
    settings,
    toggleFavorite,
    toggleImportant,
    setRevisionStatus,
    deleteNote,
    recordNoteView,
    toggleTheme,
    updateSettings,
    notify,
  } = useStudyVault();

  const note = useMemo(() => notes.find((n) => n.id === id), [notes, id]);

  const [distractionFree, setDistractionFree] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copiedNote, setCopiedNote] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const focusContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      recordNoteView(note.id);
    }
  }, [note?.id, recordNoteView]);

  useEffect(() => {
    const updateScroll = () => {
      if (distractionFree && focusContainerRef.current) {
        const el = focusContainerRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxScroll <= 20) {
          setReadProgress(100);
        } else {
          setReadProgress(
            Math.min(100, Math.max(0, Math.round((el.scrollTop / maxScroll) * 100)))
          );
        }
        return;
      }

      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      if (scrollHeight <= 20) {
        setReadProgress(100);
      } else {
        setReadProgress(
          Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)))
        );
      }
    };

    updateScroll();
    const focusEl = focusContainerRef.current;
    if (distractionFree && focusEl) {
      focusEl.addEventListener('scroll', updateScroll, { passive: true });
    } else {
      window.addEventListener('scroll', updateScroll, { passive: true });
    }
    window.addEventListener('resize', updateScroll);
    return () => {
      if (focusEl) {
        focusEl.removeEventListener('scroll', updateScroll);
      }
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [note?.id, distractionFree]);

  useEffect(() => {
    if (!distractionFree) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDistractionFree(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [distractionFree]);

  const headings = useMemo(
    () => (note ? extractHeadings(note.content) : []),
    [note?.content]
  );
  const readTime = useMemo(
    () => (note ? estimateReadTimeMinutes(note.content) : 1),
    [note?.content]
  );

  if (!note) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Note not found
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This note may have been deleted or the link is outdated.
        </p>
        <Link
          to="/notes"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Notes</span>
        </Link>
      </div>
    );
  }

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setCopiedNote(true);
      notify(`Copied "${note.title}"`, 'success');
      window.setTimeout(() => setCopiedNote(false), 1800);
    } catch {
      notify('Unable to access clipboard', 'error');
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
    notify(`Exported "${note.title}.md"`, 'success');
  };

  const handleDelete = () => {
    if (settings.confirmBeforeDelete) {
      setConfirmDeleteOpen(true);
    } else {
      deleteNote(note.id);
      notify(`Deleted "${note.title}"`, 'neutral');
      navigate('/notes');
    }
  };

  const confirmDelete = () => {
    const title = note.title;
    deleteNote(note.id);
    setConfirmDeleteOpen(false);
    notify(`Deleted "${title}"`, 'neutral');
    navigate('/notes');
  };

  const articleBody = (
    <div className="space-y-6">
      {/* Note Header */}
      <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link
            to={`/notes?subject=${encodeURIComponent(note.subject)}`}
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {note.subject}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={`/notes?subject=${encodeURIComponent(note.subject)}&chapter=${encodeURIComponent(note.chapter)}`}
            className="hover:text-slate-800 dark:hover:text-slate-200"
          >
            {note.chapter}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{note.topic}</span>
          {note.subtopic && (
            <>
              <span aria-hidden="true">/</span>
              <span>{note.subtopic}</span>
            </>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {note.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">Created {formatShortDate(note.createdAt)}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">Updated {formatShortDate(note.updatedAt)}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{readTime} min read</span>
          {note.tags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {note.tags.map((t, idx) => (
                  <React.Fragment key={t}>
                    {idx > 0 && ' '}
                    <Link
                      to={`/notes?tag=${encodeURIComponent(t)}`}
                      className="hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      #{t}
                    </Link>
                  </React.Fragment>
                ))}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Important Points Summary */}
      {settings.showImportantPointsBanner && note.importantPoints.length > 0 && (
        <section
          aria-labelledby="important-points-heading"
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <h2
            id="important-points-heading"
            className="text-sm font-semibold text-slate-900 dark:text-white"
          >
            Important Exam Points
          </h2>
          <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {note.importantPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Markdown Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <MarkdownRenderer content={note.content} fontSize={settings.readingFontSize} />
      </div>
    </div>
  );

  if (distractionFree) {
    return (
      <div
        ref={focusContainerRef}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950"
      >
        {/* Reading Progress Bar */}
        <div
          className="fixed top-0 left-0 z-50 h-1 bg-indigo-600 transition-all duration-150 dark:bg-indigo-400"
          style={{ width: `${readProgress}%` }}
          role="progressbar"
          aria-valuenow={readProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        />

        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-xs sm:px-8 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <span className="truncate text-xs font-medium text-slate-600 dark:text-slate-400">
              Distraction-Free Mode · <span className="tabular-nums">{readProgress}%</span> read
            </span>

            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-slate-700 dark:bg-slate-800">
                {(['sm', 'md', 'lg'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateSettings({ readingFontSize: sz })}
                    className={`rounded-md px-2 py-1 font-medium uppercase ${
                      settings.readingFontSize === sz
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setDistractionFree(false)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Focus</span>
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{articleBody}</main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed Reading Progress Indicator */}
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-indigo-600 transition-all duration-150 dark:bg-indigo-400"
        style={{ width: `${readProgress}%` }}
        role="progressbar"
        aria-valuenow={readProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <Link
            to="/notes"
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Notes</span>
          </Link>
          <span className="tabular-nums hidden text-xs text-slate-500 2xl:inline dark:text-slate-400">
            {readProgress}% read
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <label htmlFor="reader-revision-status" className="sr-only">
            Revision Status
          </label>
          <select
            id="reader-revision-status"
            value={note.revisionStatus}
            onChange={(e) => {
              const status = e.target.value as RevisionStatus;
              setRevisionStatus(note.id, status);
              notify(`Marked as ${REVISION_STATUS_LABELS[status]}`, 'success');
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {REVISION_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                Status: {REVISION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => toggleFavorite(note.id)}
            aria-pressed={note.favorite}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              note.favorite
                ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`h-3.5 w-3.5 ${note.favorite ? 'fill-current' : ''}`} />
            <span>{note.favorite ? 'Favorited' : 'Favorite'}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleImportant(note.id)}
            aria-pressed={note.important}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              note.important
                ? 'border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>High-Yield</span>
          </button>

          <button
            type="button"
            onClick={() => setDistractionFree(true)}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Focus Mode</span>
          </button>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copiedNote ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copiedNote ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportMd}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .md</span>
          </button>

          <Link
            to={`/notes/${note.id}/edit`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            aria-label="Delete note"
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Content + Optional TOC Outline */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">{articleBody}</div>

        {headings.length >= 2 && (
          <aside className="hidden xl:block">
            <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                On This Page
              </h2>
              <nav aria-label="Note outline" className="mt-3 space-y-1.5">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(h.id)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`block w-full truncate text-left text-xs text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 ${
                      h.level === 2 ? 'pl-2' : h.level === 3 ? 'pl-4' : ''
                    }`}
                  >
                    {h.text}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this note?"
        description={`"${note.title}" will be permanently deleted from your vault.`}
        confirmLabel="Delete Note"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
};
