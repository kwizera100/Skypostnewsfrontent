import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, Mail } from 'lucide-react';
import { getLangFromPath, stripLangPrefix, addLangPrefix } from '../i18n';
import { categoriesApi } from '../api/endpoints';
import type { Category } from '../types';

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const currentLang = getLangFromPath(pathname);
  const barePath = stripLangPrefix(pathname);

  useEffect(() => {
    categoriesApi.getAll()
      .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, [currentLang]);

  // Build nav items: Home + language-specific categories + About
  const navItems = [
    { label: 'Home', to: '/' },
    ...categories.map(c => ({ label: c.name, to: `/category/${c.slug}` })),
    { label: 'About Us', to: '/about' },
  ].map(item => ({
    ...item,
    to: addLangPrefix(item.to, currentLang),
  }));

  const isActive = (to: string) => {
    const bareTo = stripLangPrefix(to);
    return bareTo === '/' ? barePath === '/' : barePath.startsWith(bareTo);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center flex-wrap">
            {navItems.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className={`
                  relative px-3 py-3.5 text-sm font-semibold tracking-wide transition-colors whitespace-nowrap
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
            className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-sky-500 transition-colors py-3.5 px-2 flex-shrink-0">
            Admin <ChevronDown size={12} />
          </a>
        </div>

        {/* Mobile: Browse Categories menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between py-3 px-1">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center gap-2 font-bold uppercase tracking-wide text-sm text-gray-800"
              aria-label="Browse categories"
              aria-expanded={mobileOpen}>
              {mobileOpen ? <X size={18} className="text-sky-600" /> : <Menu size={18} className="text-sky-600" />}
              Browse Categories
              <ChevronDown size={16} className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
            </button>
            {/* Mobile subscribe button */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-subscribe'))}
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full transition-colors"
            >
              <Mail size={12} />
              Subscribe
            </button>
          </div>

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
