import type { RevisionStatus } from '../types/note';

export const REVISION_STATUS_LABELS: Record<RevisionStatus, string> = {
  not_started: 'Not Started',
  learning: 'Learning',
  revised: 'Revised',
  mastered: 'Mastered',
};

export const REVISION_STATUS_ORDER: RevisionStatus[] = [
  'not_started',
  'learning',
  'revised',
  'mastered',
];

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate.length === 10 ? `${isoDate}T00:00:00` : isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function sanitizeFileSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'note'
  );
}
