import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

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

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center justify-between py-2.5">
          <Link to="/" className="flex items-center" aria-label="Home">
            <img src="/logo-bird.png" alt="Sky Post News" onError={e => { e.currentTarget.src = '/logo-rect.jpg'; }} className="h-8 w-auto object-contain mix-blend-multiply" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex flex-col gap-1.5 p-1.5 text-gray-700"
            aria-label="Menu">
            <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 pb-3">
            {navItems.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`block px-2 py-2.5 text-sm font-semibold border-b border-gray-50 last:border-0
                  ${isActive(to) ? 'text-sky-600 bg-sky-50' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
