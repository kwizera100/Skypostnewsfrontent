import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import CategoryPage from './pages/Category';
import ArticlePage from './pages/Article';
import NotFoundPage from './pages/NotFound';
import { AdminAuthProvider, useAdminAuth } from './admin/AdminAuth';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminArticles from './admin/AdminArticles';
import AdminArticleEditor from './admin/AdminArticleEditor';
import AdminUsers from './admin/AdminUsers';
import AdminMedia from './admin/AdminMedia';

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
        <Route path="media" element={<AdminMedia />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Layout><HomePage /></Layout>} />
        <Route path='/category/:slug' element={<Layout><CategoryPage /></Layout>} />
        <Route path='/article/:slug' element={<Layout><ArticlePage /></Layout>} />
        <Route path='/admin/*' element={<AdminAuthProvider><AdminApp /></AdminAuthProvider>} />
        <Route path='*' element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
