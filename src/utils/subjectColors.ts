export interface SubjectColorMeta {
  dotClass: string;
  barClass: string;
}

const COLOR_PALETTE: SubjectColorMeta[] = [
  { dotClass: 'bg-indigo-600 dark:bg-indigo-400', barClass: 'bg-indigo-600 dark:bg-indigo-400' },
  { dotClass: 'bg-sky-600 dark:bg-sky-400', barClass: 'bg-sky-600 dark:bg-sky-400' },
  { dotClass: 'bg-emerald-600 dark:bg-emerald-400', barClass: 'bg-emerald-600 dark:bg-emerald-400' },
  { dotClass: 'bg-amber-600 dark:bg-amber-400', barClass: 'bg-amber-600 dark:bg-amber-400' },
  { dotClass: 'bg-rose-600 dark:bg-rose-400', barClass: 'bg-rose-600 dark:bg-rose-400' },
  { dotClass: 'bg-violet-600 dark:bg-violet-400', barClass: 'bg-violet-600 dark:bg-violet-400' },
  { dotClass: 'bg-teal-600 dark:bg-teal-400', barClass: 'bg-teal-600 dark:bg-teal-400' },
];

const KNOWN_SUBJECT_COLORS: Record<string, SubjectColorMeta> = {
  mathematics: COLOR_PALETTE[0],
  hindi: COLOR_PALETTE[3],
  'computer-science': COLOR_PALETTE[1],
  polity: COLOR_PALETTE[2],
  english: COLOR_PALETTE[5],
  reasoning: COLOR_PALETTE[4],
  history: COLOR_PALETTE[6],
};

export function getSubjectColorMeta(subjectSlug: string): SubjectColorMeta {
  const key = subjectSlug.trim().toLowerCase();
  if (KNOWN_SUBJECT_COLORS[key]) {
    return KNOWN_SUBJECT_COLORS[key];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
}
