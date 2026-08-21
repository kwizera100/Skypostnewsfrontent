import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, X, Mail } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from './SocialIcons';
import { adsApi, subscribersApi } from '../api/endpoints';
import type { AdBanner } from '../api/endpoints';
import { API_ORIGIN } from '../api/client';
import { getLangFromPath, stripLangPrefix, addLangPrefix, type Language } from '../i18n';
import toast from 'react-hot-toast';

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: 'https://www.facebook.com/skypostnews', label: 'Facebook' },
  { icon: InstagramIcon, href: 'https://www.instagram.com/skypost01?igsh=Y2ZuZHlnbWRvd3R1&utm_source=qr', label: 'Instagram' },
  { icon: YoutubeIcon, href: 'https://youtube.com/@skypostnews', label: 'YouTube' },
  { icon: TwitterIcon, href: 'https://x.com/skypost01?s=11', label: 'X' },
];

const TOP_LINKS = ['Home', 'Photos', 'TV', 'Advertise', 'Sports', 'Events'];

// Default ad banner content when none configured
const DEFAULT_ADS: { position: string; imageUrl: string; linkUrl: string; altText: string }[] = [
  {
    position: 'left',
    imageUrl: '/ads/ad-left.jpg',
    linkUrl: '#',
    altText: 'Homey Land Childcare',
  },
  {
    position: 'center',
    imageUrl: '/ads/ad-center.jpg',
    linkUrl: '#',
    altText: 'Marchal Real Estate',
  },
  {
    position: 'right',
    imageUrl: '/ads/ad-right.jpg',
    linkUrl: '#',
    altText: 'Advertise with us',
  },
];

function resolveAdImage(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
  return url;
}

const LANG_CONFIG: { code: Language; short: string; flag: string }[] = [
  { code: 'en', short: 'ENG', flag: '🇬🇧' },
  { code: 'fr', short: 'FR', flag: '🇫🇷' },
  { code: 'rw', short: 'KINYA', flag: '🇷🇼' },
];

