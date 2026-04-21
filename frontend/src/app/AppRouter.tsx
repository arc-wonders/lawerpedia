import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainSite from './MainSite';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';

export default function AppRouter() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminDashboard
                onLogout={() => setIsAdminLoggedIn(false)}
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
