import type { SubjectColorKey } from '../types/note';

export const SUBJECT_COLOR_OPTIONS: {
  key: SubjectColorKey;
  label: string;
  dotClass: string;
  barClass: string;
}[] = [
  { key: 'indigo', label: 'Indigo', dotClass: 'bg-indigo-600 dark:bg-indigo-400', barClass: 'bg-indigo-600 dark:bg-indigo-400' },
  { key: 'sky', label: 'Sky', dotClass: 'bg-sky-600 dark:bg-sky-400', barClass: 'bg-sky-600 dark:bg-sky-400' },
  { key: 'emerald', label: 'Emerald', dotClass: 'bg-emerald-600 dark:bg-emerald-400', barClass: 'bg-emerald-600 dark:bg-emerald-400' },
  { key: 'amber', label: 'Amber', dotClass: 'bg-amber-600 dark:bg-amber-400', barClass: 'bg-amber-600 dark:bg-amber-400' },
  { key: 'rose', label: 'Rose', dotClass: 'bg-rose-600 dark:bg-rose-400', barClass: 'bg-rose-600 dark:bg-rose-400' },
  { key: 'violet', label: 'Violet', dotClass: 'bg-violet-600 dark:bg-violet-400', barClass: 'bg-violet-600 dark:bg-violet-400' },
  { key: 'teal', label: 'Teal', dotClass: 'bg-teal-600 dark:bg-teal-400', barClass: 'bg-teal-600 dark:bg-teal-400' },
  { key: 'slate', label: 'Slate', dotClass: 'bg-slate-600 dark:bg-slate-400', barClass: 'bg-slate-600 dark:bg-slate-400' },
];

export function getSubjectColorMeta(key?: SubjectColorKey) {
  return (
    SUBJECT_COLOR_OPTIONS.find((item) => item.key === key) ??
    SUBJECT_COLOR_OPTIONS[0]
  );
}
