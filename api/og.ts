// @ts-nocheck
import fs from 'fs';
import path from 'path';

const API_URL = process.env.VITE_API_URL || process.env.API_URL || 'https://api.skypostnews.com';
const SITE_URL = process.env.SITE_URL || 'https://www.skypostnews.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo-rect.jpg`;

// Safe timeout wrapper (AbortSignal.timeout may not exist in all runtimes)
function fetchWithTimeout(url: string, ms: number, opts: Record<string, any> = {}): Promise<Response> {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return fetch(url, { ...opts, signal: AbortSignal.timeout(ms) });
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

// ─── Serve the real built index.html ─────────────────────────────────────────
// Crawlers read the injected meta tags; browsers get the full SPA and React
// Router renders the article. This replaces the old stub page that used to
// meta-refresh every visitor to the homepage.

let cachedHtml: string | null = null;

function readBundledIndex(): string | null {
  const candidates: string[] = [];
  try {
    candidates.push(path.join(process.cwd(), 'dist', 'index.html'));
    // eslint-disable-next-line no-undef
    if (typeof __dirname !== 'undefined') {
      // eslint-disable-next-line no-undef
      candidates.push(path.join(__dirname, '..', '..', 'dist', 'index.html'));
      // eslint-disable-next-line no-undef
      candidates.push(path.join(__dirname, '..', 'dist', 'index.html'));
    }
  } catch { /* ignore */ }
  for (const p of candidates) {
    try {
      const html = fs.readFileSync(p, 'utf8');
      if (html.includes('<div id="root">')) return html;
    } catch { /* try next */ }
  }
  return null;
}

async function fetchIndexHtml(host: string): Promise<string | null> {
  // Try the deployment's own host first (correct hashed asset paths for THIS
  // deployment), then the canonical domain as fallback.
  for (const base of [`https://${host}`, SITE_URL]) {
    try {
      const res = await fetchWithTimeout(`${base}/index.html`, 4000, {
        headers: { 'User-Agent': 'SkyPostNews-OG/1.0' },
      });
      if (res.ok) {
        const html = await res.text();
        if (html.includes('<div id="root">')) return html;
      }
    } catch { /* try next */ }
  }
  return null;
}

async function getIndexHtml(req: any): Promise<string> {
  if (cachedHtml) return cachedHtml;
  const bundled = readBundledIndex();
  if (bundled) { cachedHtml = bundled; return bundled; }
  const host = req.headers?.host || 'skypostnewsfrontent.vercel.app';
  const fetched = await fetchIndexHtml(host);
  if (fetched) { cachedHtml = fetched; return fetched; }
  // Last-resort minimal SPA shell — better than a dead page.
  return '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Sky Post News - True News Every Day</title></head><body><div id="root"></div></body></html>';
}

// ─── Meta helpers ─────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_IMAGE;
  if (/web\.archive\.org\/web\/\d+/.test(url) && !/web\.archive\.org\/web\/\d+im_/.test(url)) {
    url = url.replace(/^(https?:\/\/web\.archive\.org\/web\/)(\d+)(\/)/, '$1$2im_$3');
  }
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
}

