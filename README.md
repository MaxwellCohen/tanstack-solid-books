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

Vercel/Nitro is the default adapter (`NITRO_PRESET=vercel` on the optimized branch). Set `NETLIFY=1` for Netlify, or `CLOUDFLARE=1` for Cloudflare Workers:

- `pnpm deploy:vercel`
- `pnpm deploy:netlify`
- `pnpm deploy:cloudflare`

Set `DATABASE_URL` on every host for both branches before first deploy.
