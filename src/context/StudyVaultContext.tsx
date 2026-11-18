import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, DEFAULT_SUBJECTS, SEED_NOTES } from '../data/seedData';
import type {
  AppSettings,
  DuplicateStrategy,
  Note,
  RevisionStatus,
  SubjectColorKey,
  SubjectItem,
} from '../types/note';
import {
  generateUniqueId,
  mergeImportedNotes,
  todayIsoDate,
  type MergeImportResult,
} from '../utils/importExport';

const STORAGE_KEYS = {
  notes: 'studyvault_notes_v1',
  subjects: 'studyvault_subjects_v1',
  recent: 'studyvault_recent_ids_v1',
  settings: 'studyvault_settings_v1',
};

export interface NoteInput {
  title: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic?: string;
  content: string;
  importantPoints?: string[];
  tags?: string[];
  important?: boolean;
  favorite?: boolean;
  revisionStatus?: RevisionStatus;
}

export interface ToastMessage {
  id: string;
  text: string;
  tone?: 'neutral' | 'success' | 'error';
}

interface StudyVaultContextValue {
  notes: Note[];
  subjects: SubjectItem[];
  recentNoteIds: string[];
  settings: AppSettings;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  notify: (text: string, tone?: ToastMessage['tone']) => void;
  addNote: (input: NoteInput) => Note;
  updateNote: (id: string, input: Partial<NoteInput>) => Note | null;
  deleteNote: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleImportant: (id: string) => void;
  setRevisionStatus: (id: string, status: RevisionStatus) => void;
  recordNoteView: (id: string) => void;
  clearRecentViews: () => void;
  addSubject: (name: string, description: string, color: SubjectColorKey) => { ok: boolean; error?: string };
  updateSubject: (
    id: string,
    updates: { name: string; description: string; color: SubjectColorKey }
  ) => { ok: boolean; error?: string };
  deleteSubject: (id: string, reassignTo?: string) => void;
  ensureSubjectExists: (name: string) => void;
  importNotesBatch: (
    incomingNotes: Note[],
    strategy: DuplicateStrategy,
    incomingSubjects?: SubjectItem[]
  ) => MergeImportResult;
  updateSettings: (partial: Partial<AppSettings>) => void;
  toggleTheme: () => void;
  resetDemoData: () => void;
  clearAllNotes: () => void;
}

