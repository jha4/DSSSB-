import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Edit3, Plus, Trash2, X } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useStudyVault } from '../context/StudyVaultContext';
import type { SubjectColorKey, SubjectItem } from '../types/note';
import { getDashboardStats } from '../utils/noteFilters';
import { getSubjectColorMeta, SUBJECT_COLOR_OPTIONS } from '../utils/subjectColors';

export const SubjectsPage: React.FC = () => {
  const { notes, subjects, addSubject, updateSubject, deleteSubject, notify } =
    useStudyVault();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<SubjectColorKey>('indigo');
  const [formError, setFormError] = useState('');

  const [subjectToDelete, setSubjectToDelete] = useState<SubjectItem | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string>('');

  const stats = useMemo(
    () => getDashboardStats(notes, subjects),
    [notes, subjects]
  );

  const breakdownByName = useMemo(() => {
    return new Map(stats.subjectBreakdown.map((b) => [b.name.toLowerCase(), b]));
  }, [stats.subjectBreakdown]);

  const openCreateForm = () => {
    setEditingSubject(null);
    setName('');
    setDescription('');
    setColor('indigo');
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (subj: SubjectItem) => {
    setEditingSubject(subj);
    setName(subj.name);
    setDescription(subj.description);
    setColor(subj.color);
    setFormError('');
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      const res = updateSubject(editingSubject.id, { name, description, color });
      if (!res.ok) {
        setFormError(res.error ?? 'Could not update subject.');
        return;
      }
      notify(`Updated subject "${name.trim()}"`, 'success');
    } else {
      const res = addSubject(name, description, color);
      if (!res.ok) {
        setFormError(res.error ?? 'Could not add subject.');
        return;
      }
      notify(`Added subject "${name.trim()}"`, 'success');
    }
    setFormOpen(false);
  };

  const openDeleteModal = (subj: SubjectItem) => {
    const others = subjects.filter((s) => s.id !== subj.id);
    setReassignTarget(others[0]?.name ?? '');
    setSubjectToDelete(subj);
  };

  const confirmDelete = () => {
    if (!subjectToDelete) return;
    const targetName = subjectToDelete.name;
    const count = breakdownByName.get(targetName.toLowerCase())?.noteCount ?? 0;
    deleteSubject(subjectToDelete.id, count > 0 ? reassignTarget : undefined);
    setSubjectToDelete(null);
    notify(
      count > 0 && reassignTarget
        ? `Deleted "${targetName}" and moved ${count} notes to "${reassignTarget}"`
        : `Deleted subject "${targetName}"`,
      'neutral'
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Subjects Directory
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Organize your exam syllabus into subjects. Renaming a subject updates all its notes automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Inline Add / Edit Form Panel */}
      {formOpen && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {editingSubject ? `Edit "${editingSubject.name}"` : 'Add New Subject'}
            </h3>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close subject form"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="subject-name-input"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Subject Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="subject-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError('');
                  }}
                  placeholder="e.g., Current Affairs"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="subject-desc-input"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Description (optional)
                </label>
                <input
                  id="subject-desc-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key syllabus areas covered"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Accent Color
              </span>
              <div className="flex flex-wrap gap-2">
                {SUBJECT_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setColor(opt.key)}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      color === opt.key
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${opt.dotClass}`} />
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {formError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500"
              >
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Subject Grid */}
      {subjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No subjects yet. Add your first subject to start organizing notes.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            <span>Add Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subj) => {
            const counts = breakdownByName.get(subj.name.toLowerCase());
            const noteCount = counts?.noteCount ?? 0;
            const chapterCount = counts?.chapterCount ?? 0;
            const topicCount = counts?.topicCount ?? 0;
            const revisedCount = counts?.revisedOrMasteredCount ?? 0;
            const pct = noteCount > 0 ? Math.round((revisedCount / noteCount) * 100) : 0;
            const colorMeta = getSubjectColorMeta(subj.color);

            return (
              <article
                key={subj.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {subj.name}
                      </h3>
                      {subj.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                          {subj.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(subj)}
                        aria-label={`Edit subject ${subj.name}`}
                        title="Edit subject"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(subj)}
                        aria-label={`Delete subject ${subj.name}`}
                        title="Delete subject"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="tabular-nums font-medium text-slate-900 dark:text-slate-200">
                      {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Mastered / Revised</span>
                    <span className="tabular-nums font-medium">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${colorMeta.barClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Link
                      to={`/notes?subject=${encodeURIComponent(subj.name)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <span>Open Notes</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Delete Subject Dialog */}
      {subjectToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-subject-title"
        >
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <h2
              id="delete-subject-title"
              className="text-base font-semibold text-slate-900 dark:text-white"
            >
              Delete "{subjectToDelete.name}"?
            </h2>
            {(() => {
              const count =
                breakdownByName.get(subjectToDelete.name.toLowerCase())?.noteCount ?? 0;
              const otherSubjects = subjects.filter((s) => s.id !== subjectToDelete.id);

              return (
                <div className="mt-2 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  {count > 0 ? (
                    <>
                      <p>
                        This subject currently contains{' '}
                        <strong className="text-slate-900 dark:text-white">
                          {count} {count === 1 ? 'note' : 'notes'}
                        </strong>
                        . Choose what should happen to those notes:
                      </p>
                      <div>
                        <label
                          htmlFor="reassign-subject-select"
                          className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          Action for existing notes
                        </label>
                        <select
                          id="reassign-subject-select"
                          value={reassignTarget}
                          onChange={(e) => setReassignTarget(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                          {otherSubjects.map((s) => (
                            <option key={s.id} value={s.name}>
                              Move notes to "{s.name}"
                            </option>
                          ))}
                          <option value="">Delete notes in this subject</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <p>This subject has no notes and can be safely removed.</p>
                  )}
                </div>
              );
            })()}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 dark:bg-rose-600"
              >
                Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
