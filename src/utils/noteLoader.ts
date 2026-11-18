import notesIndexJson from '../data/notes-index.json';
import type {
  DerivedChapter,
  DerivedSubject,
  NoteHeading,
  StaticNoteMeta,
} from '../types/note';

export interface SanitizedNoteContent {
  html: string;
  headings: NoteHeading[];
  wordCount: number;
  readTimeMinutes: number;
}

export interface LoadedNoteContent extends SanitizedNoteContent {
  url: string;
}

const STATIC_NOTES: StaticNoteMeta[] = notesIndexJson as StaticNoteMeta[];
const noteHtmlCache = new Map<string, LoadedNoteContent>();

export function getAllNotes(): StaticNoteMeta[] {
  return STATIC_NOTES;
}

export function getNoteById(id: string): StaticNoteMeta | undefined {
  return STATIC_NOTES.find((note) => note.id === id);
}

export function getAdjacentNotes(
  id: string,
  notes: StaticNoteMeta[] = STATIC_NOTES
): { prev: StaticNoteMeta | null; next: StaticNoteMeta | null } {
  const index = notes.findIndex((n) => n.id === id);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? notes[index - 1] : null,
    next: index < notes.length - 1 ? notes[index + 1] : null,
  };
}

export function deriveSubjects(
  notes: StaticNoteMeta[] = STATIC_NOTES
): DerivedSubject[] {
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      noteCount: number;
      chapters: Set<string>;
      topics: Set<string>;
    }
  >();

  for (const note of notes) {
    const slug = note.subjectSlug.trim().toLowerCase();
    let entry = map.get(slug);
    if (!entry) {
      entry = {
        name: note.subject.trim(),
        slug,
        noteCount: 0,
        chapters: new Set(),
        topics: new Set(),
      };
      map.set(slug, entry);
    }
    entry.noteCount += 1;
    entry.chapters.add(note.chapterSlug.trim().toLowerCase());
    entry.topics.add(
      `${note.chapterSlug.trim().toLowerCase()}::${note.topic.trim().toLowerCase()}`
    );
  }

  return Array.from(map.values())
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      noteCount: item.noteCount,
      chapterCount: item.chapters.size,
      topicCount: item.topics.size,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function deriveChapters(
  notes: StaticNoteMeta[] = STATIC_NOTES,
  subjectSlug?: string
): DerivedChapter[] {
  const targetSubject = subjectSlug?.trim().toLowerCase() ?? '';
  const map = new Map<
    string,
    {
      name: string;
      slug: string;
      subject: string;
      subjectSlug: string;
      topics: Set<string>;
      notes: StaticNoteMeta[];
    }
  >();

  for (const note of notes) {
    const sSlug = note.subjectSlug.trim().toLowerCase();
    if (targetSubject && sSlug !== targetSubject) {
      continue;
    }
    const cSlug = note.chapterSlug.trim().toLowerCase();
    const key = `${sSlug}::${cSlug}`;
    let entry = map.get(key);
    if (!entry) {
      entry = {
        name: note.chapter.trim(),
        slug: cSlug,
        subject: note.subject.trim(),
        subjectSlug: sSlug,
        topics: new Set(),
        notes: [],
      };
      map.set(key, entry);
    }
    entry.topics.add(note.topic.trim().toLowerCase());
    entry.notes.push(note);
  }

  return Array.from(map.values())
    .map((item) => ({
      name: item.name,
      slug: item.slug,
      subject: item.subject,
      subjectSlug: item.subjectSlug,
      noteCount: item.notes.length,
      topicCount: item.topics.size,
      notes: item.notes,
    }))
    .sort((a, b) => {
      const subCmp = a.subject.localeCompare(b.subject);
      return subCmp !== 0 ? subCmp : a.name.localeCompare(b.name);
    });
}

export function resolveNoteUrl(
  filePath: string,
  baseUrl?: string
): string {
  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('Note file path is empty.');
  }
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) || trimmed.startsWith('//')) {
    throw new Error(`External or protocol URLs are not permitted: ${trimmed}`);
  }
  const cleanPath = trimmed.replace(/^\/+/, '');
  const segments = cleanPath.split('/');
  if (segments.some((seg) => seg === '..' || seg === '.')) {
    throw new Error(`Invalid relative segment in note path: ${trimmed}`);
  }

  const rawBase =
    baseUrl !== undefined
      ? baseUrl
      : (typeof import.meta !== 'undefined' &&
          (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL) ||
        '/';
  const normalizedBase = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  return `${normalizedBase}${cleanPath}`;
}

