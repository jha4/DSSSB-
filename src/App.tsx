import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/ToastContainer';
import { StudyVaultProvider } from './context/StudyVaultContext';
import { AllNotesPage } from './pages/AllNotesPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { DashboardPage } from './pages/DashboardPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { NoteReaderPage } from './pages/NoteReaderPage';
import { RecentlyViewedPage } from './pages/RecentlyViewedPage';
import { RevisionPage } from './pages/RevisionPage';
import { SettingsPage } from './pages/SettingsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TopicsPage } from './pages/TopicsPage';

export default function App() {
  return (
    <StudyVaultProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/notes" element={<AllNotesPage />} />
            <Route path="/notes/new" element={<NoteEditorPage />} />
            <Route path="/notes/:id" element={<NoteReaderPage />} />
            <Route path="/notes/:id/edit" element={<NoteEditorPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/chapters" element={<ChaptersPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/revision" element={<RevisionPage />} />
            <Route path="/recent" element={<RecentlyViewedPage />} />
            <Route path="/import-export" element={<ImportExportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </HashRouter>
    </StudyVaultProvider>
  );
}
