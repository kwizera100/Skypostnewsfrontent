import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from './SocialIcons';
import { adsApi } from '../api/endpoints';
import type { AdBanner } from '../api/endpoints';
import { API_ORIGIN } from '../api/client';

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

export default function Header() {
  const [now, setNow] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [ads, setAds] = useState<AdBanner[]>([]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
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
  })
    // Only render slots that have a real uploaded banner; keep the right slot
    // so the default "Advertise with us" box always shows.
    .filter(ad => ad.id > 0 || ad.position === 'right');

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
          {/* Date + Social + Search */}
          <div className="flex items-center gap-3 ml-auto">
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
            className="flex items-stretch overflow-hidden rounded-md shadow-sm bg-white"
          >
            {/* Left: Bird logo + Sky Post NEWS */}
            <Link to="/" className="flex-1 flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 min-w-0">
              <img
                src="/logo-bird.png"
                alt="Sky Post News"
                className="h-10 sm:h-16 w-auto object-contain flex-shrink-0"
              />
              <div className="flex items-baseline gap-1 min-w-0">
                <span
                  className="font-black text-sky-700 leading-none truncate"
                  style={{
                    fontSize: 'clamp(1.35rem, 6vw, 2.8rem)',
                    letterSpacing: '0.5px',
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

