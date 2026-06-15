import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAdminAuth } from './AdminAuth';
import { API_ORIGIN } from '../api/client';

const resolveUrl = (url: string) =>
  url.startsWith('http') ? url : `${API_ORIGIN}${url}`;

interface MediaItem { url: string; name: string; size?: number; }

export default function AdminMedia() {
  const { token } = useAdminAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function fetchMedia() {
    setLoading(true);
    axios.get('/api/upload/list', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const { data } = await axios.post('/api/upload', fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setItems(prev => [{ url: data.url, name: file.name, size: file.size }, ...prev]);
      } catch { /* skip failed */ }
    }
    setUploading(false);
    e.target.value = '';
  }, [token]);

  function copyUrl(url: string) {
    const fullUrl = resolveUrl(url);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500">{items.length} files</p>
        </div>
        <label className="cursor-pointer">
          <div className="px-4 py-2 rounded font-bold text-sm text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#e05c1a' }}>
            {uploading ? 'Uploading…' : '+ Upload Images'}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-400 animate-pulse">
          Loading media…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-gray-500 text-sm">No images uploaded yet.</p>
          <label className="cursor-pointer inline-block mt-3">
            <span className="text-xs text-orange-600 hover:underline">Upload your first image →</span>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden group relative">
              <img
                src={resolveUrl(item.url)}
                alt={item.name}
                className="w-full h-24 object-cover"
              />
              <div className="p-2">
                <p className="text-xs text-gray-500 truncate">{item.name}</p>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => copyUrl(item.url)}
                  className="text-xs text-white bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded font-medium transition-colors">
                  {copied === item.url ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
