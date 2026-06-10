import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAdminAuth } from './AdminAuth';

export default function AdminArticles() {
  const { token } = useAdminAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<number | null>(null);

  const PAGE_SIZE = 12;

  function fetchArticles(p = 1) {
    setLoading(true);
    axios.get(`/api/articles?page=${p}&pageSize=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => {
      setArticles(r.data.data || r.data);
      setTotal(r.data.pagination?.total ?? 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { fetchArticles(page); }, [page]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this article?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles(page);
    } catch { alert('Delete failed'); }
    finally { setDeleting(null); }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Articles</h1>
          <p className="text-sm text-gray-500">{total} total articles</p>
        </div>
        <Link to="/admin/articles/new"
          className="px-4 py-2 rounded font-bold text-sm text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#e05c1a' }}>
          + New Article
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading articles…</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No articles found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 line-clamp-1 max-w-xs">{a.title}</div>
                    <div className="text-xs text-gray-400">{a.author?.name}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      {a.category?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                    {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/article/${a.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-blue-600 transition-colors">View</a>
                      <Link to={`/admin/articles/${a.id}/edit`}
                        className="text-xs text-orange-600 hover:text-orange-700 font-medium">Edit</Link>
                      <button onClick={() => handleDelete(a.id)}
                        disabled={deleting === a.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40">
                        {deleting === a.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">
                ← Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
