import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { StaticNoteMeta } from '../types/note';
import {
  deriveChapters,
  deriveSubjects,
  getAdjacentNotes,
  getAllNotes,
  isSpaFallbackHtml,
  resolveNoteUrl,
  sanitizeNoteHtml,
} from './noteLoader';
import {
  createDefaultFilterState,
  filterAndSortNotes,
  getAllTags,
  getAvailableChapterOptions,
  getStaticDashboardStats,
  hasActiveFilters,
} from './noteFilters';

const FIXTURE_NOTES: StaticNoteMeta[] = [
  {
    id: 'linear-equations',
    title: 'Linear Equations in One & Two Variables',
    subject: 'Mathematics',
    subjectSlug: 'mathematics',
    chapter: 'Algebra',
    chapterSlug: 'algebra',
    topic: 'Linear Equations',
    tags: ['algebra', 'equations'],
    date: '2026-11-18',
    summary: 'Standard forms and consistency ratio conditions.',
    file: 'notes/mathematics/algebra/linear-equations.html',
  },
  {
    id: 'quadratic-equations',
    title: 'Quadratic Equations: Roots & Discriminant',
    subject: 'Mathematics',
    subjectSlug: 'mathematics',
    chapter: 'Algebra',
    chapterSlug: 'algebra',
    topic: 'Quadratic Equations',
    tags: ['algebra', 'roots'],
    date: '2026-11-17',
    summary: 'Discriminant and sum/product of roots.',
    file: 'notes/mathematics/algebra/quadratic-equations.html',
  },
  {
    id: 'process-management',
    title: 'Process Management & CPU Scheduling',
    subject: 'Computer Science',
    subjectSlug: 'computer-science',
    chapter: 'Operating System',
    chapterSlug: 'operating-system',
    topic: 'Process Management',
    tags: ['os', 'scheduling'],
    date: '2026-11-12',
    summary: 'Process states, PCB, and scheduling algorithms.',
    file: 'notes/computer-science/operating-system/process-management.html',
  },
];

test('all entries registered in notes-index.json point to valid HTML files in public/', () => {
  const notes = getAllNotes();
  assert.equal(Array.isArray(notes), true);

  for (const note of notes) {
    assert.ok(note.id, 'Note entry must have an id');
    assert.ok(note.file.startsWith('notes/'), 'Note file must live under notes/');
    const diskPath = path.resolve(process.cwd(), 'public', note.file);
    assert.equal(fs.existsSync(diskPath), true, `Missing HTML file: ${note.file}`);
  }
});

test('deriveSubjects and deriveChapters calculate counts accurately from index metadata', () => {
  const subjects = deriveSubjects(FIXTURE_NOTES);
  assert.equal(subjects.length, 2);

  const math = subjects.find((s) => s.slug === 'mathematics');
  assert.ok(math);
  assert.equal(math.noteCount, 2);
  assert.equal(math.chapterCount, 1);
  assert.equal(math.topicCount, 2);

  const mathChapters = deriveChapters(FIXTURE_NOTES, 'mathematics');
  assert.equal(mathChapters.length, 1);
  assert.equal(mathChapters[0].noteCount, 2);
  assert.deepEqual(
    mathChapters[0].notes.map((n) => n.id),
    ['linear-equations', 'quadratic-equations']
  );
});

test('getAdjacentNotes returns previous and next notes cleanly', () => {
  const first = getAdjacentNotes(FIXTURE_NOTES[0].id, FIXTURE_NOTES);
  assert.equal(first.prev, null);
  assert.equal(first.next?.id, FIXTURE_NOTES[1].id);

  const last = getAdjacentNotes(
    FIXTURE_NOTES[FIXTURE_NOTES.length - 1].id,
    FIXTURE_NOTES
  );
  assert.equal(last.prev?.id, FIXTURE_NOTES[FIXTURE_NOTES.length - 2].id);
  assert.equal(last.next, null);
});

test('resolveNoteUrl builds root Vercel paths and rejects unsafe paths', () => {
  assert.equal(
    resolveNoteUrl('notes/mathematics/algebra/linear-equations.html', '/'),
    '/notes/mathematics/algebra/linear-equations.html'
  );
  assert.throws(() => resolveNoteUrl('https://evil.example/a.html', '/'));
  assert.throws(() => resolveNoteUrl('../secret.html', '/'));
});

test('sanitizeNoteHtml removes unsafe elements/handlers, wraps tables, and extracts headings', () => {
  const dirty = `
    <article>
      <h1>Main Title</h1>
      <script>alert("xss")</script>
      <iframe src="https://evil.test"></iframe>
      <p onclick="alert(1)">Hello <a href="javascript:alert(2)">link</a></p>
      <h2>Section One</h2>
      <table><tr><th>A</th></tr><tr><td>1</td></tr></table>
      <h3>Key Formula</h3>
    </article>
  `;
  const clean = sanitizeNoteHtml(dirty);
  assert.equal(clean.html.includes('<script'), false);
  assert.equal(clean.html.includes('<iframe'), false);
  assert.equal(clean.html.includes('onclick='), false);
  assert.equal(clean.html.includes('javascript:'), false);
  assert.ok(clean.html.includes('<div class="note-table-wrap"><table>'));
  assert.deepEqual(
    clean.headings.map((h) => h.text),
    ['Section One', 'Key Formula']
  );
  assert.ok(clean.html.includes('id="sec-section-one"'));
});

test('isSpaFallbackHtml detects SPA shell responses when static HTML is missing', () => {
  assert.equal(isSpaFallbackHtml('<div id="root"></div>'), true);
  assert.equal(isSpaFallbackHtml('<article><h1>Notes</h1></article>'), false);
});

test('filterAndSortNotes filters by subjectSlug, chapterSlug, tag, query, and sorts', () => {
  const filtered = filterAndSortNotes(FIXTURE_NOTES, {
    ...createDefaultFilterState(),
    subjectSlug: 'computer-science',
    chapterSlug: 'operating-system',
    query: 'scheduling',
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'process-management');
  assert.equal(hasActiveFilters({ ...createDefaultFilterState(), tag: 'os' }), true);

  assert.equal(getAvailableChapterOptions(FIXTURE_NOTES, 'mathematics').length, 1);
  assert.ok(getAllTags(FIXTURE_NOTES).includes('algebra'));

  const stats = getStaticDashboardStats(FIXTURE_NOTES);
  assert.equal(stats.totalNotes, 3);
  assert.equal(stats.totalSubjects, 2);
});
