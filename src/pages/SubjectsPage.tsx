import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';
import { getSubjectColorMeta } from '../utils/subjectColors';

export const SubjectsPage: React.FC = () => {
  const { subjects, chapters } = useStudyVault();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Subjects Directory
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Subjects, chapter counts, and topic totals are derived automatically from the static notes index.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No subjects yet
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Subjects appear here automatically as soon as you add note entries to{' '}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] dark:bg-slate-800">
              src/data/notes-index.json
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subj) => {
            const colorMeta = getSubjectColorMeta(subj.slug);
            const subjectChapters = chapters.filter(
              (c) => c.subjectSlug === subj.slug
            );

            return (
              <article
                key={subj.slug}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${colorMeta.dotClass}`}
                      />
                      <Link
                        to={`/subjects/${subj.slug}`}
                        className="truncate text-sm font-semibold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                      >
                        {subj.name}
                      </Link>
                    </div>
                    <BookOpen className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="tabular-nums font-medium text-slate-900 dark:text-slate-200">
                      {subj.noteCount} {subj.noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {subj.chapterCount}{' '}
                      {subj.chapterCount === 1 ? 'chapter' : 'chapters'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {subj.topicCount}{' '}
                      {subj.topicCount === 1 ? 'topic' : 'topics'}
                    </span>
                  </div>

                  {subjectChapters.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-slate-100 pt-2.5 dark:border-slate-800">
                      <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                        Chapters
                      </p>
                      <ul className="space-y-1">
                        {subjectChapters.map((chap) => (
                          <li key={chap.slug}>
                            <Link
                              to={`/subjects/${subj.slug}/${chap.slug}`}
                              className="flex items-center justify-between text-xs text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
                            >
                              <span className="truncate">{chap.name}</span>
                              <span className="tabular-nums shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                                {chap.noteCount}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                  <Link
                    to={`/notes?subject=${encodeURIComponent(subj.slug)}`}
                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    Filter Notes
                  </Link>
                  <Link
                    to={`/subjects/${subj.slug}`}
                    className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <span>Explore Chapters</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
