import test from 'node:test';
import assert from 'node:assert/strict';
import type { Note, SubjectItem } from '../types/note';
import {
  createDefaultFilterState,
  filterAndSortNotes,
  getAvailableChapters,
  getAvailableTopics,
  getDashboardStats,
  hasActiveFilters,
} from './noteFilters';
import {
  createJsonBackup,
  mergeImportedNotes,
  noteToMarkdown,
  parseJsonImport,
  parseMarkdownToNoteDraft,
} from './importExport';
import {
  estimateReadTimeMinutes,
  extractHeadings,
  stripMarkdownSnippet,
} from './markdownHelpers';

const sampleNotes: Note[] = [
  {
    id: 'n1',
    title: 'Process Management & Scheduling',
    subject: 'Computer Science',
    chapter: 'Operating System',
    topic: 'Process Management',
    subtopic: 'CPU Scheduling',
    content: '# Process Management\n\nDeadlock conditions and FCFS scheduling.',
    importantPoints: ['Mutual exclusion is required for deadlock'],
    tags: ['OS', 'Scheduling'],
    important: true,
    favorite: true,
    revisionStatus: 'revised',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-12',
  },
  {
    id: 'n2',
    title: 'Fundamental Rights (Articles 12-35)',
    subject: 'Polity',
    chapter: 'Indian Constitution',
    topic: 'Fundamental Rights',
    subtopic: 'Right to Equality',
    content: '# Fundamental Rights\n\nArticle 14 guarantees equality before law.',
    importantPoints: ['Article 32 is the heart and soul of the Constitution'],
    tags: ['Polity', 'Constitution'],
    important: true,
    favorite: false,
    revisionStatus: 'learning',
    createdAt: '2026-11-15',
    updatedAt: '2026-11-15',
  },
  {
    id: 'n3',
    title: 'Introduction to Operating System',
    subject: 'Computer Science',
    chapter: 'Operating System',
    topic: 'Introduction',
    subtopic: '',
    content: '# OS Overview\n\nKernel manages hardware resources.',
    importantPoints: [],
    tags: ['OS', 'Fundamentals'],
    important: false,
    favorite: false,
    revisionStatus: 'mastered',
    createdAt: '2026-11-05',
    updatedAt: '2026-11-08',
  },
];

const sampleSubjects: SubjectItem[] = [
  { id: 's1', name: 'Computer Science', description: 'CS core', color: 'indigo' },
  { id: 's2', name: 'Polity', description: 'Constitution', color: 'emerald' },
  { id: 's3', name: 'Mathematics', description: 'Quant', color: 'amber' },
];

test('filterAndSortNotes filters by combined subject, chapter, topic, and query', () => {
  const filter = {
    ...createDefaultFilterState(),
    subject: 'Computer Science',
    chapter: 'Operating System',
    topic: 'Process Management',
    query: 'deadlock scheduling',
  };
  const res = filterAndSortNotes(sampleNotes, filter);
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 'n1');
  assert.equal(hasActiveFilters(filter), true);
});

test('filterAndSortNotes sorts newest, oldest, and alphabetical', () => {
  const newest = filterAndSortNotes(sampleNotes, {
    ...createDefaultFilterState(),
    sortBy: 'newest',
  });
  assert.deepEqual(
    newest.map((n) => n.id),
    ['n2', 'n1', 'n3']
  );

  const oldest = filterAndSortNotes(sampleNotes, {
    ...createDefaultFilterState(),
    sortBy: 'oldest',
  });
  assert.deepEqual(
    oldest.map((n) => n.id),
    ['n3', 'n1', 'n2']
  );

  const alpha = filterAndSortNotes(sampleNotes, {
    ...createDefaultFilterState(),
    sortBy: 'title_asc',
  });
  assert.deepEqual(
    alpha.map((n) => n.id),
    ['n2', 'n3', 'n1']
  );
});

test('cascading chapter and topic getters narrow options accurately', () => {
  assert.deepEqual(getAvailableChapters(sampleNotes, 'Computer Science'), [
    'Operating System',
  ]);
  assert.deepEqual(
    getAvailableTopics(sampleNotes, 'Computer Science', 'Operating System'),
    ['Introduction', 'Process Management']
  );
});

