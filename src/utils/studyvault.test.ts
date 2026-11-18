import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  deriveChapters,
  deriveSubjects,
  getAdjacentNotes,
  getAllNotes,
  getNoteById,
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

test('static index loads notes and every referenced HTML file exists in public/', () => {
  const notes = getAllNotes();
  assert.ok(notes.length >= 8);

  for (const note of notes) {
    assert.ok(note.id);
    assert.ok(note.file.startsWith('notes/'));
    const diskPath = path.resolve(process.cwd(), 'public', note.file);
    assert.equal(fs.existsSync(diskPath), true, `Missing HTML file: ${note.file}`);
  }

  const linear = getNoteById('linear-equations');
  assert.ok(linear);
  assert.equal(linear.subjectSlug, 'mathematics');
});

test('deriveSubjects and deriveChapters calculate counts accurately from index', () => {
  const notes = getAllNotes();
  const subjects = deriveSubjects(notes);
  const math = subjects.find((s) => s.slug === 'mathematics');
  assert.ok(math);
  assert.equal(math.noteCount, 3);
  assert.equal(math.chapterCount, 2);
  assert.equal(math.topicCount, 3);

  const mathChapters = deriveChapters(notes, 'mathematics');
  assert.equal(mathChapters.length, 2);
  const algebra = mathChapters.find((c) => c.slug === 'algebra');
  assert.ok(algebra);
  assert.equal(algebra.noteCount, 2);
  assert.deepEqual(
    algebra.notes.map((n) => n.id),
    ['linear-equations', 'quadratic-equations']
  );
});

test('getAdjacentNotes returns previous and next notes cleanly', () => {
  const notes = getAllNotes();
  const first = getAdjacentNotes(notes[0].id, notes);
  assert.equal(first.prev, null);
  assert.equal(first.next?.id, notes[1].id);

  const last = getAdjacentNotes(notes[notes.length - 1].id, notes);
  assert.equal(last.prev?.id, notes[notes.length - 2].id);
  assert.equal(last.next, null);
});

test('resolveNoteUrl supports local dev root and GitHub Pages /DSSSB-/ base paths', () => {
  assert.equal(
    resolveNoteUrl('notes/mathematics/algebra/linear-equations.html', '/'),
    '/notes/mathematics/algebra/linear-equations.html'
  );
  assert.equal(
    resolveNoteUrl('notes/mathematics/algebra/linear-equations.html', '/DSSSB-/'),
    '/DSSSB-/notes/mathematics/algebra/linear-equations.html'
  );
  assert.throws(() => resolveNoteUrl('https://evil.example/a.html', '/'));
  assert.throws(() => resolveNoteUrl('../secret.html', '/'));
});

test('sanitizeNoteHtml removes unsafe elements/handlers and extracts section headings', () => {
  const dirty = `
    <article>
      <h1>Main Title</h1>
      <script>alert("xss")</script>
      <iframe src="https://evil.test"></iframe>
      <p onclick="alert(1)">Hello <a href="javascript:alert(2)">link</a></p>
      <h2>Section One</h2>
      <p>Exam preparation text here.</p>
      <h3>Key Formula</h3>
    </article>
  `;
  const clean = sanitizeNoteHtml(dirty);
  assert.equal(clean.html.includes('<script'), false);
  assert.equal(clean.html.includes('<iframe'), false);
  assert.equal(clean.html.includes('onclick='), false);
  assert.equal(clean.html.includes('javascript:'), false);
  assert.deepEqual(
    clean.headings.map((h) => h.text),
    ['Section One', 'Key Formula']
  );
  assert.ok(clean.html.includes('id="sec-section-one"'));
  assert.ok(clean.wordCount >= 5);
});

test('isSpaFallbackHtml detects SPA shell responses when static HTML is missing', () => {
  assert.equal(isSpaFallbackHtml('<div id="root"></div>'), true);
  assert.equal(isSpaFallbackHtml('<article><h1>Notes</h1></article>'), false);
});

test('filterAndSortNotes filters by subjectSlug, chapterSlug, tag, query, and sorts', () => {
  const notes = getAllNotes();
  const filtered = filterAndSortNotes(notes, {
    ...createDefaultFilterState(),
    subjectSlug: 'computer-science',
    chapterSlug: 'operating-system',
    query: 'scheduling',
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'process-management');
  assert.equal(hasActiveFilters({ ...createDefaultFilterState(), tag: 'os' }), true);

  assert.ok(getAvailableChapterOptions(notes, 'mathematics').length === 2);
  assert.ok(getAllTags(notes).includes('algebra'));

  const stats = getStaticDashboardStats(notes);
  assert.equal(stats.totalNotes, notes.length);
  assert.equal(stats.totalSubjects, 4);
});
