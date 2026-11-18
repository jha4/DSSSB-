import React, { useMemo } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookMarked,
  BookOpen,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Moon,
  Sun,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';

interface NavItem {
  to: string;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', mobileLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/notes', label: 'All Notes', mobileLabel: 'Notes', icon: FileText },
  { to: '/subjects', label: 'Subjects', mobileLabel: 'Subjects', icon: BookOpen },
  { to: '/chapters', label: 'Chapters', mobileLabel: 'Chapters', icon: FolderKanban },
  { to: '/topics', label: 'Topics', mobileLabel: 'Topics', icon: Layers },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, notes, subjects, chapters } = useStudyVault();
  const location = useLocation();

  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/notes') return 'All Notes';
    if (path.startsWith('/notes/')) return 'Note Reader';
    if (path === '/subjects') return 'Subjects';
    if (path === '/chapters') return 'Chapters';
    if (path === '/topics') return 'Topics';

    if (path.startsWith('/subjects/')) {
      const parts = path.split('/').filter(Boolean);
      const subjectSlug = parts[1];
      const chapterSlug = parts[2];
      const matchedSubject = subjects.find((s) => s.slug === subjectSlug);
      if (chapterSlug) {
        const matchedChapter = chapters.find(
          (c) => c.subjectSlug === subjectSlug && c.slug === chapterSlug
        );
        if (matchedChapter) {
          return `${matchedChapter.subject} / ${matchedChapter.name}`;
        }
      }
      if (matchedSubject) {
        return matchedSubject.name;
      }
      return 'Subject Explorer';
    }

    return 'StudyVault';
  }, [location.pathname, subjects, chapters]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden w-56 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <div className="sticky top-0 flex h-screen flex-col justify-between overflow-y-auto bg-white px-2.5 py-3.5 dark:bg-slate-900">
          <div>
            <Link
              to="/"
              className="flex items-center gap-2 px-2.5 pb-3.5 whitespace-nowrap shrink-0 text-slate-900 dark:text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold tracking-tight">StudyVault</span>
            </Link>

            <nav aria-label="Primary navigation" className="mt-1 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-slate-200 pt-2.5 dark:border-slate-800">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookMarked className="h-3 w-3" />
                <span>Static Library</span>
              </span>
              <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-12 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur-xs sm:px-5 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-2.5">
            <Link
              to="/"
              aria-label="StudyVault Home"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white lg:hidden dark:bg-indigo-500"
            >
              <GraduationCap className="h-3.5 w-3.5" />
            </Link>
            <h1 className="truncate text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
              {pageTitle}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="tabular-nums text-[11px] text-slate-500 lg:hidden dark:text-slate-400">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 pb-20 sm:px-5 sm:py-5 lg:px-6 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-xs lg:hidden dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.mobileLabel}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
