import { API_ORIGIN } from '../api/client';

/**
 * Resolves an image URL.
 * iremee.com no longer resolves, so Wayback Machine URLs are kept as-is.
 * Falls back to the placeholder if the value is empty/null.
 */
export const PLACEHOLDER = 'https://placehold.co/800x450/e5e7eb/9ca3af?text=SKY+POST+NEWS';

// Where uploaded images are actually served from.
const UPLOADS_HOST = API_ORIGIN || '';

/**
 * Point an uploaded-image URL at the real API host.
 * Handles values that were saved with a baked-in dev origin
 * (e.g. http://localhost:5173/uploads/x.webp) or as a relative path
 * (e.g. /uploads/x.webp).
 */
export function resolveUploadUrl(url: string): string {
  // Relative path -> prefix with API host
  if (url.startsWith('/uploads/')) return `${UPLOADS_HOST}${url}`;
  // Absolute URL whose path is /uploads/... -> swap host for the API host
  const m = url.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/i);
  if (m) return `${UPLOADS_HOST}${m[1]}`;
  return url;
}

/**
 * Ensure a Wayback Machine URL uses the `im_` (raw image) form.
 * Non-Wayback URLs are returned unchanged.
 */
export function normaliseImageUrl(url: string): string {
  // Fix uploaded images that have the wrong host baked in.
  url = resolveUploadUrl(url);
  // Already im_ form — keep as-is
  if (/web\.archive\.org\/web\/\d+im_\//.test(url)) return url;
  // Plain timestamp form — insert im_ so the browser gets the raw image
  return url.replace(
    /^(https?:\/\/web\.archive\.org\/web\/)(\d+)(\/)/,
    '$1$2im_$3',
  );
}

/** Return a displayable image src from a nullable URL field. */
export function getImageSrc(url: string | null | undefined, placeholder = PLACEHOLDER): string {
  if (!url) return placeholder;
  return normaliseImageUrl(url);
}

/** onError handler: replace broken image with placeholder. */
export function onImgError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== PLACEHOLDER) {
    img.src = PLACEHOLDER;
  }
}

/**
 * Process HTML article content: ensure Wayback Machine image URLs use im_ form.
 */
export function fixContentImages(html: string): string {
  // Repoint uploaded images (absolute localhost/other host, or relative) to the API host.
  const fixedUploads = html
    .replace(/(<img[^>]+src=["'])https?:\/\/[^/"']+(\/uploads\/[^"']+)(["'])/gi,
      (_m, prefix, path, suffix) => `${prefix}${UPLOADS_HOST}${path}${suffix}`)
    .replace(/(<img[^>]+src=["'])(\/uploads\/[^"']+)(["'])/gi,
      (_m, prefix, path, suffix) => `${prefix}${UPLOADS_HOST}${path}${suffix}`);

  // Ensure Wayback Machine image URLs use im_ form
  const fixedWayback = fixedUploads.replace(
    /(<img[^>]+src=["'])(https?:\/\/web\.archive\.org\/web\/)(\d+)(\/[^"']+)(["'])/gi,
    (_match, prefix, base, ts, rest, suffix) => `${prefix}${base}${ts}im_${rest}${suffix}`,
  );
  
  // Style figure/figcaption tags that might be added via editor
  return fixedWayback.replace(/<figure/g, '<figure class="news-figure my-6"')
                     .replace(/<figcaption/g, '<figcaption class="text-center text-xs text-gray-500 mt-2 italic"');
}

/**
 * Insert a sponsored ad block after the 3rd closing </p> tag.
 * If fewer than 3 paragraphs exist, append it to the end.
 */
export function injectSponsoredAd(html: string, adHtml: string): string {
  const matches = html.match(/<\/p>/gi);
  if (!matches || matches.length < 3) return html + adHtml;

  let count = 0;
  let idx = 0;
  while (count < 3 && idx !== -1) {
    idx = html.indexOf('</p>', idx);
    if (idx === -1) break;
    count++;
    if (count === 3) {
      return html.slice(0, idx + 4) + adHtml + html.slice(idx + 4);
    }
    idx += 4;
  }
  return html + adHtml;
}
