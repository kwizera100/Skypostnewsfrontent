const API_URL = process.env.VITE_API_URL || 'https://api.skypostnews.com';
const SITE_URL = 'https://skypostnews.com';
const DEFAULT_IMAGE = `${SITE_URL}/logo-rect.jpg`;

// Inline fallback template (crawlers only need meta tags; browsers get fetched HTML below)
const FALLBACK_TEMPLATE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/jpeg" href="/logo-square.jpg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><!--TITLE--></title>
    <meta name="description" content="<!--DESC-->" />
    <meta property="og:title" content="<!--OG_TITLE-->" />
    <meta property="og:description" content="<!--OG_DESC-->" />
    <meta property="og:image" content="<!--OG_IMAGE-->" />
    <meta property="og:url" content="<!--OG_URL-->" />
    <meta property="og:type" content="<!--OG_TYPE-->" />
    <meta property="og:site_name" content="Sky Post News" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:domain" content="skypostnews.com" />
    <meta name="twitter:title" content="<!--TW_TITLE-->" />
    <meta name="twitter:description" content="<!--TW_DESC-->" />
    <meta name="twitter:image" content="<!--TW_IMAGE-->" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

// Cache the fetched production index.html (avoids refetching on every request)
let cachedHtml: string | null = null;

async function getProductionHtml(): Promise<string> {
  if (cachedHtml) return cachedHtml;
  try {
    const res = await fetch(`${SITE_URL}/index.html`, { cache: 'no-store' });
    if (res.ok) {
      cachedHtml = await res.text();
      return cachedHtml;
    }
  } catch (err) {
    console.error('OG: Failed to fetch production index.html:', err);
  }
  return FALLBACK_TEMPLATE;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
  if (url.startsWith('/')) return `${SITE_URL}${url}`;
  return `${SITE_URL}/${url}`;
}

function injectMeta(html: string, opts: {
  title: string; desc: string; ogTitle: string; ogDesc: string;
  ogImage: string; ogUrl: string; ogType: string;
  twTitle: string; twDesc: string; twImage: string;
}): string {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(opts.title)}</title>`)
    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${escapeHtml(opts.desc)}"`)
    .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${escapeHtml(opts.ogTitle)}"`)
    .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${escapeHtml(opts.ogDesc)}"`)
    .replace(/<meta property="og:image" content=".*?"/, `<meta property="og:image" content="${escapeHtml(opts.ogImage)}"`)
    .replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${escapeHtml(opts.ogUrl)}"`)
    .replace(/<meta property="og:type" content=".*?"/, `<meta property="og:type" content="${escapeHtml(opts.ogType)}"`)
    .replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${escapeHtml(opts.twTitle)}"`)
    .replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${escapeHtml(opts.twDesc)}"`)
    .replace(/<meta name="twitter:image" content=".*?"/, `<meta name="twitter:image" content="${escapeHtml(opts.twImage)}"`);
}

export default async function handler(req: any, res: any) {
  const slug = req.query?.slug as string;

  // Fetch the real production index.html (has correct Vite asset paths)
  let html = await getProductionHtml();

  if (!slug || typeof slug !== 'string') {
    // Default meta for non-article routes (should not normally be reached via this rewrite)
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
    const apiRes = await fetch(`${API_URL}/api/articles/${encodeURIComponent(slug)}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!apiRes.ok) {
      console.error(`OG: API returned ${apiRes.status} for slug "${slug}"`);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    }

    const article = await apiRes.json();

    if (!article || !article.id) {
      console.error(`OG: Article not found or invalid for slug "${slug}"`);
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
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('OG handler error:', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  }
}
