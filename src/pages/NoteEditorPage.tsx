import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Columns2,
  Eye,
  PenLine,
  Plus,
  Save,
  Wand2,
  X,
} from 'lucide-react';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useStudyVault } from '../context/StudyVaultContext';
import type { RevisionStatus } from '../types/note';
import { REVISION_STATUS_LABELS, REVISION_STATUS_ORDER } from '../utils/formatters';
import { parseMarkdownToNoteDraft } from '../utils/importExport';
import { getAvailableChapters, getAvailableTopics } from '../utils/noteFilters';

export const NoteEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const { notes, subjects, addNote, updateNote, notify } = useStudyVault();
  const existingNote = useMemo(
    () => (id ? notes.find((n) => n.id === id) : undefined),
    [notes, id]
  );

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(subjects[0]?.name ?? 'Computer Science');
  const [customSubject, setCustomSubject] = useState('');
  const [useCustomSubject, setUseCustomSubject] = useState(false);
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [importantPoints, setImportantPoints] = useState<string[]>([]);
  const [newPointInput, setNewPointInput] = useState('');
  const [content, setContent] = useState('');
  const [important, setImportant] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [revisionStatus, setRevisionStatus] = useState<RevisionStatus>('not_started');

  const [editorMode, setEditorMode] = useState<'write' | 'split' | 'preview'>('split');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && existingNote) {
      setTitle(existingNote.title);
      const subjectExists = subjects.some(
        (s) => s.name.toLowerCase() === existingNote.subject.toLowerCase()
      );
      if (subjectExists) {
        setSubject(existingNote.subject);
        setUseCustomSubject(false);
      } else {
        setUseCustomSubject(true);
        setCustomSubject(existingNote.subject);
      }
      setChapter(existingNote.chapter);
      setTopic(existingNote.topic);
      setSubtopic(existingNote.subtopic);
      setTagsInput(existingNote.tags.join(', '));
      setImportantPoints(existingNote.importantPoints);
      setContent(existingNote.content);
      setImportant(existingNote.important);
      setFavorite(existingNote.favorite);
      setRevisionStatus(existingNote.revisionStatus);
    }
  }, [isEditing, existingNote, subjects]);

  const effectiveSubject = useCustomSubject ? customSubject.trim() : subject.trim();

  const chapterSuggestions = useMemo(
    () => getAvailableChapters(notes, effectiveSubject),
    [notes, effectiveSubject]
  );

  const topicSuggestions = useMemo(
    () => getAvailableTopics(notes, effectiveSubject, chapter),
    [notes, effectiveSubject, chapter]
  );

  if (isEditing && !existingNote) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Note not found
        </h2>
        <Link
          to="/notes"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Notes</span>
        </Link>
      </div>
    );
  }

  const handleAddImportantPoint = () => {
    const trimmed = newPointInput.trim();
    if (!trimmed) return;
    setImportantPoints((prev) => [...prev, trimmed]);
    setNewPointInput('');
  };

  const handleExtractFromMarkdown = () => {
    if (!content.trim()) {
      notify('Paste Markdown content first to auto-extract metadata.', 'error');
      return;
    }
    const draft = parseMarkdownToNoteDraft(content);
    if (!title.trim() && draft.title && draft.title !== 'Untitled Exam Note') {
      setTitle(draft.title);
    }
    if (draft.importantPoints.length > 0) {
      setImportantPoints((prev) => {
        const merged = [...prev];
        for (const pt of draft.importantPoints) {
          if (!merged.includes(pt)) merged.push(pt);
        }
        return merged;
      });
    }
    if (draft.tags.length > 0 && !tagsInput.trim()) {
      setTagsInput(draft.tags.join(', '));
    }
    notify('Extracted title and key points from Markdown.', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) nextErrors.title = 'Note title is required.';
    if (!effectiveSubject) nextErrors.subject = 'Please select or enter a subject.';
    if (!chapter.trim()) nextErrors.chapter = 'Chapter is required.';
    if (!topic.trim()) nextErrors.topic = 'Topic is required.';
    if (!content.trim()) nextErrors.content = 'Note Markdown content is required.';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const parsedTags = Array.from(
      new Set(
        tagsInput
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean)
      )
    );

    const payload = {
      title: title.trim(),
      subject: effectiveSubject,
      chapter: chapter.trim(),
      topic: topic.trim(),
      subtopic: subtopic.trim(),
      content,
      importantPoints,
      tags: parsedTags,
      important,
      favorite,
      revisionStatus,
    };

    if (isEditing && existingNote) {
      updateNote(existingNote.id, payload);
      notify(`Updated "${payload.title}"`, 'success');
      navigate(`/notes/${existingNote.id}`);
    } else {
      const created = addNote(payload);
      notify(`Saved "${created.title}"`, 'success');
      navigate(`/notes/${created.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Link
            to={isEditing && existingNote ? `/notes/${existingNote.id}` : '/notes'}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Link>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Exam Note' : 'Create Exam Note'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExtractFromMarkdown}
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Wand2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Auto-Extract from Markdown</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 sm:text-sm dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <Save className="h-4 w-4" />
            <span>{isEditing ? 'Save Changes' : 'Save Note'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Fields */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-2 lg:col-span-3">
            <label
              htmlFor="note-title"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Note Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
              }}
              placeholder="e.g., Process Management & CPU Scheduling Algorithms"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            {errors.title && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="note-subject"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Subject <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setUseCustomSubject((v) => !v)}
                className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {useCustomSubject ? 'Choose existing' : '+ New subject'}
              </button>
            </div>
            {useCustomSubject ? (
              <input
                id="note-subject"
                type="text"
                value={customSubject}
                onChange={(e) => {
                  setCustomSubject(e.target.value);
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
                }}
                placeholder="Enter new subject name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            ) : (
              <select
                id="note-subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject) setErrors((prev) => ({ ...prev, subject: '' }));
                }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
            {errors.subject && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.subject}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="note-chapter"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Chapter <span className="text-rose-500">*</span>
            </label>
            <input
              id="note-chapter"
              type="text"
              list="chapter-suggestions"
              value={chapter}
              onChange={(e) => {
                setChapter(e.target.value);
                if (errors.chapter) setErrors((prev) => ({ ...prev, chapter: '' }));
              }}
              placeholder="e.g., Operating System"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <datalist id="chapter-suggestions">
              {chapterSuggestions.map((ch) => (
                <option key={ch} value={ch} />
              ))}
            </datalist>
            {errors.chapter && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.chapter}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="note-topic"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Topic <span className="text-rose-500">*</span>
            </label>
            <input
              id="note-topic"
              type="text"
              list="topic-suggestions"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errors.topic) setErrors((prev) => ({ ...prev, topic: '' }));
              }}
              placeholder="e.g., Process Management"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <datalist id="topic-suggestions">
              {topicSuggestions.map((tp) => (
                <option key={tp} value={tp} />
              ))}
            </datalist>
            {errors.topic && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errors.topic}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="note-subtopic"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Subtopic (optional)
            </label>
            <input
              id="note-subtopic"
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g., CPU Scheduling"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="note-tags"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Tags (comma-separated)
            </label>
            <input
              id="note-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., OS, Scheduling, High-Yield"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="note-revision-status"
              className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Revision Status
            </label>
            <select
              id="note-revision-status"
              value={revisionStatus}
              onChange={(e) => setRevisionStatus(e.target.value as RevisionStatus)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {REVISION_STATUS_ORDER.map((st) => (
                <option key={st} value={st}>
                  {REVISION_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4 dark:border-slate-800">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={important}
              onChange={(e) => setImportant(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600"
            />
            <span>Mark as High-Yield / Important</span>
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={favorite}
              onChange={(e) => setFavorite(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-500 accent-amber-500"
            />
            <span>Add to Favorites</span>
          </label>
        </div>
      </section>

      {/* Important Points Builder */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Important Exam Points (Quick Takeaways)
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Add concise one-line facts or formulas for quick pre-exam revision.
        </p>

        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={newPointInput}
            onChange={(e) => setNewPointInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImportantPoint();
              }
            }}
            placeholder="Type an important exam fact and press Add..."
            aria-label="New important point"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddImportantPoint}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Point</span>
          </button>
        </div>

        {importantPoints.length > 0 && (
          <ul className="mt-3 space-y-2">
            {importantPoints.map((pt, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <span>{pt}</span>
                <button
                  type="button"
                  onClick={() =>
                    setImportantPoints((prev) => prev.filter((_, i) => i !== idx))
                  }
                  aria-label={`Remove point ${idx + 1}`}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Markdown Editor + Live Preview */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <label
              htmlFor="note-markdown-content"
              className="text-sm font-semibold text-slate-900 dark:text-white"
            >
              Markdown Content <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste ChatGPT-generated Markdown directly—tables, headings, lists, and code blocks render automatically.
            </p>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setEditorMode('write')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
                editorMode === 'write'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('split')}
              className={`hidden items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium lg:inline-flex ${
                editorMode === 'split'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Split Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('preview')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
                editorMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {errors.content && (
          <p className="mb-2 text-xs font-medium text-rose-600 dark:text-rose-400">
            {errors.content}
          </p>
        )}

        <div
          className={`grid gap-4 ${
            editorMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {(editorMode === 'write' || editorMode === 'split') && (
            <textarea
              id="note-markdown-content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
              }}
              rows={18}
              placeholder="# Topic Heading&#10;&#10;Paste or write your Markdown notes here..."
              className="min-h-[420px] w-full rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          )}

          {(editorMode === 'preview' || editorMode === 'split') && (
            <div className="min-h-[420px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </section>
    </form>
  );
};
