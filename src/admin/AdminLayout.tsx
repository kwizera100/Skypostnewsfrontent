import { type ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuth';

const NAV = [
  { label: 'Dashboard',  to: '/admin',          icon: '📊' },
  { label: 'Articles',   to: '/admin/articles',  icon: '📰' },
  { label: 'Categories', to: '/admin/categories',icon: '🏷️' },
  { label: 'Users',      to: '/admin/users',     icon: '👥' },
  { label: 'Media',      to: '/admin/media',     icon: '🖼️' },
  { label: 'Ad Banners', to: '/admin/ads',       icon: '📢' },
  { label: 'New Article',to: '/admin/articles/new', icon: '✏️' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAdminAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f3f4f6' }}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 flex flex-col shadow-xl transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex`}
        style={{ backgroundColor: '#1a1a1a' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-700">
          <img src="/logo-bird.png" alt="Sky Post News" className="h-8 w-auto flex-shrink-0" />
          <div>
            <div className="text-white font-black text-sm tracking-tight">SKY POST NEWS</div>
            <div className="text-gray-500 text-xs">Admin Panel</div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ label, to, icon }) => {
            const active = to === '/admin' ? pathname === '/admin' : pathname.startsWith(to) && to !== '/admin';
            return (
              <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors
                  ${active ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                style={active ? { backgroundColor: '#0ea5e9' } : {}}>
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-3 py-4 border-t border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user?.name}</div>
              <div className="text-gray-500 text-xs capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button onClick={logout}
            className="w-full text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded px-3 py-2 transition-colors text-left">
            🚪 Sign Out
          </button>
          <Link to="/" className="block mt-1 text-xs text-gray-500 hover:text-gray-300 px-3 py-1 transition-colors">
            ← View Site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900 p-1">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Sky Post News Admin
            </span>
          </div>
          <Link to="/" className="text-xs text-sky-600 hover:text-sky-700 font-semibold">
            View Live Site ↗
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
