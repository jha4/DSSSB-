import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ListTree,
  Maximize2,
  Minimize2,
  Moon,
  Printer,
  RotateCw,
  Sun,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { formatShortDate } from '../utils/formatters';
import {
  fetchNoteHtml,
  getAdjacentNotes,
  getNoteById,
  type LoadedNoteContent,
} from '../utils/noteLoader';


type CompactOsPyqData = {
  t: string[];
  e: string[];
  q: Array<[number, number, number, string, string[], number]>;
};

type CompactOsPyqQuestion = CompactOsPyqData['q'][number];

const escapePyqHtml = (value: string): string =>
  value.replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  })[char] ?? char);

function renderOsPyqBlock(title: string, rows: CompactOsPyqQuestion[], data: CompactOsPyqData): string {
  const questions = rows.map((row) => {
    const year = row[1] || 'Year not recorded';
    const exam = data.e[row[2]] || '';
    const options = row[4].length
      ? '<ol type="A" style="margin:6px 0 6px 22px;padding-left:18px;">' +
        row[4].map((option) => '<li style="margin:3px 0;">' + escapePyqHtml(option) + '</li>').join('') +
        '</ol>'
      : '';
    const answerText = row[5] >= 0
      ? String.fromCharCode(65 + row[5]) + (row[4][row[5]] ? '. ' + escapePyqHtml(row[4][row[5]]) : '')
      : 'Not supplied';
    return '<li style="margin:0 0 15px;padding:0 0 12px;border-bottom:1px solid #eadf9d;">' +
      '<p style="font-size:.86em;color:#625d4c;margin:3px 0 6px;">[' + year + ']' +
      (exam ? ' · ' + escapePyqHtml(exam) : '') + '</p>' +
      '<p style="white-space:pre-wrap;margin:5px 0;"><strong>' + escapePyqHtml(row[3]) + '</strong></p>' +
      options +
      '<p style="font-weight:600;color:#365b2c;margin:5px 0;">Workbook answer key: ' + answerText + '</p>' +
      '</li>';
  }).join('');
  return '<div class="topic-pyq-highlight" style="background:#fff9db;border-left:4px solid #e6c84f;border-radius:6px;padding:12px 16px;margin:18px 0 24px;">' +
    '<h3>' + title + ' — ' + rows.length + ' questions</h3>' +
    '<p style="font-size:.88em;color:#625d4c;margin:4px 0 10px;">Questions are reproduced from the workbook. Repeated records are retained; answer keys are shown as supplied and have not all been independently verified.</p>' +
    '<ol style="padding-left:22px;">' + questions + '</ol></div>';
}

const FONT_SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-xs leading-relaxed',
  md: 'text-[13.5px] sm:text-sm',
  lg: 'text-[15px]',
};

