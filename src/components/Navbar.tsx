import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { categoriesApi } from '../api/endpoints';
import type { Category } from '../types';

const STATIC_NAV = [{ label: 'Amakuru', to: '/' }];

export default function Navbar() {
  const { pathname } = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    categoriesApi.getAll().then(res => {
      const cats: Category[] = Array.isArray(res.data) ? res.data : [];
      const sorted = cats
        .filter(c => ((c as any)._count?.articles ?? 0) > 0)
        .sort((a, b) => ((b as any)._count?.articles ?? 0) - ((a as any)._count?.articles ?? 0))
        .slice(0, 9);
      setCategories(sorted);
    }).catch(() => {});
  }, []);

  const navItems = [
    ...STATIC_NAV,
    ...categories.map(c => ({ label: c.name, to: `/category/${c.slug}` })),
  ];

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
                    ? 'text-orange-600'
                    : 'text-gray-700 hover:text-orange-600'
                  }
                `}
              >
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />
                )}
              </Link>
            ))}
          </div>
          <a href="/admin"
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-500 transition-colors py-3.5 px-2">
            Admin <ChevronDown size={12} />
          </a>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center justify-between py-2.5">
          <span className="font-black text-sm text-gray-800 uppercase tracking-widest">Sky Post News</span>
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
                  ${isActive(to) ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'}`}
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
