export type RevisionStatus = 'not_started' | 'learning' | 'revised' | 'mastered';

export type SubjectColorKey =
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'sky'
  | 'violet'
  | 'teal'
  | 'slate';

export interface Note {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
  content: string;
  importantPoints: string[];
  tags: string[];
  important: boolean;
  favorite: boolean;
  revisionStatus: RevisionStatus;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  description: string;
  color: SubjectColorKey;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultViewMode: 'grid' | 'list';
  readingFontSize: 'sm' | 'md' | 'lg';
  showImportantPointsBanner: boolean;
  confirmBeforeDelete: boolean;
}

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'updated';

export interface NoteFilterState {
  query: string;
  subject: string;
  chapter: string;
  topic: string;
  tag: string;
  favoritesOnly: boolean;
  importantOnly: boolean;
  revisionStatus: RevisionStatus | 'all';
  sortBy: SortOption;
}

export type DuplicateStrategy = 'duplicate' | 'skip' | 'overwrite';

export interface StudyVaultBackup {
  version: number;
  exportedAt: string;
  notes: Note[];
  subjects: SubjectItem[];
}
