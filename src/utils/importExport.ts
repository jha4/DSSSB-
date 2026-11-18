import type {
  DuplicateStrategy,
  Note,
  RevisionStatus,
  StudyVaultBackup,
  SubjectItem,
} from '../types/note';

export function generateUniqueId(prefix = 'note'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const VALID_STATUSES: RevisionStatus[] = [
  'not_started',
  'learning',
  'revised',
  'mastered',
];

function normalizeRevisionStatus(value: unknown): RevisionStatus {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
    if (VALID_STATUSES.includes(normalized as RevisionStatus)) {
      return normalized as RevisionStatus;
    }
  }
  return 'not_started';
}

function cleanFilenameToTitle(filename?: string): string {
  if (!filename) return 'Untitled Exam Note';
  const base = filename.replace(/\.(md|markdown|txt)$/i, '').trim();
  if (!base) return 'Untitled Exam Note';
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseFrontmatter(raw: string): {
  meta: Record<string, string | string[] | boolean>;
  body: string;
} {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { meta: {}, body: normalized };
  }

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { meta: {}, body: normalized };
  }

  const yamlBlock = normalized.slice(4, endIndex);
  const body = normalized.slice(endIndex + 5).trimStart();
  const meta: Record<string, string | string[] | boolean> = {};

  let currentArrayKey: string | null = null;
  for (const rawLine of yamlBlock.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('- ') && currentArrayKey) {
      const existing = meta[currentArrayKey];
      const item = line.slice(2).trim().replace(/^["']|["']$/g, '');
      if (Array.isArray(existing) && item) {
        existing.push(item);
      }
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) {
      currentArrayKey = null;
      continue;
    }

    const key = line.slice(0, colonIdx).trim();
    const rawVal = line.slice(colonIdx + 1).trim();

    if (!rawVal) {
      meta[key] = [];
      currentArrayKey = key;
      continue;
    }

    currentArrayKey = null;

    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      const inner = rawVal.slice(1, -1);
      meta[key] = inner
        .split(',')
        .map((part) => part.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else if (rawVal === 'true' || rawVal === 'false') {
      meta[key] = rawVal === 'true';
    } else {
      meta[key] = rawVal.replace(/^["']|["']$/g, '');
    }
  }

  return { meta, body };
}

function extractImportantPointsFromMarkdown(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const points: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[1].toLowerCase();
      if (
        headingText.includes('important point') ||
        headingText.includes('key takeaway') ||
        headingText.includes('exam tip') ||
        headingText.includes('quick facts')
      ) {
        inSection = true;
        continue;
      } else if (inSection) {
        break;
      }
    }

    if (inSection) {
      const bullet = line.match(/^\s*(?:[-*+]|\d+\.)\s+(.+)$/);
      if (bullet && bullet[1].trim()) {
        points.push(bullet[1].trim());
      }
    }
  }

  return points.slice(0, 8);
}

export interface MarkdownImportDefaults {
  subject?: string;
  chapter?: string;
  topic?: string;
}

export function parseMarkdownToNoteDraft(
  rawText: string,
  filename?: string,
  defaults: MarkdownImportDefaults = {}
): Omit<Note, 'id'> {
  const { meta, body } = parseFrontmatter(rawText);
  const today = todayIsoDate();

  let title = typeof meta.title === 'string' ? meta.title.trim() : '';
  if (!title) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1].trim()) {
      title = h1Match[1].trim();
    } else {
      title = cleanFilenameToTitle(filename);
    }
  }

  const subject =
    (typeof meta.subject === 'string' && meta.subject.trim()) ||
    defaults.subject?.trim() ||
    'General Knowledge';
  const chapter =
    (typeof meta.chapter === 'string' && meta.chapter.trim()) ||
    defaults.chapter?.trim() ||
    'General';
  const topic =
    (typeof meta.topic === 'string' && meta.topic.trim()) ||
    defaults.topic?.trim() ||
    title;
  const subtopic = typeof meta.subtopic === 'string' ? meta.subtopic.trim() : '';

  let tags: string[] = [];
  if (Array.isArray(meta.tags)) {
    tags = meta.tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof meta.tags === 'string') {
    tags = meta.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  let importantPoints: string[] = [];
  if (Array.isArray(meta.importantPoints)) {
    importantPoints = meta.importantPoints.map((p) => String(p).trim()).filter(Boolean);
  } else {
    importantPoints = extractImportantPointsFromMarkdown(body);
  }

  const important =
    typeof meta.important === 'boolean' ? meta.important : importantPoints.length > 0;
  const favorite = typeof meta.favorite === 'boolean' ? meta.favorite : false;
  const revisionStatus = normalizeRevisionStatus(meta.revisionStatus);
  const createdAt =
    typeof meta.createdAt === 'string' && meta.createdAt.trim()
      ? meta.createdAt.trim()
      : today;
  const updatedAt =
    typeof meta.updatedAt === 'string' && meta.updatedAt.trim()
      ? meta.updatedAt.trim()
      : today;

  return {
    title,
    subject,
    chapter,
    topic,
    subtopic,
    content: body.trim(),
    importantPoints,
    tags,
    important,
    favorite,
    revisionStatus,
    createdAt,
    updatedAt,
  };
}

