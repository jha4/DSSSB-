import React, { useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookMarked,
  BookOpen,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useStudyVault } from '../context/StudyVaultContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/notes', label: 'All Notes', icon: FileText },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/chapters', label: 'Chapters', icon: FolderKanban },
  { to: '/topics', label: 'Topics', icon: Layers },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-3 py-4 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between px-3 pb-4">
          <Link
            to="/"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 text-slate-900 dark:text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
              <GraduationCap className="h-4.5 w-4.5" />
            </span>
            <span className="text-base font-bold tracking-tight">StudyVault</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Primary navigation" className="mt-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <BookMarked className="h-3.5 w-3.5" />
            <span>Static Library</span>
          </span>
          <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="no-print fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-50 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-xs sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base dark:text-slate-100">
              {pageTitle}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};
