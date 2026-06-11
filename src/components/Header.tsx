import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from './SocialIcons';

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: 'https://www.facebook.com/iremee.rw', label: 'Facebook' },
  { icon: InstagramIcon, href: 'https://instagram.com/iremee.rw', label: 'Instagram' },
  { icon: YoutubeIcon, href: 'https://youtube.com/@iremee', label: 'YouTube' },
  { icon: TwitterIcon, href: 'https://twitter.com/iremee_rw', label: 'Twitter' },
];

const TOP_LINKS = ['Home', 'Photos', 'TV', 'Advertise', 'Sports', 'Events'];

export default function Header() {
  const [now, setNow] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <header>
      {/* ── TOP DARK BAR ──────────────────────────────────────── */}
      <div style={{ backgroundColor: '#111827' }} className="py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Quick nav (hidden on mobile to keep the bar clean) */}
          <div className="hidden sm:flex items-center gap-0 min-w-0 overflow-hidden">
            {TOP_LINKS.map((label, i) => (
              <span key={label} className="flex items-center">
                {i > 0 && <span className="text-gray-600 text-xs mx-1">|</span>}
                <a href={i === 0 ? '/' : `#${label.toLowerCase()}`}
                  className="text-gray-300 hover:text-orange-400 text-xs font-semibold tracking-wide uppercase transition-colors px-1">
                  {label}
                </a>
              </span>
            ))}
          </div>
          {/* Social + date */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-gray-500 text-xs hidden md:block">{dateStr}</span>
            <div className="flex items-center gap-1">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="text-gray-400 hover:text-orange-400 transition-colors p-1">
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── WHITE LOGO + SEARCH BAR ───────────────────────────── */}
      <div className="bg-white border-b-2 border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Rectangle logo */}
          <Link to="/" className="flex items-center min-w-0">
            <img
              src="/logo-rect.jpg"
              alt="Sky Post News"
              className="h-12 sm:h-20 w-auto max-w-[60vw] object-contain rounded-sm"
            />
          </Link>

          {/* Search */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {searchOpen ? (
              <form onSubmit={e => { e.preventDefault(); setSearchOpen(false); }}
                className="flex items-center border-2 border-orange-500 rounded-sm overflow-hidden">
                <input
                  autoFocus
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Shakisha…"
                  className="px-3 py-1.5 text-sm outline-none w-32 sm:w-48"
                />
                <button type="submit" className="bg-orange-500 text-white px-3 py-1.5 hover:bg-orange-600">
                  <Search size={14} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-orange-500 rounded-sm px-3 py-2 sm:px-4 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium">
                <Search size={15} />
                <span className="hidden md:block">Shakisha</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

