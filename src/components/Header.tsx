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

function SkyPostNewsLogo() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" aria-label="Sky Post News">
      <circle cx="23" cy="23" r="23" fill="#0ea5e9" />
      <path d="M12 18 L23 12 L34 18 L34 28 L23 34 L12 28 Z" fill="white" />
      <text x="23" y="27" textAnchor="middle" fill="#0ea5e9" fontSize="10" fontWeight="900" fontFamily="Arial,sans-serif">SKY</text>
    </svg>
  );
}

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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Quick nav */}
          <div className="flex items-center gap-0">
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
          <div className="flex items-center gap-3">
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
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
            <SkyPostNewsLogo />
            <div>
              <span className="font-black text-3xl leading-none tracking-tight text-gray-900 group-hover:text-sky-600 transition-colors">
                Sky Post News
              </span>
              <p className="text-gray-400 text-xs tracking-widest uppercase mt-0.5">News · Knowledge · Health</p>
            </div>
          </Link>

          {/* Ad banner (desktop) */}
          <div className="hidden lg:block flex-1 mx-8">
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #1a1a1a 100%)' }}
              className="rounded-sm px-6 py-2.5 text-white text-center">
              <div className="font-black text-lg tracking-tight leading-none">skypostnews.com</div>
              <div className="text-xs opacity-80 tracking-wider">True News Every Day</div>
            </div>
          </div>

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
                  className="px-3 py-1.5 text-sm outline-none w-48"
                />
                <button type="submit" className="bg-orange-500 text-white px-3 py-1.5 hover:bg-orange-600">
                  <Search size={14} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-orange-500 rounded-sm px-4 py-2 text-gray-500 hover:text-orange-600 transition-colors text-sm font-medium">
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