export function isSpaFallbackHtml(rawHtml: string): boolean {
  const trimmed = rawHtml.trim();
  if (!trimmed) return false;
  return (
    /<div\s+id=["']root["']/i.test(trimmed) ||
    (/<!doctype\s+html>/i.test(trimmed) && /<script[^>]+type=["']module["']/i.test(trimmed))
  );
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, ' ');
}

function slugifyHeading(text: string, usedIds: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/<[^>]+>/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-') || 'section';
  let candidate = `sec-${base}`;
  let counter = 2;
  while (usedIds.has(candidate)) {
    candidate = `sec-${base}-${counter}`;
    counter += 1;
  }
  usedIds.add(candidate);
  return candidate;
}

export function sanitizeNoteHtml(rawHtml: string): SanitizedNoteContent {
  let html = rawHtml;

  // Remove dangerous block elements and their contents
  const dangerousBlockTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'applet',
    'style',
    'form',
    'noscript',
    'template',
  ];
  for (const tag of dangerousBlockTags) {
    const blockRegex = new RegExp(
      `<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`,
      'gi'
    );
    html = html.replace(blockRegex, '');
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    html = html.replace(selfClosingRegex, '');
  }

  // Remove document-level metadata/head tags if accidentally included
  html = html.replace(/<\/?(?:html|head|body|meta|base|link|title)\b[^>]*>/gi, '');
  html = html.replace(/<!doctype[^>]*>/gi, '');

  // Strip inline event handlers (onClick, onload, onerror, etc.)
  html = html.replace(
    /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
    ''
  );

  // Neutralize javascript:, vbscript:, or data:text/html URLs in href/src/action
  html = html.replace(
    /\b(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|(?:javascript|vbscript|data:text\/html)[^\s>]*)/gi,
    '$1="#"'
  );

  // Wrap tables in a scrollable container so tables retain full width on desktop
  html = html.replace(
    /<table\b([^>]*)>([\s\S]*?)<\/table>/gi,
    '<div class="note-table-wrap"><table$1>$2</table></div>'
  );

  // Inject deterministic IDs into headings and extract outline
  const usedIds = new Set<string>();
  const allHeadings: NoteHeading[] = [];

  html = html.replace(
    /<(h[1-3])([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tagName: string, attrs: string, inner: string) => {
      const level = Number(tagName.slice(1));
      const plainText = decodeBasicEntities(inner.replace(/<[^>]+>/g, ''))
        .replace(/\s+/g, ' ')
        .trim();

      const idMatch = attrs.match(/\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      let id = idMatch ? (idMatch[1] ?? idMatch[2] ?? '').trim() : '';
      let updatedAttrs = attrs;

      if (!id) {
        id = slugifyHeading(plainText, usedIds);
        updatedAttrs = `${attrs} id="${id}"`;
      } else {
        usedIds.add(id);
      }

      if (plainText) {
        allHeadings.push({ id, text: plainText, level });
      }

      return `<${tagName}${updatedAttrs}>${inner}</${tagName}>`;
    }
  );

  const sectionHeadings = allHeadings.filter((h) => h.level >= 2);
  const headings = sectionHeadings.length > 0 ? sectionHeadings : allHeadings;

  const plainBody = decodeBasicEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = plainBody ? plainBody.split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.round(wordCount / 180));

  return {
    html: html.trim(),
    headings,
    wordCount,
    readTimeMinutes,
  };
}

export function clearNoteCache(): void {
  noteHtmlCache.clear();
}

export async function fetchNoteHtml(
  filePath: string,
  options: { signal?: AbortSignal; forceRefresh?: boolean } = {}
): Promise<LoadedNoteContent> {
  const url = resolveNoteUrl(filePath);

  if (!options.forceRefresh) {
    const cached = noteHtmlCache.get(url);
    if (cached) {
      return cached;
    }
  }

  const response = await fetch(url, {
    signal: options.signal,
    headers: {
      Accept: 'text/html, text/plain;q=0.9',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Note file could not be loaded (HTTP ${response.status}): ${filePath}`
    );
  }

  const rawHtml = await response.text();
  if (!rawHtml.trim()) {
    throw new Error(`Note HTML file is empty: ${filePath}`);
  }
  if (isSpaFallbackHtml(rawHtml)) {
    throw new Error(`Note HTML file was not found at "${filePath}".`);
  }

  const sanitized = sanitizeNoteHtml(rawHtml);
  const result: LoadedNoteContent = {
    ...sanitized,
    url,
  };
  noteHtmlCache.set(url, result);
  return result;
}