export const NoteReaderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { theme, toggleTheme, readingFontSize, setReadingFontSize } =
    useStudyVault();

  const note = useMemo(() => (id ? getNoteById(id) : undefined), [id]);
  const { prev, next } = useMemo(
    () => (id ? getAdjacentNotes(id) : { prev: null, next: null }),
    [id]
  );

  const [loadedNote, setLoadedNote] = useState<LoadedNoteContent | null>(null);
  const [enhancedHtml, setEnhancedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [distractionFree, setDistractionFree] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const focusContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setReadProgress(0);
    setMobileTocOpen(false);
  }, [id]);

  useEffect(() => {
    if (!note) {
      setLoadedNote(null);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setErrorMsg(null);

    fetchNoteHtml(note.file, {
      signal: controller.signal,
      forceRefresh: retryToken > 0,
    })
      .then((content) => {
        if (!controller.signal.aborted) {
          setLoadedNote(content);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load the static HTML file for this note.';
        setErrorMsg(message);
        setLoadedNote(null);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [note, retryToken]);


  useEffect(() => {
    if (note?.id !== 'operating-system-pyq-short-notes' || !loadedNote?.html) {
      setEnhancedHtml(null);
      return;
    }

    let cancelled = false;
    const loadCompletePyqs = async () => {
      try {
        const dataUrl = `${import.meta.env.BASE_URL}notes/os-pyq-data.json.gz.b64`;
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error(`PYQ data request failed: ${response.status}`);
        const encoded = (await response.text()).trim();
        const compressed = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0));
        const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
        const data = JSON.parse(await new Response(stream).text()) as CompactOsPyqData;
        const topicSlots = [
          'OS fundamentals and structure',
          'OS structure and system calls',
          'Process management and threads',
          'CPU scheduling',
          'Synchronization and IPC',
          'Deadlocks',
          'Memory management',
          'Paging and virtual memory',
          'File systems and file management',
          'Disk management and scheduling',
          'Device and I/O management',
          'Additional syllabus concepts',
        ];
        let html = loadedNote.html;
        let slotIndex = 0;
        html = html.replace(/<div class="topic-pyq-highlight"[^>]*>[\s\S]*?<\/div>/g, () => {
          const topic = topicSlots[slotIndex++];
          const rows = data.q.filter((row) => data.t[row[0]] === topic);
          return renderOsPyqBlock('Complete topic-wise PYQs', rows, data);
        });

        const linuxRows = data.q.filter((row) => data.t[row[0]] === 'Linux, Unix and Windows');
        const linuxBlock = renderOsPyqBlock('Complete Linux, Unix and Windows PYQs', linuxRows, data);
        html = html.replace(/(?=<h2\b[^>]*>\s*14\.)/, linuxBlock);

        const miscellaneousRows = data.q.filter((row) => data.t[row[0]] === 'Miscellaneous');
        const miscellaneousBlock = renderOsPyqBlock('Miscellaneous PYQs — not mapped to a core topic', miscellaneousRows, data);
        html = html.replace(/<\/section>\s*$/, miscellaneousBlock + '</section>');

        if (!cancelled) setEnhancedHtml(html);
      } catch (error) {
        console.error('Unable to load the complete Operating System PYQ dataset', error);
        if (!cancelled) {
          setEnhancedHtml(
            loadedNote.html +
              '<p style="background:#fff4e5;border-left:4px solid #d97706;padding:10px 14px;">The complete PYQ dataset could not be loaded. Refresh the page to retry.</p>'
          );
        }
      }
    };

    void loadCompletePyqs();
    return () => {
      cancelled = true;
    };
  }, [note?.id, loadedNote?.html]);

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
  }, [note?.id, loadedNote?.html, distractionFree]);

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

  if (!note) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Note not found
        </h2>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400">
          No entry with ID "{id}" exists in the static notes index.
        </p>
        <Link
          to="/notes"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Notes</span>
        </Link>
      </div>
    );
  }

  const headings = loadedNote?.headings ?? [];
  const readTime = loadedNote?.readTimeMinutes ?? 1;
  const wordCount = loadedNote?.wordCount ?? 0;

  const articleBody = (
    <div className="space-y-4">
      {/* Note Header */}
      <header className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <nav
          aria-label="Note breadcrumb"
          className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Link
            to={`/subjects/${note.subjectSlug}`}
            className="text-indigo-600 hover:underline dark:text-indigo-400"
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
        </nav>

        <h1 className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
          {note.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="tabular-nums">Updated {formatShortDate(note.date)}</span>
          {loadedNote && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{readTime} min read</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{wordCount} words</span>
            </>
          )}
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

      {/* Mobile/Tablet Collapsible Outline */}
      {!distractionFree && headings.length >= 2 && (
        <div className="no-print xl:hidden">
          <button
            type="button"
            onClick={() => setMobileTocOpen((prevOpen) => !prevOpen)}
            aria-expanded={mobileTocOpen}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <span className="inline-flex items-center gap-1.5">
              <ListTree className="h-3.5 w-3.5 text-slate-400" />
              <span>On This Page ({headings.length})</span>
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                mobileTocOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {mobileTocOpen && (
            <nav
              aria-label="Mobile note outline"
              className="mt-1.5 space-y-1 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              {headings.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setMobileTocOpen(false);
                    document
                      .getElementById(h.id)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`block w-full truncate text-left text-xs text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 ${
                    h.level === 3 ? 'pl-3' : ''
                  }`}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Static HTML Note Body */}
      <div className="note-print-card rounded-xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="space-y-3 py-2" aria-busy="true" aria-label="Loading note">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3.5 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-3.5 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/70" />
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ) : errorMsg ? (
          <div className="py-6 text-center">
            <AlertCircle className="mx-auto h-7 w-7 text-rose-500" />
            <h2 className="mt-2.5 text-sm font-semibold text-slate-900 dark:text-white">
              Unable to load note content
            </h2>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-600 dark:text-slate-400">
              {errorMsg}
            </p>
            <div className="mt-4 flex justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setRetryToken((c) => c + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
              <Link
                to="/notes"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>All Notes</span>
              </Link>
            </div>
          </div>
        ) : loadedNote ? (
          <div
            className={`note-html-body ${FONT_SIZE_CLASS[readingFontSize]}`}
            dangerouslySetInnerHTML={{ __html: enhancedHtml ?? loadedNote.html }}
          />
        ) : null}
      </div>

      {/* Previous / Next Note Navigation */}
      {(prev || next) && (
        <nav
          aria-label="Adjacent notes navigation"
          className="no-print grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        >
          <div>
            {prev && (
              <Link
                to={`/notes/${prev.id}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-3.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
                  <span>Previous</span>
                </span>
                <span className="mt-0.5 truncate text-xs font-semibold text-slate-900 group-hover:text-indigo-600 sm:text-[13px] dark:text-slate-100 dark:group-hover:text-indigo-400">
                  {prev.title}
                </span>
                <span className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {prev.subject} / {prev.chapter}
                </span>
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link
                to={`/notes/${next.id}`}
                className="group flex flex-col items-end rounded-xl border border-slate-200 bg-white p-3.5 text-right transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Next</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-0.5 w-full truncate text-xs font-semibold text-slate-900 group-hover:text-indigo-600 sm:text-[13px] dark:text-slate-100 dark:group-hover:text-indigo-400">
                  {next.title}
                </span>
                <span className="mt-0.5 w-full truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {next.subject} / {next.chapter}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );

  if (distractionFree) {
    return (
      <div
        ref={focusContainerRef}
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-50 dark:bg-slate-950"
      >
        <div
          className="no-print fixed top-0 left-0 z-50 h-1 bg-indigo-600 transition-all duration-150 dark:bg-indigo-400"
          style={{ width: `${readProgress}%` }}
          role="progressbar"
          aria-valuenow={readProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        />

        <div className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-xs sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
            <span className="truncate text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Focus · <span className="tabular-nums">{readProgress}%</span> read
            </span>

            <div className="flex shrink-0 items-center gap-1.5">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] dark:border-slate-700 dark:bg-slate-800">
                {(['sm', 'md', 'lg'] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setReadingFontSize(sz)}
                    className={`rounded-md px-1.5 py-0.5 font-medium uppercase ${
                      readingFontSize === sz
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
                {theme === 'dark' ? (
                  <Sun className="h-3.5 w-3.5" />
                ) : (
                  <Moon className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setDistractionFree(false)}
                className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                <Minimize2 className="h-3 w-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-3xl px-3 py-5 sm:px-5">{articleBody}</main>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Fixed Reading Progress Indicator */}
      <div
        className="no-print fixed top-0 left-0 z-50 h-1 bg-indigo-600 transition-all duration-150 dark:bg-indigo-400"
        style={{ width: `${readProgress}%` }}
        role="progressbar"
        aria-valuenow={readProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />

      {/* Action Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:px-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <Link
            to="/notes"
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Notes</span>
          </Link>
          <span className="tabular-nums text-[11px] text-slate-500 dark:text-slate-400">
            {readProgress}% read
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div
            className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] dark:border-slate-700 dark:bg-slate-800"
            role="group"
            aria-label="Reading font size"
          >
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setReadingFontSize(sz)}
                aria-pressed={readingFontSize === sz}
                className={`rounded-md px-1.5 py-0.5 font-medium uppercase ${
                  readingFontSize === sz
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {sz}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Printer className="h-3 w-3" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={() => setDistractionFree(true)}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Focus</span>
          </button>
        </div>
      </div>

      {/* Main Content + Desktop TOC Outline */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">{articleBody}</div>

        {headings.length >= 2 && (
          <aside className="no-print hidden xl:block">
            <div className="sticky top-16 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                On This Page
              </h2>
              <nav aria-label="Note outline" className="mt-2.5 space-y-1">
                {headings.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(h.id)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`block w-full truncate text-left text-[11px] text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 ${
                      h.level === 3 ? 'pl-2.5' : ''
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
    </div>
  );
};
