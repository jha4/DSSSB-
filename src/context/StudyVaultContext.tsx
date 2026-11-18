import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { DerivedChapter, DerivedSubject, StaticNoteMeta } from '../types/note';
import { deriveChapters, deriveSubjects, getAllNotes } from '../utils/noteLoader';

export type ThemeMode = 'light' | 'dark';
export type ReadingFontSize = 'sm' | 'md' | 'lg';
export type ViewMode = 'grid' | 'list';

interface StudyVaultContextValue {
  notes: StaticNoteMeta[];
  subjects: DerivedSubject[];
  chapters: DerivedChapter[];
  theme: ThemeMode;
  toggleTheme: () => void;
  readingFontSize: ReadingFontSize;
  setReadingFontSize: (size: ReadingFontSize) => void;
  defaultViewMode: ViewMode;
  setDefaultViewMode: (mode: ViewMode) => void;
}

const StudyVaultContext = createContext<StudyVaultContextValue | null>(null);

export const StudyVaultProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const notes = useMemo(() => getAllNotes(), []);
  const subjects = useMemo(() => deriveSubjects(notes), [notes]);
  const chapters = useMemo(() => deriveChapters(notes), [notes]);

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [readingFontSize, setReadingFontSize] = useState<ReadingFontSize>('md');
  const [defaultViewMode, setDefaultViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<StudyVaultContextValue>(
    () => ({
      notes,
      subjects,
      chapters,
      theme,
      toggleTheme,
      readingFontSize,
      setReadingFontSize,
      defaultViewMode,
      setDefaultViewMode,
    }),
    [
      notes,
      subjects,
      chapters,
      theme,
      toggleTheme,
      readingFontSize,
      defaultViewMode,
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
