// @ts-nocheck
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

// Base template: crawlers read meta tags, browsers redirect to SPA via meta refresh
const BASE_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/logo-square.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="refresh" content="0;url=/" />
    <title>Sky Post News</title>
  </head>
  <body>
    <noscript><p>Loading… <a href="/">Go to Sky Post News</a></p></noscript>
  </body>
</html>`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_IMAGE;
  // Ensure Wayback Machine URLs use im_ form (raw image, not HTML wrapper)
  if (/web\.archive\.org\/web\/\d+/.test(url) && !/web\.archive\.org\/web\/\d+im_/.test(url)) {
    url = url.replace(/^(https?:\/\/web\.archive\.org\/web\/)(\d+)(\/)/, '$1$2im_$3');
  }
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${SITE_URL}${url}`;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
}

// Strip all existing OG, Twitter, and article meta tags from the HTML
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

// Build all meta tags as a single block
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
  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(opts.title)}</title>`);

  // Strip ALL existing social/description meta tags to avoid duplicates
  html = stripSocialMeta(html);

  // Insert fresh meta tags before </head>
  const metaBlock = buildMetaTags(opts);
  html = html.replace(/<\/head>/i, `${metaBlock}\n  </head>`);

  return html;
}

export default async function handler(req: any, res: any) {
  try {
    const slug = req.query?.slug as string;

    // Cache: 5 min browser, 10 min CDN
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');

    // Use base template (crawlers get meta tags, browsers redirect to SPA)
    let html = BASE_TEMPLATE;

    if (!slug || typeof slug !== 'string') {
      // Default meta for non-article routes
      html = injectMeta(html, {
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
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    try {
      const apiRes = await fetchWithTimeout(`${API_URL}/api/articles/${encodeURIComponent(slug)}`, 5000, {
        headers: { 'Accept': 'application/json' },
      });

      if (!apiRes.ok) {
        console.error(`OG: API returned ${apiRes.status} for slug "${slug}"`);
        html = injectMeta(html, {
          title: 'Sky Post News - True News Every Day',
          desc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
          ogTitle: 'Sky Post News - True News Every Day',
          ogDesc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
          ogImage: DEFAULT_IMAGE,
          ogUrl: `${SITE_URL}/article/${slug}`,
          ogType: 'article',
          twTitle: 'Sky Post News - True News Every Day',
          twDesc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
          twImage: DEFAULT_IMAGE,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
      }

      const article = await apiRes.json();

      if (!article || !article.id) {
        console.error(`OG: Article not found or invalid for slug "${slug}"`);
        html = injectMeta(html, {
          title: 'Sky Post News - True News Every Day',
          desc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
          ogTitle: 'Sky Post News - True News Every Day',
          ogDesc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
          ogImage: DEFAULT_IMAGE,
          ogUrl: `${SITE_URL}/article/${slug}`,
          ogType: 'article',
          twTitle: 'Sky Post News - True News Every Day',
          twDesc: 'Your trusted source for breaking news, politics, business, technology, and more from around the world.',
          twImage: DEFAULT_IMAGE,
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);
      }

      const title = article.title || 'Sky Post News';
      const description = article.excerpt || 'Read the full article on Sky Post News.';
      const url = `${SITE_URL}/article/${slug}`;
      const imageUrl = resolveImageUrl(article.imageUrl || article.thumbnailUrl);
      const fullTitle = `${title} | Sky Post News`;

      html = injectMeta(html, {
        title: fullTitle,
        desc: description,
        ogTitle: title,
        ogDesc: description,
        ogImage: imageUrl,
        ogUrl: url,
        ogType: 'article',
        twTitle: title,
        twDesc: description,
        twImage: imageUrl,
        publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
        author: article.author?.name,
        section: article.category?.name,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    } catch (error) {
      console.error('OG handler inner error:', error);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(html);
    }
  } catch (error) {
    console.error('OG handler fatal error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(BASE_TEMPLATE);
  }
}
