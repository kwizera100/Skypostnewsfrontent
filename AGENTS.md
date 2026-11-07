# Sky Post News — Frontend

Vite + React SPA deployed on Vercel. Production domain: `www.skypostnews.com` / `skypostnewsfrontent.vercel.app`. Backend API: `https://api.skypostnews.com` (nginx + PM2 on VPS, repo: `kwizera100/skypostnewsBACKEND`).

## Deploy

- Push to `master` on `kwizera100/Skypostnewsfrontent`, then trigger a production deployment via the Vercel API (`POST /v13/deployments` with `gitSource` → `master`) or the Vercel dashboard. Git pushes alone do **not** auto-deploy (project deploys have historically been CLI/API-triggered).
- `vercel.json` drives the build (`npm run build` → `dist`).

## Article routing & OG meta (DO NOT BREAK)

`/article/:slug`, `/fr/article/:slug`, `/rw/article/:slug` are rewritten to the `api/og.ts` serverless function **before** the SPA catch-all. The function serves the **real built `index.html`** with article OG/Twitter meta tags injected.

Hard rules:

- `api/og.ts` must **never** return a redirect or a stub page. It must always serve HTML containing `<div id="root">` and the app bundle — real users and crawlers get the same document. (A previous version used `<meta http-equiv="refresh" content="0;url=/">` which bounced every shared-link visitor to the homepage.)
- Do not remove the `/article/:slug` rewrites in `vercel.json` — removing them silently kills social previews (title/image/description) for shared links.
- If `api/og.ts` can't load `index.html` it falls back to fetching `https://<host>/index.html` — keep that fallback intact.

## Conventions

- Language editions: `/` = English, `/fr` = French, `/rw` = Kinyarwanda (see `src/i18n`).
- API calls: `src/api/client.ts` (`apiClient`, auto-attaches JWT + `X-Language`); uploads via `POST /api/upload` (multipart `file`) → `{ url: '/uploads/…' }`.
- Admin panel: `/admin` (authors see a reduced nav). Profile/bio/avatar live at `/admin/profile` → `GET/PUT /api/users/me`.
- Images: always resolve via `src/utils/images.ts` (`getImageSrc`, `onImgError`) so `/uploads/` paths point at the API host.