function escapeYamlString(value: string): string {
  const sanitized = value.replace(/"/g, '\\"');
  return `"${sanitized}"`;
}

export function noteToMarkdown(note: Note): string {
  const lines: string[] = [
    '---',
    `title: ${escapeYamlString(note.title)}`,
    `subject: ${escapeYamlString(note.subject)}`,
    `chapter: ${escapeYamlString(note.chapter)}`,
    `topic: ${escapeYamlString(note.topic)}`,
  ];

  if (note.subtopic) {
    lines.push(`subtopic: ${escapeYamlString(note.subtopic)}`);
  }

  if (note.tags.length > 0) {
    lines.push(`tags: [${note.tags.map(escapeYamlString).join(', ')}]`);
  } else {
    lines.push('tags: []');
  }

  lines.push(`important: ${note.important}`);
  lines.push(`favorite: ${note.favorite}`);
  lines.push(`revisionStatus: ${escapeYamlString(note.revisionStatus)}`);
  lines.push(`createdAt: ${escapeYamlString(note.createdAt)}`);
  lines.push(`updatedAt: ${escapeYamlString(note.updatedAt)}`);

  if (note.importantPoints.length > 0) {
    lines.push('importantPoints:');
    for (const pt of note.importantPoints) {
      lines.push(`  - ${escapeYamlString(pt)}`);
    }
  }

  lines.push('---', '');
  lines.push(note.content);

  return lines.join('\n');
}

export function createJsonBackup(
  notes: Note[],
  subjects: SubjectItem[]
): StudyVaultBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
    subjects,
  };
}

export interface ParsedJsonImportResult {
  notes: Note[];
  subjects: SubjectItem[];
  warnings: string[];
}

function normalizeRawNote(raw: unknown, index: number): Note | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === 'string' ? obj.title.trim() : '';
  const content = typeof obj.content === 'string' ? obj.content : '';

  if (!title && !content.trim()) {
    return null;
  }

  const today = todayIsoDate();
  const id =
    typeof obj.id === 'string' && obj.id.trim()
      ? obj.id.trim()
      : generateUniqueId(`import-${index}`);

  const tags = Array.isArray(obj.tags)
    ? obj.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const importantPoints = Array.isArray(obj.importantPoints)
    ? obj.importantPoints.map((p) => String(p).trim()).filter(Boolean)
    : [];

  return {
    id,
    title: title || `Imported Note ${index + 1}`,
    subject:
      typeof obj.subject === 'string' && obj.subject.trim()
        ? obj.subject.trim()
        : 'General Knowledge',
    chapter:
      typeof obj.chapter === 'string' && obj.chapter.trim()
        ? obj.chapter.trim()
        : 'General',
    topic:
      typeof obj.topic === 'string' && obj.topic.trim()
        ? obj.topic.trim()
        : title || 'Imported',
    subtopic: typeof obj.subtopic === 'string' ? obj.subtopic.trim() : '',
    content,
    importantPoints,
    tags,
    important: Boolean(obj.important),
    favorite: Boolean(obj.favorite),
    revisionStatus: normalizeRevisionStatus(obj.revisionStatus),
    createdAt:
      typeof obj.createdAt === 'string' && obj.createdAt.trim()
        ? obj.createdAt.trim()
        : today,
    updatedAt:
      typeof obj.updatedAt === 'string' && obj.updatedAt.trim()
        ? obj.updatedAt.trim()
        : today,
    lastViewedAt:
      typeof obj.lastViewedAt === 'string' ? obj.lastViewedAt : undefined,
  };
}

