import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StudyVaultProvider } from './context/StudyVaultContext';
import { AllNotesPage } from './pages/AllNotesPage';
import { ChaptersPage } from './pages/ChaptersPage';
import { DashboardPage } from './pages/DashboardPage';
import { NoteReaderPage } from './pages/NoteReaderPage';
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
            <Route path="/notes/:id" element={<NoteReaderPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:subjectSlug" element={<ChaptersPage />} />
            <Route
              path="/subjects/:subjectSlug/:chapterSlug"
              element={<TopicsPage />}
            />
            <Route path="/chapters" element={<ChaptersPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </StudyVaultProvider>
  );
}
