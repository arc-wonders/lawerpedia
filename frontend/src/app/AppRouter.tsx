import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainSite from './MainSite';
import ArticlesPage from './ArticlesPage';
import ArticleDetailPage from './ArticleDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