export function parseJsonImport(rawJson: string): ParsedJsonImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Invalid JSON syntax. Please check the file or pasted text.');
  }

  let rawNotes: unknown[] = [];
  let rawSubjects: unknown[] = [];

  if (Array.isArray(parsed)) {
    rawNotes = parsed;
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.notes)) {
      rawNotes = obj.notes;
    } else if (typeof obj.title === 'string' || typeof obj.content === 'string') {
      rawNotes = [obj];
    } else {
      throw new Error(
        'JSON must be an array of notes or an object containing a "notes" array.'
      );
    }
    if (Array.isArray(obj.subjects)) {
      rawSubjects = obj.subjects;
    }
  } else {
    throw new Error('Unsupported JSON structure.');
  }

  const warnings: string[] = [];
  const notes: Note[] = [];

  rawNotes.forEach((item, idx) => {
    const normalized = normalizeRawNote(item, idx);
    if (normalized) {
      notes.push(normalized);
    } else {
      warnings.push(`Skipped entry #${idx + 1} because it lacked both title and content.`);
    }
  });

  if (notes.length === 0) {
    throw new Error('No valid notes were found in the provided JSON.');
  }

  const subjects: SubjectItem[] = [];
  for (const item of rawSubjects) {
    if (item && typeof item === 'object') {
      const s = item as Record<string, unknown>;
      if (typeof s.name === 'string' && s.name.trim()) {
        subjects.push({
          id:
            typeof s.id === 'string' && s.id.trim()
              ? s.id.trim()
              : generateUniqueId('subj'),
          name: s.name.trim(),
          description: typeof s.description === 'string' ? s.description : '',
          color:
            typeof s.color === 'string'
              ? (s.color as SubjectItem['color'])
              : 'indigo',
        });
      }
    }
  }

  return { notes, subjects, warnings };
}

function noteSignature(note: Pick<Note, 'title' | 'subject' | 'chapter' | 'topic'>): string {
  return [
    note.title.trim().toLowerCase(),
    note.subject.trim().toLowerCase(),
    note.chapter.trim().toLowerCase(),
    note.topic.trim().toLowerCase(),
  ].join('::');
}

export interface MergeImportResult {
  notes: Note[];
  addedCount: number;
  skippedCount: number;
  updatedCount: number;
}

export function mergeImportedNotes(
  existingNotes: Note[],
  incomingNotes: Note[],
  strategy: DuplicateStrategy
): MergeImportResult {
  const result = [...existingNotes];
  const existingIds = new Set(existingNotes.map((n) => n.id));
  const existingSignatures = new Set(existingNotes.map((n) => noteSignature(n)));

  let addedCount = 0;
  let skippedCount = 0;
  let updatedCount = 0;

  for (const incoming of incomingNotes) {
    const sig = noteSignature(incoming);
    const idExists = existingIds.has(incoming.id);
    const sigExists = existingSignatures.has(sig);

    if (strategy === 'skip') {
      if (idExists || sigExists) {
        skippedCount += 1;
        continue;
      }
      const nextNote: Note = { ...incoming };
      result.unshift(nextNote);
      existingIds.add(nextNote.id);
      existingSignatures.add(sig);
      addedCount += 1;
    } else if (strategy === 'overwrite') {
      if (idExists) {
        const idx = result.findIndex((n) => n.id === incoming.id);
        if (idx !== -1) {
          result[idx] = { ...incoming };
          existingSignatures.add(sig);
          updatedCount += 1;
          continue;
        }
      }
      const nextId = existingIds.has(incoming.id) ? generateUniqueId('note') : incoming.id;
      const nextNote: Note = { ...incoming, id: nextId };
      result.unshift(nextNote);
      existingIds.add(nextId);
      existingSignatures.add(sig);
      addedCount += 1;
    } else {
      // 'duplicate' strategy: never overwrite existing notes; assign fresh ID if needed
      const finalId = idExists ? generateUniqueId('note') : incoming.id;
      const finalTitle = sigExists ? `${incoming.title} (Imported)` : incoming.title;
      const nextNote: Note = {
        ...incoming,
        id: finalId,
        title: finalTitle,
      };
      result.unshift(nextNote);
      existingIds.add(finalId);
      existingSignatures.add(noteSignature(nextNote));
      addedCount += 1;
    }
  }

  return {
    notes: result,
    addedCount,
    skippedCount,
    updatedCount,
  };
}
