import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileJson,
  FileText,
  Upload,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import type { DuplicateStrategy, Note, SubjectItem } from '../types/note';
import { sanitizeFileSlug } from '../utils/formatters';
import {
  createJsonBackup,
  generateUniqueId,
  noteToMarkdown,
  parseJsonImport,
  parseMarkdownToNoteDraft,
  todayIsoDate,
} from '../utils/importExport';

export const ImportExportPage: React.FC = () => {
  const { notes, subjects, importNotesBatch, notify } = useStudyVault();

  // Markdown Import state
  const [mdSubject, setMdSubject] = useState(subjects[0]?.name ?? 'General Knowledge');
  const [mdChapter, setMdChapter] = useState('General');
  const [mdStrategy, setMdStrategy] = useState<DuplicateStrategy>('duplicate');
  const [stagedMdNotes, setStagedMdNotes] = useState<Note[]>([]);
  const [mdError, setMdError] = useState('');

  // Quick Paste Markdown state
  const [pasteMdText, setPasteMdText] = useState('');
  const [pasteSubject, setPasteSubject] = useState(
    subjects[0]?.name ?? 'Computer Science'
  );
  const [pasteChapter, setPasteChapter] = useState('');
  const [pasteTopic, setPasteTopic] = useState('');

  // JSON Import state
  const [jsonText, setJsonText] = useState('');
  const [jsonStrategy, setJsonStrategy] = useState<DuplicateStrategy>('skip');
  const [jsonError, setJsonError] = useState('');
  const [stagedJson, setStagedJson] = useState<{
    notes: Note[];
    subjects: SubjectItem[];
    warnings: string[];
  } | null>(null);

  // Export state
  const [exportSubject, setExportSubject] = useState('');

  const subjectOptions = useMemo(() => {
    const set = new Set(subjects.map((s) => s.name));
    notes.forEach((n) => set.add(n.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subjects, notes]);

  const handleMarkdownFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setMdError('');
    const parsed: Note[] = [];

    try {
      for (const file of Array.from(files)) {
        const text = await file.text();
        const draft = parseMarkdownToNoteDraft(text, file.name, {
          subject: mdSubject,
          chapter: mdChapter || 'General',
        });
        parsed.push({
          ...draft,
          id: generateUniqueId('md'),
        });
      }
      setStagedMdNotes(parsed);
    } catch {
      setMdError('Failed to read one or more Markdown files.');
    }
  };

  const confirmMarkdownImport = () => {
    if (stagedMdNotes.length === 0) return;
    const result = importNotesBatch(stagedMdNotes, mdStrategy);
    setStagedMdNotes([]);
    notify(
      `Imported ${result.addedCount} note(s)${result.skippedCount ? `, skipped ${result.skippedCount}` : ''}`,
      'success'
    );
  };

  const handleQuickPasteImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteMdText.trim()) {
      notify('Paste Markdown content before importing.', 'error');
      return;
    }
    const draft = parseMarkdownToNoteDraft(pasteMdText, undefined, {
      subject: pasteSubject,
      chapter: pasteChapter.trim() || 'General',
      topic: pasteTopic.trim() || undefined,
    });
    const note: Note = { ...draft, id: generateUniqueId('paste') };
    importNotesBatch([note], 'duplicate');
    setPasteMdText('');
    setPasteTopic('');
    notify(`Imported "${note.title}"`, 'success');
  };

  const handleJsonFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const text = await files[0].text();
    setJsonText(text);
    validateJsonInput(text);
  };

  const validateJsonInput = (raw: string) => {
    setJsonError('');
    setStagedJson(null);
    if (!raw.trim()) return;
    try {
      const result = parseJsonImport(raw);
      setStagedJson(result);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON format.');
    }
  };

  const confirmJsonImport = () => {
    if (!stagedJson) return;
    const outcome = importNotesBatch(
      stagedJson.notes,
      jsonStrategy,
      stagedJson.subjects
    );
    setStagedJson(null);
    setJsonText('');
    notify(
      `JSON import complete: ${outcome.addedCount} added, ${outcome.updatedCount} updated, ${outcome.skippedCount} skipped.`,
      'success'
    );
  };

  const handleExportJsonBackup = () => {
    const backup = createJsonBackup(notes, subjects);
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyvault-backup-${todayIsoDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Exported JSON backup (${notes.length} notes)`, 'success');
  };

  const handleExportCombinedMarkdown = () => {
    const targetNotes = exportSubject
      ? notes.filter((n) => n.subject.toLowerCase() === exportSubject.toLowerCase())
      : notes;

    if (targetNotes.length === 0) {
      notify('No notes available to export for this selection.', 'error');
      return;
    }

    const combined = targetNotes.map((n) => noteToMarkdown(n)).join('\n\n---\n\n');
    const blob = new Blob([combined], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFileSlug(exportSubject || 'all-studyvault-notes')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Exported ${targetNotes.length} note(s) as Markdown`, 'success');
  };

  return (
    <div className="space-y-8">
      {/* Export Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Export &amp; Backup
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Download a full JSON backup to restore all notes and subjects later, or export notes as Markdown.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJsonBackup}
              className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              <FileJson className="h-4 w-4" />
              <span>Export Full JSON Backup ({notes.length})</span>
            </button>

            <div className="flex items-center gap-2">
              <select
                aria-label="Select subject to export as Markdown"
                value={exportSubject}
                onChange={(e) => setExportSubject(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">All Subjects (.md)</option>
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleExportCombinedMarkdown}
                className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download className="h-4 w-4" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Import Single or Multiple Markdown Files */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Import Markdown Files (.md)
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Select a single Markdown file or multiple files at once. YAML frontmatter is preserved automatically; plain Markdown extracts the first heading as the title.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="md-default-subject"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Fallback Subject
              </label>
              <select
                id="md-default-subject"
                value={mdSubject}
                onChange={(e) => setMdSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="md-default-chapter"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Fallback Chapter
              </label>
              <input
                id="md-default-chapter"
                type="text"
                value={mdChapter}
                onChange={(e) => setMdChapter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="md-dup-strategy"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Duplicate Handling
              </label>
              <select
                id="md-dup-strategy"
                value={mdStrategy}
                onChange={(e) => setMdStrategy(e.target.value as DuplicateStrategy)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="duplicate">Keep both (New ID)</option>
                <option value="skip">Skip duplicates</option>
                <option value="overwrite">Overwrite matching ID</option>
              </select>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-500">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              Choose one or multiple .md files
            </span>
            <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Supports .md, .markdown, and .txt files
            </span>
            <input
              type="file"
              accept=".md,.markdown,.txt"
              multiple
              onChange={(e) => handleMarkdownFiles(e.target.files)}
              className="sr-only"
            />
          </label>

          {mdError && (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {mdError}
            </p>
          )}

          {stagedMdNotes.length > 0 && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Ready to import {stagedMdNotes.length} file(s):
                </span>
                <button
                  type="button"
                  onClick={confirmMarkdownImport}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Import All</span>
                </button>
              </div>
              <ul className="mt-2.5 max-h-40 space-y-1.5 overflow-y-auto text-xs text-slate-600 dark:text-slate-400">
                {stagedMdNotes.map((n) => (
                  <li key={n.id} className="truncate">
                    <strong className="text-slate-800 dark:text-slate-200">
                      {n.title}
                    </strong>{' '}
                    · {n.subject} / {n.chapter}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Import JSON Backup or Structured JSON */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Import JSON / Restore Backup
            </h2>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Upload a StudyVault backup file or paste a structured JSON array of notes. Duplicate handling prevents accidental overwrites.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Upload className="h-3.5 w-3.5" />
              <span>Upload .json File</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={(e) => handleJsonFileUpload(e.target.files)}
                className="sr-only"
              />
            </label>

            <div className="flex items-center gap-2">
              <label
                htmlFor="json-dup-strategy"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Duplicates:
              </label>
              <select
                id="json-dup-strategy"
                value={jsonStrategy}
                onChange={(e) => setJsonStrategy(e.target.value as DuplicateStrategy)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option value="skip">Skip existing</option>
                <option value="duplicate">Keep both (New ID)</option>
                <option value="overwrite">Overwrite matching ID</option>
              </select>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              validateJsonInput(e.target.value);
            }}
            rows={7}
            placeholder='Paste JSON backup or array: [{"title": "...", "subject": "...", "chapter": "...", "topic": "...", "content": "..."}]'
            aria-label="JSON import payload"
            className="mt-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          {jsonError && (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">
              {jsonError}
            </p>
          )}

          {stagedJson && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                Validated{' '}
                <strong className="tabular-nums">{stagedJson.notes.length}</strong>{' '}
                note(s)
                {stagedJson.subjects.length > 0 &&
                  ` and ${stagedJson.subjects.length} subject(s)`}
                .
              </div>
              <button
                type="button"
                onClick={confirmJsonImport}
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500"
              >
                Confirm JSON Import
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Quick Paste ChatGPT Markdown */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Quick Paste ChatGPT Markdown
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Paste Markdown directly from ChatGPT to create a formatted note in one step.
        </p>

        <form onSubmit={handleQuickPasteImport} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label
                htmlFor="paste-subject"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Subject
              </label>
              <select
                id="paste-subject"
                value={pasteSubject}
                onChange={(e) => setPasteSubject(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="paste-chapter"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Chapter
              </label>
              <input
                id="paste-chapter"
                type="text"
                value={pasteChapter}
                onChange={(e) => setPasteChapter(e.target.value)}
                placeholder="e.g., Operating System"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="paste-topic"
                className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Topic (optional)
              </label>
              <input
                id="paste-topic"
                type="text"
                value={pasteTopic}
                onChange={(e) => setPasteTopic(e.target.value)}
                placeholder="Auto-filled from title if blank"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <textarea
            value={pasteMdText}
            onChange={(e) => setPasteMdText(e.target.value)}
            rows={7}
            placeholder="# Paste ChatGPT Markdown note here..."
            aria-label="Paste raw Markdown note"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Pasted Markdown</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
