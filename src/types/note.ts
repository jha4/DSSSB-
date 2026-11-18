export interface StaticNoteMeta {
  id: string;
  title: string;
  subject: string;
  subjectSlug: string;
  chapter: string;
  chapterSlug: string;
  topic: string;
  tags: string[];
  date: string;
  summary: string;
  file: string;
}

export interface DerivedSubject {
  name: string;
  slug: string;
  noteCount: number;
  chapterCount: number;
  topicCount: number;
}

export interface DerivedChapter {
  name: string;
  slug: string;
  subject: string;
  subjectSlug: string;
  noteCount: number;
  topicCount: number;
  notes: StaticNoteMeta[];
}

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export interface NoteFilterState {
  query: string;
  subjectSlug: string;
  chapterSlug: string;
  tag: string;
  sortBy: SortOption;
}

export interface NoteHeading {
  id: string;
  text: string;
  level: number;
}
