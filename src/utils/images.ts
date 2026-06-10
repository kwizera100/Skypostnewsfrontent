/**
 * Resolves an image URL.
 * iremee.com no longer resolves, so Wayback Machine URLs are kept as-is.
 * Falls back to the placeholder if the value is empty/null.
 */
export const PLACEHOLDER = 'https://placehold.co/800x450/e5e7eb/9ca3af?text=SKY+POST+NEWS';

/**
 * Ensure a Wayback Machine URL uses the `im_` (raw image) form.
 * Non-Wayback URLs are returned unchanged.
 */
export function normaliseImageUrl(url: string): string {
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
  // Ensure Wayback Machine image URLs use im_ form
  const fixedWayback = html.replace(
    /(<img[^>]+src=["'])(https?:\/\/web\.archive\.org\/web\/)(\d+)(\/[^"']+)(["'])/gi,
    (_match, prefix, base, ts, rest, suffix) => `${prefix}${base}${ts}im_${rest}${suffix}`,
  );
  
  // Style figure/figcaption tags that might be added via editor
  return fixedWayback.replace(/<figure/g, '<figure class="news-figure my-6"')
                     .replace(/<figcaption/g, '<figcaption class="text-center text-xs text-gray-500 mt-2 italic"');
}
