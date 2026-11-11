// Shared OG-injection helper for Cloudflare Pages Functions.
// Ported from the former Vercel api/og.ts serverless function — no Node APIs,
// index.html is fetched through the Pages ASSETS binding.

const API_URL = 'https://api.skypostnews.com';
const SITE_URL = 'https://www.skypostnews.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo-rect.jpg`;

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

function injectMeta(html: string, opts: any): string {
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

// Cache the built index.html inside the Worker isolate lifetime.
let cachedHtml: string | null = null;

async function getIndexHtml(context: any): Promise<string> {
  if (cachedHtml) return cachedHtml;
  try {
    // Pages Functions expose ASSETS binding: fetch the real built index.html
    // so hashed asset paths are always correct for this deployment.
    const res = await context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
    if (res.ok) {
      const html = await res.text();
      if (html.includes('<div id="root">')) {
        cachedHtml = html;
        return html;
      }
    }
  } catch { /* fall through */ }
  return '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Sky Post News - True News Every Day</title></head><body><div id="root"></div></body></html>';
}

export async function handleOg(context: any, slug: string, lang: string) {
  const headers = new Headers({ 'Content-Type': 'text/html; charset=utf-8' });
  // CDN cache: 5 min browser, 10 min edge — cheap on Workers executions.
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  const send = (html: string) => new Response(html, { status: 200, headers });

  try {
    slug = (slug || '').replace(/\/+$/, '');
    if (slug && !/^[a-z0-9][a-z0-9-]*$/i.test(slug)) slug = '';
    lang = lang === 'fr' || lang === 'rw' ? lang : 'en';

    let html = await getIndexHtml(context);
    if (!slug) return send(injectMeta(html, DEFAULT_META));

    try {
      const apiRes = await fetch(`${API_URL}/api/articles/${encodeURIComponent(slug)}`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });
      const fallback = () => send(injectMeta(html, {
        ...DEFAULT_META,
        ogType: 'article',
        ogUrl: `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`,
      }));

      if (!apiRes.ok) return fallback();
      const article: any = await apiRes.json();
      if (!article || !article.id) return fallback();

      const title = article.title || 'Sky Post News';
      const description = article.excerpt || 'Read the full article on Sky Post News.';
      const ogUrl = `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`;
      const imageUrl = resolveImageUrl(article.imageUrl || article.thumbnailUrl);

      return send(injectMeta(html, {
        title: `${title} | Sky Post News`,
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
      }));
    } catch {
      return send(injectMeta(html, {
        ...DEFAULT_META,
        ogType: 'article',
        ogUrl: `${SITE_URL}/${lang === 'en' ? '' : lang + '/'}article/${slug}`,
      }));
    }
  } catch {
    return send('<!doctype html><html lang="en"><head><meta charset="UTF-8"/><title>Sky Post News</title></head><body><div id="root"></div></body></html>');
  }
}