export default function Header() {
  const { pathname } = useLocation();
  const [now, setNow] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [subOpen, setSubOpen] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const currentLang = getLangFromPath(pathname);
  const barePath = stripLangPrefix(pathname);

  const getLang = () => {
    if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr';
    if (pathname === '/rw' || pathname.startsWith('/rw/')) return 'rw';
    return 'en';
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail) return;
    setSubLoading(true);
    try {
      await subscribersApi.subscribe(subEmail, getLang());
      toast.success('Subscribed! You will be notified when new articles are published.');
      setSubOpen(false);
      setSubEmail('');
    } catch {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setSubLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubLoading(true);
    try {
      const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (client_id) {
        const redirect_uri = encodeURIComponent(window.location.origin + '/auth/google/callback');
        const scope = encodeURIComponent('openid email profile');
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}`;
      } else {
        toast.error('Google signup is not configured yet. Please use email subscription.');
      }
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Listen for subscribe requests from Navbar (mobile)
  useEffect(() => {
    const handler = () => setSubOpen(true);
    window.addEventListener('open-subscribe', handler);
    return () => window.removeEventListener('open-subscribe', handler);
  }, []);

  useEffect(() => {
    adsApi.getAll()
      .then(res => setAds(res.data || []))
      .catch(() => {});
  }, []);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Merge API ads with defaults for missing positions
  const adMap = new Map<string, AdBanner>();
  ads.forEach(a => adMap.set(a.position, a));
  const displayAds = ['left', 'center', 'right'].map(pos => {
    const apiAd = adMap.get(pos);
    if (apiAd && apiAd.active) return apiAd;
    const def = DEFAULT_ADS.find(d => d.position === pos);
    return {
      id: 0,
      position: pos,
      imageUrl: def?.imageUrl || '/logo-rect.jpg',
      linkUrl: def?.linkUrl || null,
      altText: def?.altText || null,
      width: 100,
      height: 90,
      active: true,
      sortOrder: pos === 'left' ? 0 : pos === 'center' ? 1 : 2,
      createdAt: '',
      updatedAt: '',
    } as AdBanner;
  });

  return (
    <header>
      {/* ── TOP DARK BAR ──────────────────────────────────────── */}
      <div style={{ backgroundColor: '#111827' }} className="py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Quick nav */}
          <div className="hidden sm:flex items-center gap-0 min-w-0 overflow-hidden">
            {TOP_LINKS.map((label, i) => (
              <span key={label} className="flex items-center">
                {i > 0 && <span className="text-gray-600 text-xs mx-1">|</span>}
                <a href={i === 0 ? '/' : `#${label.toLowerCase()}`}
                  className="text-gray-300 hover:text-sky-400 text-xs font-semibold tracking-wide uppercase transition-colors px-1">
                  {label}
                </a>
              </span>
            ))}
          </div>
          {/* Date + Social + ENG/FR/RW + Subscribe + Search */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Language switcher ENG/FR/KINYA */}
            <div className="flex items-center gap-0 flex-shrink-0">
              {LANG_CONFIG.map((l, i) => (
                <span key={l.code} className="flex items-center">
                  {i > 0 && <span className="text-gray-600 text-xs mx-1">|</span>}
                  <Link
                    to={addLangPrefix(barePath, l.code)}
                    title={l.short}
                    className={`flex items-center gap-1 text-xs font-bold tracking-wide uppercase transition-colors px-1 cursor-pointer ${
                      currentLang === l.code ? 'text-sky-400' : 'text-gray-400 hover:text-sky-400'
                    }`}
                  >
                    <span className="text-sm leading-none">{l.flag}</span>
                    <span>{l.short}</span>
                  </Link>
                </span>
              ))}
            </div>
            <span className="text-gray-600 text-xs hidden md:block">|</span>
            <span className="text-gray-500 text-xs hidden md:block">{dateStr}</span>
            <div className="flex items-center gap-1">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="text-gray-400 hover:text-sky-400 transition-colors p-1">
                  <Icon size={13} />
                </a>
              ))}
            </div>
            {/* Subscribe button */}
            <button
              onClick={() => setSubOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full transition-colors"
            >
              Subscribe
            </button>
            {/* Search toggle (top bar) */}
            <button onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="text-gray-400 hover:text-sky-400 transition-colors p-1">
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── AD BANNER ROW ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3">
          {displayAds.map(ad => (
            <a
              key={ad.position}
              href={ad.linkUrl || '#'}
              target={ad.linkUrl && ad.linkUrl !== '#' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`border border-gray-200 rounded overflow-hidden bg-gray-50 hover:shadow-md transition-shadow ${
                ad.position === 'right'
                  ? 'hidden sm:flex items-center justify-center'
                  : ad.position === 'center'
                    ? 'block'
                    : 'hidden sm:block'
              }`}
              style={{ minHeight: 80 }}
            >
              {ad.position === 'right' && (!ad.imageUrl || ad.imageUrl.includes('ad-right')) ? (
                <div className="text-center py-3 px-4">
                  <p className="text-sm font-bold text-gray-700">Advertise with us</p>
                  <p className="text-xs text-sky-600 font-semibold mt-0.5">&gt;</p>
                  <p className="text-xs text-gray-500 mt-1">0782 768 957</p>
                </div>
              ) : (
                <img
                  src={resolveAdImage(ad.imageUrl)}
                  alt={ad.altText || 'Advertisement'}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: 90 }}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </a>
          ))}
        </div>
      </div>

      {/* Subscribe modal */}
      {subOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setSubOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSubOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Subscribe</h2>
            <p className="text-sm text-gray-500 mb-5">Get notified when new articles are published. For readers only.</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoFocus
                  value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-sky-400"
                />
              </div>
              <button
                type="submit"
                disabled={subLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors"
              >
                {subLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-semibold">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <button
              onClick={handleGoogleSignup}
              disabled={subLoading}
              className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <form
            onSubmit={e => { e.preventDefault(); setSearchOpen(false); }}
            className="max-w-7xl mx-auto flex items-center gap-2"
          >
            <input
              autoFocus
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search news…"
              className="flex-1 border-2 border-sky-400 rounded-sm px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-sky-500 text-white px-4 py-2 rounded-sm text-sm font-semibold hover:bg-sky-600 transition-colors">
              Search
            </button>
            <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-gray-700 text-sm px-2">
              Close
            </button>
          </form>
        </div>
      )}

      {/* ── LOGO BANNER (all screens) ─────────────────────────── */}
      <div className="bg-white px-2 sm:px-4 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto">
          <div
            className="flex items-stretch overflow-hidden rounded-md shadow-sm"
            style={{ background: 'linear-gradient(120deg, #38bdf8 0%, #0284c7 55%, #075985 100%)' }}
          >
            {/* Left: Bird logo + Sky Post NEWS */}
            <Link to="/" className="flex-1 flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 min-w-0">
              <img
                src="/logo-bird.png"
                alt="Sky Post News"
                onError={e => { e.currentTarget.src = '/logo-square.jpg'; }}
                className="h-10 sm:h-16 w-auto object-contain flex-shrink-0"
                style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}
              />
              <div className="flex items-baseline gap-1 min-w-0">
                <span
                  className="font-black text-white leading-none truncate"
                  style={{
                    fontSize: 'clamp(1.35rem, 6vw, 2.8rem)',
                    letterSpacing: '0.5px',
                    textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  Sky Post
                </span>
                <span
                  className="font-black text-white px-1.5 py-0.5 rounded-sm text-[10px] sm:text-sm flex-shrink-0"
                  style={{ backgroundColor: '#0ea5e9', letterSpacing: '2px' }}
                >
                  NEWS
                </span>
              </div>
            </Link>

            {/* Right: News and Magazine */}
            <div
              className="flex items-center px-3 sm:px-8 lg:px-12 flex-shrink-0"
              style={{ backgroundColor: '#161616', clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0 100%)' }}
            >
              <span className="text-white font-bold text-[11px] leading-tight sm:text-lg lg:text-xl pl-2 sm:pl-4 text-right sm:whitespace-nowrap">
                News and Magazine
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

