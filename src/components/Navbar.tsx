import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';

// Fixed English navigation matching the Sky Post News design.
const NAV_ITEMS: { label: string; to: string }[] = [
  { label: 'Home', to: '/' },
  { label: 'Entertainment', to: '/category/entertainment' },
  { label: 'Education', to: '/category/education' },
  { label: 'Politics', to: '/category/politics' },
  { label: 'Health', to: '/category/health' },
  { label: 'Sports', to: '/category/sports' },
  { label: 'Listen', to: '/category/listen' },
  { label: 'Markets', to: '/category/markets' },
  { label: 'Opinion', to: '/category/opinion' },
  { label: 'About Us', to: '/about' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV_ITEMS;

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center">
            {navItems.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`
                  relative px-4 py-3.5 text-sm font-semibold tracking-wide transition-colors
                  ${isActive(to)
                    ? 'text-sky-600'
                    : 'text-gray-700 hover:text-sky-600'
                  }
                `}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />
                )}
              </Link>
            ))}
          </div>
          <a href="/admin"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-sky-500 transition-colors py-3.5 px-2">
            Admin <ChevronDown size={12} />
          </a>
        </div>

        {/* Mobile: Browse Categories menu */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="w-full flex items-center justify-between py-3 px-1 text-gray-800"
            aria-label="Browse categories"
            aria-expanded={mobileOpen}>
            <span className="flex items-center gap-2 font-bold uppercase tracking-wide text-sm">
              {mobileOpen ? <X size={18} className="text-sky-600" /> : <Menu size={18} className="text-sky-600" />}
              Browse Categories
            </span>
            <ChevronDown size={16} className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileOpen && (
            <div className="grid grid-cols-2 gap-px bg-gray-100 border-t border-gray-100 mb-2 rounded-b-md overflow-hidden">
              {navItems.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold bg-white transition-colors
                    ${isActive(to) ? 'text-sky-600 bg-sky-50' : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600'}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
