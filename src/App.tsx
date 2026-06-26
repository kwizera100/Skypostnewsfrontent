import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import MaintenanceGate from './components/MaintenanceGate';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import CategoryPage from './pages/Category';
import ArticlePage from './pages/Article';
import AboutPage from './pages/About';
import NotFoundPage from './pages/NotFound';
import { AdminAuthProvider, useAdminAuth } from './admin/AdminAuth';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminArticles from './admin/AdminArticles';
import AdminArticleEditor from './admin/AdminArticleEditor';
import AdminUsers from './admin/AdminUsers';
import AdminMedia from './admin/AdminMedia';
import AdminAds from './admin/AdminAds';
import AdminCategories from './admin/AdminCategories';

function AdminApp() {
  const { user, loading } = useAdminAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <AdminLogin />;
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="articles/new" element={<AdminArticleEditor />} />
        <Route path="articles/:id/edit" element={<AdminArticleEditor />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<MaintenanceGate><Layout><HomePage /></Layout></MaintenanceGate>} />
        <Route path='/category/:slug' element={<MaintenanceGate><Layout><CategoryPage /></Layout></MaintenanceGate>} />
        <Route path='/article/:slug' element={<MaintenanceGate><Layout><ArticlePage /></Layout></MaintenanceGate>} />
        <Route path='/about' element={<MaintenanceGate><Layout><AboutPage /></Layout></MaintenanceGate>} />
        <Route path='/admin/*' element={<AdminAuthProvider><AdminApp /></AdminAuthProvider>} />
        <Route path='*' element={<MaintenanceGate><Layout><NotFoundPage /></Layout></MaintenanceGate>} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
