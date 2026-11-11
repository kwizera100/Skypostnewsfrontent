// Proxy /uploads/* to the Skypost backend (media files).
const UPSTREAM = 'https://api.skypostnews.com';

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const res = await fetch(`${UPSTREAM}${url.pathname}${url.search}`, {
    headers: { Accept: '*/*' },
  });
  const headers = new Headers(res.headers);
  // Media is immutable-ish — let the CDN keep it for a day.
  headers.set('Cache-Control', 'public, max-age=86400');
  return new Response(res.body, { status: res.status, headers });
};
