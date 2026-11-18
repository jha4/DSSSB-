import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { NoteCard } from '../components/NoteCard';
import { useStudyVault } from '../context/StudyVaultContext';
import type { Note } from '../types/note';

export const FavoritesPage: React.FC = () => {
  const { notes, settings, toggleFavorite, deleteNote, notify } = useStudyVault();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const favoriteNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((n) => {
      if (!n.favorite) return false;
      if (subject && n.subject.toLowerCase() !== subject.toLowerCase()) return false;
      if (q) {
        const hay = `${n.title} ${n.subject} ${n.chapter} ${n.topic} ${n.content}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [notes, query, subject]);

  const subjectOptions = useMemo(() => {
    const set = new Set(notes.filter((n) => n.favorite).map((n) => n.subject));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  const handleDeleteRequest = (note: Note) => {
    if (settings.confirmBeforeDelete) {
      setNoteToDelete(note);
    } else {
      deleteNote(note.id);
      notify(`Deleted "${note.title}"`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search favorite notes..."
            aria-label="Search favorite notes"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-3 pl-10 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <select
          aria-label="Filter favorites by subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 sm:w-56 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <option value="">All Subjects</option>
          {subjectOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {favoriteNotes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Star className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
          <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
            No favorite notes yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Star your highest-yield exam notes from All Notes or the Note Reader to keep them here.
          </p>
          <Link
            to="/notes"
            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 dark:bg-indigo-500"
          >
            Browse All Notes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favoriteNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onToggleFavorite={toggleFavorite}
              onDeleteRequest={handleDeleteRequest}
              onCopied={(title) => notify(`Copied "${title}" Markdown`, 'success')}
              onExported={(title) => notify(`Exported "${title}.md"`, 'success')}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(noteToDelete)}
        title="Delete favorite note?"
        description={
          noteToDelete
            ? `"${noteToDelete.title}" will be permanently deleted.`
            : ''
        }
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
            notify(`Deleted "${noteToDelete.title}"`);
            setNoteToDelete(null);
          }
        }}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
};
