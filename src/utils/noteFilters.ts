import type { Note, NoteFilterState, SubjectItem } from '../types/note';

export function createDefaultFilterState(): NoteFilterState {
  return {
    query: '',
    subject: '',
    chapter: '',
    topic: '',
    tag: '',
    favoritesOnly: false,
    importantOnly: false,
    revisionStatus: 'all',
    sortBy: 'newest',
  };
}

export function hasActiveFilters(filter: NoteFilterState): boolean {
  return Boolean(
    filter.query.trim() ||
      filter.subject ||
      filter.chapter ||
      filter.topic ||
      filter.tag ||
      filter.favoritesOnly ||
      filter.importantOnly ||
      filter.revisionStatus !== 'all'
  );
}

export function filterAndSortNotes(notes: Note[], filter: NoteFilterState): Note[] {
  const queryTokens = filter.query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const subjectLower = filter.subject.trim().toLowerCase();
  const chapterLower = filter.chapter.trim().toLowerCase();
  const topicLower = filter.topic.trim().toLowerCase();
  const tagLower = filter.tag.trim().toLowerCase();

  const filtered = notes.filter((note) => {
    if (subjectLower && note.subject.trim().toLowerCase() !== subjectLower) {
      return false;
    }
    if (chapterLower && note.chapter.trim().toLowerCase() !== chapterLower) {
      return false;
    }
    if (topicLower && note.topic.trim().toLowerCase() !== topicLower) {
      return false;
    }
    if (
      tagLower &&
      !note.tags.some((t) => t.trim().toLowerCase() === tagLower)
    ) {
      return false;
    }
    if (filter.favoritesOnly && !note.favorite) {
      return false;
    }
    if (filter.importantOnly && !note.important) {
      return false;
    }
    if (
      filter.revisionStatus !== 'all' &&
      note.revisionStatus !== filter.revisionStatus
    ) {
      return false;
    }

    if (queryTokens.length > 0) {
      const haystack = [
        note.title,
        note.subject,
        note.chapter,
        note.topic,
        note.subtopic,
        note.content,
        note.tags.join(' '),
        note.importantPoints.join(' '),
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
        const cmp = a.createdAt.localeCompare(b.createdAt);
        if (cmp !== 0) return cmp;
        return a.title.localeCompare(b.title);
      }
      case 'updated': {
        const cmp = b.updatedAt.localeCompare(a.updatedAt);
        if (cmp !== 0) return cmp;
        return b.createdAt.localeCompare(a.createdAt);
      }
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'newest':
      default: {
        const cmp = b.createdAt.localeCompare(a.createdAt);
        if (cmp !== 0) return cmp;
        const upd = b.updatedAt.localeCompare(a.updatedAt);
        if (upd !== 0) return upd;
        return a.title.localeCompare(b.title);
      }
    }
  });

  return sorted;
}