const StudyVaultContext = createContext<StudyVaultContextValue | null>(null);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const StudyVaultProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notes, setNotes] = useState<Note[]>(() =>
    loadFromStorage<Note[]>(STORAGE_KEYS.notes, SEED_NOTES)
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>(() =>
    loadFromStorage<SubjectItem[]>(STORAGE_KEYS.subjects, DEFAULT_SUBJECTS)
  );
  const [recentNoteIds, setRecentNoteIds] = useState<string[]>(() =>
    loadFromStorage<string[]>(
      STORAGE_KEYS.recent,
      ['note-os-process-mgmt', 'note-polity-fundamental-rights', 'note-dbms-normalization']
    )
  );
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...loadFromStorage<Partial<AppSettings>>(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  }));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
    } catch {
      // Ignore storage quota errors silently
    }
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
    } catch {
      // Ignore
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentNoteIds));
    } catch {
      // Ignore
    }
  }, [recentNoteIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // Ignore
    }
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback((text: string, tone: ToastMessage['tone'] = 'neutral') => {
    const id = generateUniqueId('toast');
    setToasts((prev) => [...prev.slice(-3), { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const ensureSubjectExists = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubjects((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return [
        ...prev,
        {
          id: generateUniqueId('subj'),
          name: trimmed,
          description: '',
          color: 'indigo',
        },
      ];
    });
  }, []);

  const addNote = useCallback(
    (input: NoteInput): Note => {
      const today = todayIsoDate();
      const cleanedSubject = input.subject.trim();
      ensureSubjectExists(cleanedSubject);

      const newNote: Note = {
        id: generateUniqueId('note'),
        title: input.title.trim(),
        subject: cleanedSubject,
        chapter: input.chapter.trim(),
        topic: input.topic.trim(),
        subtopic: (input.subtopic ?? '').trim(),
        content: input.content,
        importantPoints: (input.importantPoints ?? [])
          .map((p) => p.trim())
          .filter(Boolean),
        tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
        important: Boolean(input.important),
        favorite: Boolean(input.favorite),
        revisionStatus: input.revisionStatus ?? 'not_started',
        createdAt: today,
        updatedAt: today,
      };

      setNotes((prev) => [newNote, ...prev]);
      return newNote;
    },
    [ensureSubjectExists]
  );

  const updateNote = useCallback(
    (id: string, input: Partial<NoteInput>): Note | null => {
      let updatedNote: Note | null = null;
      const today = todayIsoDate();

      if (input.subject?.trim()) {
        ensureSubjectExists(input.subject.trim());
      }

      setNotes((prev) =>
        prev.map((note) => {
          if (note.id !== id) return note;
          updatedNote = {
            ...note,
            title: input.title !== undefined ? input.title.trim() : note.title,
            subject: input.subject !== undefined ? input.subject.trim() : note.subject,
            chapter: input.chapter !== undefined ? input.chapter.trim() : note.chapter,
            topic: input.topic !== undefined ? input.topic.trim() : note.topic,
            subtopic: input.subtopic !== undefined ? input.subtopic.trim() : note.subtopic,
            content: input.content !== undefined ? input.content : note.content,
            importantPoints:
              input.importantPoints !== undefined
                ? input.importantPoints.map((p) => p.trim()).filter(Boolean)
                : note.importantPoints,
            tags:
              input.tags !== undefined
                ? input.tags.map((t) => t.trim()).filter(Boolean)
                : note.tags,
            important:
              input.important !== undefined ? input.important : note.important,
            favorite: input.favorite !== undefined ? input.favorite : note.favorite,
            revisionStatus:
              input.revisionStatus !== undefined
                ? input.revisionStatus
                : note.revisionStatus,
            updatedAt: today,
          };
          return updatedNote;
        })
      );
      return updatedNote;
    },
    [ensureSubjectExists]
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setRecentNoteIds((prev) => prev.filter((rid) => rid !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, favorite: !n.favorite } : n))
    );
  }, []);

  const toggleImportant = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, important: !n.important } : n))
    );
  }, []);

  const setRevisionStatus = useCallback((id: string, status: RevisionStatus) => {
    const today = todayIsoDate();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, revisionStatus: status, updatedAt: today } : n
      )
    );
  }, []);

  const recordNoteView = useCallback((id: string) => {
    const now = new Date().toISOString();
    setRecentNoteIds((prev) => [id, ...prev.filter((rid) => rid !== id)].slice(0, 25));
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lastViewedAt: now } : n))
    );
  }, []);

  const clearRecentViews = useCallback(() => {
    setRecentNoteIds([]);
  }, []);

  const addSubject = useCallback(
    (
      name: string,
      description: string,
      color: SubjectColorKey
    ): { ok: boolean; error?: string } => {
      const trimmed = name.trim();
      if (!trimmed) {
        return { ok: false, error: 'Subject name is required.' };
      }
      const exists = subjects.some(
        (s) => s.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (exists) {
        return { ok: false, error: `Subject "${trimmed}" already exists.` };
      }
      setSubjects((prev) => [
        ...prev,
        {
          id: generateUniqueId('subj'),
          name: trimmed,
          description: description.trim(),
          color,
        },
      ]);
      return { ok: true };
    },
    [subjects]
  );

  const updateSubject = useCallback(
    (
      id: string,
      updates: { name: string; description: string; color: SubjectColorKey }
    ): { ok: boolean; error?: string } => {
      const trimmed = updates.name.trim();
      if (!trimmed) {
        return { ok: false, error: 'Subject name cannot be empty.' };
      }
      const duplicate = subjects.some(
        (s) => s.id !== id && s.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) {
        return { ok: false, error: `Another subject named "${trimmed}" already exists.` };
      }

      const target = subjects.find((s) => s.id === id);
      if (!target) return { ok: false, error: 'Subject not found.' };

      const oldName = target.name;
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: trimmed,
                description: updates.description.trim(),
                color: updates.color,
              }
            : s
        )
      );

      if (oldName !== trimmed) {
        setNotes((prev) =>
          prev.map((n) =>
            n.subject.toLowerCase() === oldName.toLowerCase()
              ? { ...n, subject: trimmed }
              : n
          )
        );
      }

      return { ok: true };
    },
    [subjects]
  );

  const deleteSubject = useCallback(
    (id: string, reassignTo?: string) => {
      const target = subjects.find((s) => s.id === id);
      if (!target) return;
      setSubjects((prev) => prev.filter((s) => s.id !== id));

      if (reassignTo && reassignTo.trim()) {
        const nextSubject = reassignTo.trim();
        ensureSubjectExists(nextSubject);
        setNotes((prev) =>
          prev.map((n) =>
            n.subject.toLowerCase() === target.name.toLowerCase()
              ? { ...n, subject: nextSubject }
              : n
          )
        );
      } else {
        setNotes((prev) =>
          prev.filter((n) => n.subject.toLowerCase() !== target.name.toLowerCase())
        );
      }
    },
    [subjects, ensureSubjectExists]
  );

  const importNotesBatch = useCallback(
    (
      incomingNotes: Note[],
      strategy: DuplicateStrategy,
      incomingSubjects: SubjectItem[] = []
    ): MergeImportResult => {
      const mergeOutcome = mergeImportedNotes(notes, incomingNotes, strategy);
      setNotes(mergeOutcome.notes);

      const mergedNames = new Set<string>();
      for (const n of incomingNotes) {
        if (n.subject.trim()) mergedNames.add(n.subject.trim());
      }

      setSubjects((prev) => {
        const next = [...prev];
        const existingLower = new Set(next.map((s) => s.name.toLowerCase()));

        for (const sub of incomingSubjects) {
          if (!existingLower.has(sub.name.toLowerCase())) {
            next.push(sub);
            existingLower.add(sub.name.toLowerCase());
          }
        }
        for (const name of mergedNames) {
          if (!existingLower.has(name.toLowerCase())) {
            next.push({
              id: generateUniqueId('subj'),
              name,
              description: '',
              color: 'indigo',
            });
            existingLower.add(name.toLowerCase());
          }
        }
        return next;
      });

      return mergeOutcome;
    },
    [notes]
  );

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    setNotes(SEED_NOTES);
    setSubjects(DEFAULT_SUBJECTS);
    setRecentNoteIds([
      'note-os-process-mgmt',
      'note-polity-fundamental-rights',
      'note-dbms-normalization',
    ]);
  }, []);

  const clearAllNotes = useCallback(() => {
    setNotes([]);
    setRecentNoteIds([]);
  }, []);

  const value = useMemo<StudyVaultContextValue>(
    () => ({
      notes,
      subjects,
      recentNoteIds,
      settings,
      toasts,
      dismissToast,
      notify,
      addNote,
      updateNote,
      deleteNote,
      toggleFavorite,
      toggleImportant,
      setRevisionStatus,
      recordNoteView,
      clearRecentViews,
      addSubject,
      updateSubject,
      deleteSubject,
      ensureSubjectExists,
      importNotesBatch,
      updateSettings,
      toggleTheme,
      resetDemoData,
      clearAllNotes,
    }),
    [
      notes,
      subjects,
      recentNoteIds,
      settings,
      toasts,
      dismissToast,
      notify,
      addNote,
      updateNote,
      deleteNote,
      toggleFavorite,
      toggleImportant,
      setRevisionStatus,
      recordNoteView,
      clearRecentViews,
      addSubject,
      updateSubject,
      deleteSubject,
      ensureSubjectExists,
      importNotesBatch,
      updateSettings,
      toggleTheme,
      resetDemoData,
      clearAllNotes,
    ]
  );

  return (
    <StudyVaultContext.Provider value={value}>
      {children}
    </StudyVaultContext.Provider>
  );
};

export function useStudyVault(): StudyVaultContextValue {
  const ctx = useContext(StudyVaultContext);
  if (!ctx) {
    throw new Error('useStudyVault must be used within a StudyVaultProvider');
  }
  return ctx;
}
