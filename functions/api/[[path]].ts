// Proxy /api/* to the Skypost backend, same as the old vercel.json rewrite.
const UPSTREAM = 'https://api.skypostnews.com';

export const onRequest = async (context: any) => {
  const url = new URL(context.request.url);
  const upstream = `${UPSTREAM}${url.pathname}${url.search}`;

  const headers = new Headers(context.request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', url.hostname);

  const init: any = {
    method: context.request.method,
    headers,
    redirect: 'manual',
  };
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    init.body = context.request.body;
  }

  const res = await fetch(upstream, init);
  const resHeaders = new Headers(res.headers);
  // Don't cache proxied API responses at the CDN layer
  resHeaders.set('Cache-Control', 'no-store');
  return new Response(res.body, { status: res.status, headers: resHeaders });
};
