import type {
  DerivedSubject,
  NoteFilterState,
  StaticNoteMeta,
} from '../types/note';
import { deriveSubjects } from './noteLoader';

export function createDefaultFilterState(): NoteFilterState {
  return {
    query: '',
    subjectSlug: '',
    chapterSlug: '',
    tag: '',
    sortBy: 'newest',
  };
}

export function hasActiveFilters(filter: NoteFilterState): boolean {
  return Boolean(
    filter.query.trim() ||
      filter.subjectSlug ||
      filter.chapterSlug ||
      filter.tag
  );
}

export function filterAndSortNotes(
  notes: StaticNoteMeta[],
  filter: NoteFilterState
): StaticNoteMeta[] {
  const queryTokens = filter.query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const subjectSlugLower = filter.subjectSlug.trim().toLowerCase();
  const chapterSlugLower = filter.chapterSlug.trim().toLowerCase();
  const tagLower = filter.tag.trim().toLowerCase();

  const filtered = notes.filter((note) => {
    if (
      subjectSlugLower &&
      note.subjectSlug.trim().toLowerCase() !== subjectSlugLower
    ) {
      return false;
    }
    if (
      chapterSlugLower &&
      note.chapterSlug.trim().toLowerCase() !== chapterSlugLower
    ) {
      return false;
    }
    if (
      tagLower &&
      !note.tags.some((t) => t.trim().toLowerCase() === tagLower)
    ) {
      return false;
    }

    if (queryTokens.length > 0) {
      const haystack = [
        note.title,
        note.subject,
        note.chapter,
        note.topic,
        note.summary,
        note.tags.join(' '),
      ]
        .join('\n')
        .toLowerCase();

      for (const token of queryTokens) {
        if (!haystack.includes(token)) {
          return false;
        }
      }
    }

    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (filter.sortBy) {
      case 'oldest': {
        const cmp = a.date.localeCompare(b.date);
        return cmp !== 0 ? cmp : a.title.localeCompare(b.title);
      }
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'newest':
      default: {
        const cmp = b.date.localeCompare(a.date);
        return cmp !== 0 ? cmp : a.title.localeCompare(b.title);
      }
    }
  });

  return sorted;
}

export function getAvailableChapterOptions(
  notes: StaticNoteMeta[],
  subjectSlug?: string
): { name: string; slug: string }[] {
  const subjectLower = subjectSlug?.trim().toLowerCase() ?? '';
  const map = new Map<string, string>();

  for (const note of notes) {
    if (
      subjectLower &&
      note.subjectSlug.trim().toLowerCase() !== subjectLower
    ) {
      continue;
    }
    const slug = note.chapterSlug.trim().toLowerCase();
    if (slug && !map.has(slug)) {
      map.set(slug, note.chapter.trim());
    }
  }

  return Array.from(map.entries())
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAllTags(notes: StaticNoteMeta[]): string[] {
  const set = new Set<string>();
  for (const note of notes) {
    for (const tag of note.tags) {
      const cleaned = tag.trim();
      if (cleaned) set.add(cleaned);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export interface StaticDashboardStats {
  totalNotes: number;
  totalSubjects: number;
  totalChapters: number;
  totalTopics: number;
  subjectBreakdown: DerivedSubject[];
}

export function getStaticDashboardStats(
  notes: StaticNoteMeta[]
): StaticDashboardStats {
  const chapterKeys = new Set<string>();
  const topicKeys = new Set<string>();

  for (const note of notes) {
    const subj = note.subjectSlug.trim().toLowerCase();
    const chap = note.chapterSlug.trim().toLowerCase();
    const top = note.topic.trim().toLowerCase();
    chapterKeys.add(`${subj}::${chap}`);
    topicKeys.add(`${subj}::${chap}::${top}`);
  }

  const subjectBreakdown = deriveSubjects(notes);

  return {
    totalNotes: notes.length,
    totalSubjects: subjectBreakdown.length,
    totalChapters: chapterKeys.size,
    totalTopics: topicKeys.size,
    subjectBreakdown,
  };
}
