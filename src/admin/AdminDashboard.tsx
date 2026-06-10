import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from './AdminAuth';

interface Stats { articles: number; published: number; categories: number; users: number; }

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  const bg = color + '20';
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
        style={{ backgroundColor: bg }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/articles?pageSize=5', { headers }),
      axios.get('/api/stats', { headers }).catch(() => ({ data: null })),
    ]).then(([arts, statsRes]) => {
      const artData = arts.data.data || arts.data;
      const s = statsRes.data;
      if (s) {
        setStats({
          articles: s.articles,
          published: s.published,
          categories: s.categories,
          users: s.users,
        });
      }
      setRecentArticles(artData.slice(0, 5));
    }).catch(() => {});
  }, [token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={stats?.articles ?? '—'} icon="📰" color="#e05c1a" />
        <StatCard label="Published" value={stats?.published ?? '—'} icon="✅" color="#059669" />
        <StatCard label="Categories" value={stats?.categories ?? '—'} icon="🏷️" color="#1D4ED8" />
        <StatCard label="Users" value={stats?.users ?? '—'} icon="👥" color="#7C3AED" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Article', to: '/admin/articles/new', icon: '✏️', color: '#e05c1a' },
          { label: 'All Articles', to: '/admin/articles', icon: '📋', color: '#1D4ED8' },
          { label: 'Upload Media', to: '/admin/media', icon: '🖼️', color: '#059669' },
          { label: 'Manage Users', to: '/admin/users', icon: '👥', color: '#7C3AED' },
        ].map(({ label, to, icon }) => (
          <Link key={to} to={to}
            className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow group">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs font-bold text-gray-700 group-hover:text-orange-600 transition-colors">{label}</div>
          </Link>
        ))}
      </div>

      {/* Recent articles */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Recent Articles</h2>
          <Link to="/admin/articles" className="text-xs text-orange-600 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentArticles.length === 0
            ? <div className="px-5 py-6 text-sm text-gray-400 text-center animate-pulse">Loading…</div>
            : recentArticles.map(a => (
              <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.category?.name} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Draft'}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    a.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {a.published ? 'Published' : 'Draft'}
                  </span>
                  <Link to={`/admin/articles/${a.id}/edit`}
                    className="text-xs text-orange-600 hover:underline">Edit</Link>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
