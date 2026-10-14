# TanStack Solid Books

The Goodreads catalog app, ported to [TanStack Start](https://tanstack.com/start) with Solid 2.

Leave `DATABASE_URL` empty to browse the generated preview catalog. Point it at the shared Neon Postgres to query the full Goodreads dataset.

## Branches

| Branch | Fonts | Caching | CSS / images |
| --- | --- | --- | --- |
| `main` | Google Fonts CDN Geist | vibe defaults | Linked stylesheet; remote cover URLs |
| `optimized` | Self-hosted `@fontsource-variable/geist` | Catalog TTL cache + host-matching HTML `Cache-Control` | Inline CSS; host image CDN (Vercel/Netlify) or `/_ipx` + Cloudflare Images |

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm typecheck`

## Deploy

Production (`main`):

- Vercel: [tanstack-solid-books.vercel.app](https://tanstack-solid-books.vercel.app)
- Netlify: [tanstack-solid-books.netlify.app](https://tanstack-solid-books.netlify.app)
- Cloudflare: [tanstack-solid-books.to-email-max.workers.dev](https://tanstack-solid-books.to-email-max.workers.dev)

Optimized (`optimized`):

- Vercel: [tanstack-solid-books-optimized.vercel.app](https://tanstack-solid-books-optimized.vercel.app)
- Netlify: [tanstack-solid-books-optimized.netlify.app](https://tanstack-solid-books-optimized.netlify.app)
- Cloudflare: [tanstack-solid-books-optimized.to-email-max.workers.dev](https://tanstack-solid-books-optimized.to-email-max.workers.dev)

Vercel/Nitro is the default adapter (`NITRO_PRESET=vercel` for prebuilt deploys). Set `NETLIFY=1` for Netlify, or `CLOUDFLARE=1` for Cloudflare Workers:

- `pnpm deploy:vercel`
- `pnpm deploy:netlify`
- `pnpm deploy:cloudflare`
- `pnpm preview:cloudflare`

Set `DATABASE_URL` on every host for both branches before first deploy.
