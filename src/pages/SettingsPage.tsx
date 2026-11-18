import React, { useState } from 'react';
import { Download, RotateCcw, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useStudyVault } from '../context/StudyVaultContext';
import { createJsonBackup, todayIsoDate } from '../utils/importExport';

export const SettingsPage: React.FC = () => {
  const {
    notes,
    subjects,
    settings,
    updateSettings,
    resetDemoData,
    clearAllNotes,
    notify,
  } = useStudyVault();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleDownloadBackup = () => {
    const backup = createJsonBackup(notes, subjects);
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyvault-backup-${todayIsoDate()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Downloaded full JSON backup', 'success');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Appearance & Reading Preferences */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Appearance &amp; Reading Preferences
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Preferences are stored locally in your browser via localStorage.
        </p>

        <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Theme */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Color Theme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between light and dark reading surfaces.
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {(['light', 'dark'] as const).map((themeOpt) => (
                <button
                  key={themeOpt}
                  type="button"
                  onClick={() => updateSettings({ theme: themeOpt })}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-medium capitalize ${
                    settings.theme === themeOpt
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {themeOpt}
                </button>
              ))}
            </div>
          </div>

          {/* Default View Mode */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Default Notes Layout
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preferred view when opening All Notes.
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {(['grid', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => updateSettings({ defaultViewMode: mode })}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-medium capitalize ${
                    settings.defaultViewMode === mode
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Font Size */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Reader Font Size
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controls body text size on the Note Reading Page.
              </p>
            </div>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              {(
                [
                  { key: 'sm', label: 'Small' },
                  { key: 'md', label: 'Medium' },
                  { key: 'lg', label: 'Large' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => updateSettings({ readingFontSize: opt.key })}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                    settings.readingFontSize === opt.key
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Show Important Points Banner */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Show Important Points Summary
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Display extracted exam takeaways above the Markdown note body.
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Show Important Points Summary"
              checked={settings.showImportantPointsBanner}
              onChange={(e) =>
                updateSettings({ showImportantPointsBanner: e.target.checked })
              }
              className="h-4.5 w-4.5 rounded border-slate-300 accent-indigo-600"
            />
          </div>

          {/* Confirm Before Delete */}
          <div className="flex items-center justify-between gap-4 py-4 last:pb-0">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Confirm Before Deleting Notes
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prompt with a confirmation modal before permanently deleting notes.
              </p>
            </div>
            <input
              type="checkbox"
              aria-label="Confirm Before Deleting Notes"
              checked={settings.confirmBeforeDelete}
              onChange={(e) =>
                updateSettings({ confirmBeforeDelete: e.target.checked })
              }
              className="h-4.5 w-4.5 rounded border-slate-300 accent-indigo-600"
            />
          </div>
        </div>
      </section>

      {/* Local Storage Data Management */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Local Storage Data Management
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Currently storing{' '}
          <strong className="tabular-nums text-slate-800 dark:text-slate-200">
            {notes.length}
          </strong>{' '}
          notes across{' '}
          <strong className="tabular-nums text-slate-800 dark:text-slate-200">
            {subjects.length}
          </strong>{' '}
          subjects offline in localStorage.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            <span>Download JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Sample Demo Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Notes</span>
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Restore sample demo notes?"
        description="This will replace your current notes and subjects with the built-in sample StudyVault notes. Export a JSON backup first if you want to keep your own notes."
        confirmLabel="Restore Demo Notes"
        destructive={false}
        onConfirm={() => {
          resetDemoData();
          setConfirmResetOpen(false);
          notify('Restored built-in sample notes and subjects', 'success');
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      <ConfirmDialog
        open={confirmClearOpen}
        title="Delete all notes from StudyVault?"
        description="Every note in localStorage will be permanently removed. Subjects and preferences will remain intact."
        confirmLabel="Clear All Notes"
        onConfirm={() => {
          clearAllNotes();
          setConfirmClearOpen(false);
          notify('Cleared all notes from localStorage');
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