export function getAvailableChapters(notes: Note[], subject?: string): string[] {
  const subjectLower = subject?.trim().toLowerCase() ?? '';
  const set = new Set<string>();
  for (const note of notes) {
    if (subjectLower && note.subject.trim().toLowerCase() !== subjectLower) {
      continue;
    }
    const ch = note.chapter.trim();
    if (ch) set.add(ch);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getAvailableTopics(
  notes: Note[],
  subject?: string,
  chapter?: string
): string[] {
  const subjectLower = subject?.trim().toLowerCase() ?? '';
  const chapterLower = chapter?.trim().toLowerCase() ?? '';
  const set = new Set<string>();
  for (const note of notes) {
    if (subjectLower && note.subject.trim().toLowerCase() !== subjectLower) {
      continue;
    }
    if (chapterLower && note.chapter.trim().toLowerCase() !== chapterLower) {
      continue;
    }
    const tp = note.topic.trim();
    if (tp) set.add(tp);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getAllTags(notes: Note[]): string[] {
  const set = new Set<string>();
  for (const note of notes) {
    for (const tag of note.tags) {
      const cleaned = tag.trim();
      if (cleaned) set.add(cleaned);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export interface SubjectStats {
  name: string;
  noteCount: number;
  chapterCount: number;
  topicCount: number;
  revisedOrMasteredCount: number;
  favoriteCount: number;
}

export interface DashboardStats {
  totalNotes: number;
  totalSubjects: number;
  totalChapters: number;
  totalTopics: number;
  favoriteCount: number;
  importantCount: number;
  revisedOrMasteredCount: number;
  masteredCount: number;
  learningCount: number;
  notStartedCount: number;
  subjectBreakdown: SubjectStats[];
}

export function getDashboardStats(
  notes: Note[],
  subjects: SubjectItem[]
): DashboardStats {
  const chapterKeys = new Set<string>();
  const topicKeys = new Set<string>();
  const subjectNames = new Set<string>(subjects.map((s) => s.name));

  let favoriteCount = 0;
  let importantCount = 0;
  let revisedOrMasteredCount = 0;
  let masteredCount = 0;
  let learningCount = 0;
  let notStartedCount = 0;

  const subjectMap = new Map<
    string,
    {
      noteCount: number;
      chapters: Set<string>;
      topics: Set<string>;
      revisedOrMasteredCount: number;
      favoriteCount: number;
    }
  >();

  for (const s of subjects) {
    subjectMap.set(s.name, {
      noteCount: 0,
      chapters: new Set(),
      topics: new Set(),
      revisedOrMasteredCount: 0,
      favoriteCount: 0,
    });
  }

  for (const note of notes) {
    const subj = note.subject.trim() || 'Uncategorized';
    const chap = note.chapter.trim() || 'General';
    const top = note.topic.trim() || 'General';

    subjectNames.add(subj);
    chapterKeys.add(`${subj.toLowerCase()}::${chap.toLowerCase()}`);
    topicKeys.add(`${subj.toLowerCase()}::${chap.toLowerCase()}::${top.toLowerCase()}`);

    if (note.favorite) favoriteCount += 1;
    if (note.important) importantCount += 1;
    if (note.revisionStatus === 'revised' || note.revisionStatus === 'mastered') {
      revisedOrMasteredCount += 1;
    }
    if (note.revisionStatus === 'mastered') masteredCount += 1;
    else if (note.revisionStatus === 'learning') learningCount += 1;
    else if (note.revisionStatus === 'not_started') notStartedCount += 1;

    let entry = subjectMap.get(subj);
    if (!entry) {
      entry = {
        noteCount: 0,
        chapters: new Set(),
        topics: new Set(),
        revisedOrMasteredCount: 0,
        favoriteCount: 0,
      };
      subjectMap.set(subj, entry);
    }
    entry.noteCount += 1;
    entry.chapters.add(chap.toLowerCase());
    entry.topics.add(`${chap.toLowerCase()}::${top.toLowerCase()}`);
    if (note.revisionStatus === 'revised' || note.revisionStatus === 'mastered') {
      entry.revisedOrMasteredCount += 1;
    }
    if (note.favorite) entry.favoriteCount += 1;
  }

  const subjectBreakdown: SubjectStats[] = Array.from(subjectMap.entries()).map(
    ([name, data]) => ({
      name,
      noteCount: data.noteCount,
      chapterCount: data.chapters.size,
      topicCount: data.topics.size,
      revisedOrMasteredCount: data.revisedOrMasteredCount,
      favoriteCount: data.favoriteCount,
    })
  );

  return {
    totalNotes: notes.length,
    totalSubjects: subjectNames.size,
    totalChapters: chapterKeys.size,
    totalTopics: topicKeys.size,
    favoriteCount,
    importantCount,
    revisedOrMasteredCount,
    masteredCount,
    learningCount,
    notStartedCount,
    subjectBreakdown,
  };
}
