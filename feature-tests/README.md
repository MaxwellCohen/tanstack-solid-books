# Feature tests (tanstack-start-solid)

Verifies the capability labels claimed for TanStack Start (Solid) in `framework-compare/capability.json`.
Each feature has a demo route under `/feature-tests/<id>` and a Playwright spec in `feature-tests/<id>.spec.ts`.

```sh
pnpm install
pnpm test:features   # builds, serves on :4111, runs all specs, writes feature-tests/results.json
```

- Browser: system Chrome at `/home/maxc/.local/bin/google-chrome` (no browser downloads). Port: `FT_PORT` (default 4111).
- `bundle-analysis` and `multi-host-deployment` are build-time specs. They run their own `vite build`s (ANALYZE=1, node, NITRO_PRESET=vercel, NETLIFY=1, CLOUDFLARE=1) first. The runner then does the node production build and runs the browser specs against `node .output/server/index.mjs`.
- No database is needed. Feature routes don't touch the books DB.
- Evidence and `suggestedLabel` come from Playwright annotations (`helpers.ts`). `results.json` records the real outcome. A failing spec means the claimed behaviour wasn't observed.

## Known failures (as of this commit)

- **css-inlining**: `server.build.inlineCss` does emit `<style data-tsr-inline-css>`. But Solid 2's SSR head-asset renderer still emits a `<link rel="stylesheet">` for the same route CSS, so the CSS is still render-blocking.
- **caching**: loader `staleTime` is honoured at the network level. There is no server-fn call within staleTime and one call after it expires. But the refetched loader data never reaches `useLoaderData()` (the UI stays stale). The same happens with `router.invalidate()`.
- **islands**: `<Hydrate when={load()}>` renders a duplicate client copy. The demo uses `visible()`/`never()`, which work.
- **render-modes**: the prerendered file is written to `.output/public`. The node server doesn't serve it, because Nitro's asset manifest is built before Start's prerender step. The SSR route is served instead. This is noted in the evidence but not failed.
