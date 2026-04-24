import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainSite from './MainSite';
import ArticlesPage from './ArticlesPage';
import ArticleDetailPage from './ArticleDetailPage';
import GalleryPage from './GalleryPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import { clearAdminToken, getAdminToken } from './api';

export default function AppRouter() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    setIsAdminLoggedIn(!!getAdminToken());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                onLogout={() => {
                  clearAdminToken();
                  setIsAdminLoggedIn(false);
                }}
                onBackToSite={() => window.location.href = '/'}
              />
            ) : (
              <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