test('getDashboardStats computes totals and subject breakdowns accurately', () => {
  const stats = getDashboardStats(sampleNotes, sampleSubjects);
  assert.equal(stats.totalNotes, 3);
  assert.equal(stats.totalSubjects, 3);
  assert.equal(stats.totalTopics, 3);
  assert.equal(stats.favoriteCount, 1);
  assert.equal(stats.revisedOrMasteredCount, 2);
  assert.equal(stats.masteredCount, 1);

  const cs = stats.subjectBreakdown.find((s) => s.name === 'Computer Science');
  assert.ok(cs);
  assert.equal(cs.noteCount, 2);
  assert.equal(cs.chapterCount, 1);
  assert.equal(cs.topicCount, 2);
});

test('noteToMarkdown and parseMarkdownToNoteDraft round-trip cleanly', () => {
  const md = noteToMarkdown(sampleNotes[0]);
  const parsed = parseMarkdownToNoteDraft(md, 'fallback.md');
  assert.equal(parsed.title, sampleNotes[0].title);
  assert.equal(parsed.subject, sampleNotes[0].subject);
  assert.equal(parsed.chapter, sampleNotes[0].chapter);
  assert.equal(parsed.topic, sampleNotes[0].topic);
  assert.deepEqual(parsed.tags, sampleNotes[0].tags);
  assert.equal(parsed.favorite, true);
  assert.equal(parsed.revisionStatus, 'revised');
  assert.deepEqual(parsed.importantPoints, sampleNotes[0].importantPoints);
});

test('parseMarkdownToNoteDraft handles plain ChatGPT markdown without frontmatter', () => {
  const raw = `# Indian Monsoon Mechanism\n\nMonsoons are seasonal winds.\n\n## Important Points\n- ITCZ shifts northward in summer\n- El Nino weakens Indian monsoon`;
  const parsed = parseMarkdownToNoteDraft(raw, 'monsoon-notes.md', {
    subject: 'Geography',
    chapter: 'Climatology',
  });
  assert.equal(parsed.title, 'Indian Monsoon Mechanism');
  assert.equal(parsed.subject, 'Geography');
  assert.equal(parsed.chapter, 'Climatology');
  assert.equal(parsed.importantPoints.length, 2);
  assert.equal(parsed.important, true);
});

test('JSON backup export, parse, and duplicate-safe merge', () => {
  const backup = createJsonBackup(sampleNotes, sampleSubjects);
  const parsed = parseJsonImport(JSON.stringify(backup));
  assert.equal(parsed.notes.length, 3);
  assert.equal(parsed.subjects.length, 3);

  const dupResult = mergeImportedNotes(sampleNotes, [sampleNotes[0]], 'duplicate');
  assert.equal(dupResult.addedCount, 1);
  assert.equal(dupResult.notes.length, 4);
  assert.notEqual(dupResult.notes[0].id, sampleNotes[0].id);
  assert.match(dupResult.notes[0].title, /\(Imported\)$/);

  const skipResult = mergeImportedNotes(sampleNotes, [sampleNotes[0]], 'skip');
  assert.equal(skipResult.skippedCount, 1);
  assert.equal(skipResult.notes.length, 3);
});

test('extractHeadings ignores headings inside fenced code blocks', () => {
  const md = [
    '# Title',
    '## Section One',
    '```bash',
    '# Not a heading',
    '```',
    '### Subsection',
  ].join('\n');
  const headings = extractHeadings(md);
  assert.deepEqual(
    headings.map((h) => h.text),
    ['Title', 'Section One', 'Subsection']
  );
  assert.ok(estimateReadTimeMinutes(md) >= 1);
  assert.ok(stripMarkdownSnippet(md).includes('Title'));
  const tableMd = '| Org | HQ |\n| :--- | :--- |\n| WHO | Geneva |';
  assert.equal(stripMarkdownSnippet(tableMd).includes(':---'), false);
  assert.ok(stripMarkdownSnippet(tableMd).includes('Geneva'));
});