// Strip all existing OG, Twitter, article and description meta tags
function stripSocialMeta(html: string): string {
  return html
    .replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+content="[^"]*"\s+property="og:[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+content="[^"]*"\s+name="twitter:[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+property="article:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+content="[^"]*"\s+property="article:[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '')
    .replace(/<meta\s+content="[^"]*"\s+name="description"\s*\/?>/gi, '');
}

function buildMetaTags(opts: {
  title: string; desc: string; ogTitle: string; ogDesc: string;
  ogImage: string; ogUrl: string; ogType: string;
  twTitle: string; twDesc: string; twImage: string;
  publishedTime?: string; author?: string; section?: string;
}): string {
  const e = escapeHtml;
  const tags: string[] = [];

  tags.push(`<meta name="description" content="${e(opts.desc)}" />`);
  tags.push(`<meta property="og:title" content="${e(opts.ogTitle)}" />`);
  tags.push(`<meta property="og:description" content="${e(opts.ogDesc)}" />`);
  tags.push(`<meta property="og:image" content="${e(opts.ogImage)}" />`);
  tags.push(`<meta property="og:url" content="${e(opts.ogUrl)}" />`);
  tags.push(`<meta property="og:type" content="${e(opts.ogType)}" />`);
  tags.push(`<meta property="og:site_name" content="Sky Post News" />`);
  tags.push(`<meta property="og:locale" content="en_US" />`);
  tags.push(`<meta name="twitter:card" content="summary_large_image" />`);
  tags.push(`<meta name="twitter:site" content="@skypost01" />`);
  tags.push(`<meta name="twitter:domain" content="skypostnews.com" />`);
  tags.push(`<meta name="twitter:title" content="${e(opts.twTitle)}" />`);
  tags.push(`<meta name="twitter:description" content="${e(opts.twDesc)}" />`);
  tags.push(`<meta name="twitter:image" content="${e(opts.twImage)}" />`);

  if (opts.publishedTime) {
    tags.push(`<meta property="article:published_time" content="${e(opts.publishedTime)}" />`);
  }
  if (opts.author) {
    tags.push(`<meta property="article:author" content="${e(opts.author)}" />`);
  }
  if (opts.section) {
    tags.push(`<meta property="article:section" content="${e(opts.section)}" />`);
  }

  return tags.map(t => `    ${t}`).join('\n');
}

function injectMeta(html: string, opts: {
  title: string; desc: string; ogTitle: string; ogDesc: string;
  ogImage: string; ogUrl: string; ogType: string;
  twTitle: string; twDesc: string; twImage: string;
  publishedTime?: string; author?: string; section?: string;
}): string {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(opts.title)}</title>`);
  html = stripSocialMeta(html);
  const metaBlock = buildMetaTags(opts);
  if (html.includes('</head>')) {
    html = html.replace(/<\/head>/i, `${metaBlock}\n  </head>`);
  } else {
    html = html.replace(/<head>/i, `<head>\n${metaBlock}`);
  }
  return html;
}

const DEFAULT_META = {
  title: 'Sky Post News - True News Every Day',
  desc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
  ogTitle: 'Sky Post News - True News Every Day',
  ogDesc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
  ogImage: DEFAULT_IMAGE,
  ogUrl: SITE_URL,
  ogType: 'website',
  twTitle: 'Sky Post News - True News Every Day',
  twDesc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
  twImage: DEFAULT_IMAGE,
};

// ─── Handler ─────────────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  // CDN cache: 5 min browser, 10 min edge — crawlers re-check often enough for
  // fresh shares while keeping backend API calls minimal.
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  try {
    const slug = req.query?.slug as string;
    const lang = (req.query?.lang as string) === 'fr' || (req.query?.lang as string) === 'rw'
      ? (req.query.lang as string)
      : 'en';

    let html = await getIndexHtml(req);

    if (!slug || typeof slug !== 'string') {
      return res.status(200).send(injectMeta(html, DEFAULT_META));
    }

    try {
      const apiRes = await fetchWithTimeout(`${API_URL}/api/articles/${encodeURIComponent(slug)}`, 5000, {
        headers: { 'Accept': 'application/json' },
      });

      if (!apiRes.ok) {
        const ogUrl = `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`;
        return res.status(200).send(injectMeta(html, { ...DEFAULT_META, ogType: 'article', ogUrl }));
      }

      const article = await apiRes.json();

      if (!article || !article.id) {
        const ogUrl = `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`;
        return res.status(200).send(injectMeta(html, { ...DEFAULT_META, ogType: 'article', ogUrl }));
      }

      const title = article.title || 'Sky Post News';
      const description = article.excerpt || 'Read the full article on Sky Post News.';
      const ogUrl = `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`;
      const imageUrl = resolveImageUrl(article.imageUrl || article.thumbnailUrl);
      const fullTitle = `${title} | Sky Post News`;

      html = injectMeta(html, {
        title: fullTitle,
        desc: description,
        ogTitle: title,
        ogDesc: description,
        ogImage: imageUrl,
        ogUrl,
        ogType: 'article',
        twTitle: title,
        twDesc: description,
        twImage: imageUrl,
        publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
        author: article.author?.name,
        section: article.category?.name,
      });

      return res.status(200).send(html);
    } catch (error) {
      console.error('OG handler inner error:', error);
      const ogUrl = `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`;
      return res.status(200).send(injectMeta(html, { ...DEFAULT_META, ogType: 'article', ogUrl }));
    }
  } catch (error) {
    console.error('OG handler fatal error:', error);
    return res.status(200).send(
      '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>Sky Post News</title></head><body><div id="root"></div></body></html>'
    );
  }
}
