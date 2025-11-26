import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts & Auth
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './components/auth/AdminRoute';

// Pages: Auth & General
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages: Content
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterPage from './pages/ChapterPage';
import ListPage from './pages/ListPage';
import SearchPage from './pages/SearchPage';
import RankingPage from './pages/RankingPage';

// Pages: User
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import LibraryPage from './pages/LibraryPage';
import NotificationsPage from './pages/NotificationsPage';

// Pages: Admin
import DashboardPage from './pages/admin/DashboardPage';

function App() {
  return (
    <AuthProvider>
      {/* Global Toast Configuration */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark-toast',
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid #33334d',
            borderRadius: '8px'
          },
        }}
      />
      
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/gioi-thieu" element={<AboutPage />} /> 

        {/* Content routes */}
        <Route path="/truyen-tranh/:slug" element={<ComicDetailPage />} />
        <Route path="/doc-truyen/:slug/:chapterName" element={<ChapterPage />} />
        
        <Route path="/the-loai/:slug" element={<ListPage />} />
        <Route path="/danh-sach" element={<ListPage />} />
        <Route path="/tim-kiem" element={<SearchPage />} />
        <Route path="/xep-hang" element={<RankingPage />} />
        <Route path="/thong-bao" element={<NotificationsPage />} />

        {/* Authenticated routes */}
        {/* Logic bảo vệ route đã được xử lý bên trong từng Page */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/lich-su" element={<HistoryPage />} />
        <Route path="/theo-doi" element={<LibraryPage />} />

        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<DashboardPage />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;