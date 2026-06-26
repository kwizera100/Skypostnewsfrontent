import { useState } from 'react';
import { useAdminAuth } from './AdminAuth';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-bird.png" alt="Sky Post News" className="h-14 w-auto" />
          <h1 className="text-2xl font-black mt-3 text-gray-900">Sky Post News Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Sign in to manage your news portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@skypostnews.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded font-bold text-sm text-white transition-colors mb-3"
            style={{ backgroundColor: loading ? '#ccc' : '#e05c1a' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => alert('Social Login coming soon: Configure Google Client ID in .env')}
              className="flex items-center justify-center gap-2 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.39-7.84 5.39-4.84 0-8.79-4.01-8.79-8.94s3.95-8.94 8.79-8.94c2.75 0 4.59 1.17 5.65 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.24-2.5-6.62 0-12 5.38-12 12s5.38 12 12 12c6.91 0 11.5-4.86 11.5-11.7 0-.79-.08-1.39-.18-1.99z"/></svg>
              Google
            </button>
            <button type="button" onClick={() => alert('Social Login coming soon: Configure Facebook App ID in .env')}
              className="flex items-center justify-center gap-2 py-2 border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
