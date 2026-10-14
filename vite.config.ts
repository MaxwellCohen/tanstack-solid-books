import type { Plugin, PluginOption } from 'vite'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import viteSolid from '@solidjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const isCloudflare = Boolean(
  process.env.CLOUDFLARE || process.env.WORKERS_CI || process.env.CF_PAGES,
)
const isNetlify = Boolean(process.env.NETLIFY)
const isVercel = Boolean(
  process.env.VERCEL || process.env.NITRO_PRESET === 'vercel' || process.env.NITRO_PRESET === 'vercel_edge',
)

/** Host image CDN for Unpic — set at build time. */
const imageCdn = isCloudflare ? 'ipx' : isNetlify ? 'netlify' : isVercel ? 'vercel' : 'ipx'

// Vite treats `/_ipx/**/*.jpg` as a missing static asset and never reaches the
// `/_ipx` server route. Serve those requests before the static middleware.
function ipxDevPlugin(): Plugin {
  return {
    name: 'serve-ipx',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        const pathname = url.split('?')[0] ?? ''
        if (pathname !== '/_ipx' && !pathname.startsWith('/_ipx/')) return next()

        try {
          const { handleWithIpx } = await import('./src/lib/images/ipx.ts')
          const host = req.headers.host ?? 'localhost'
          const response = await handleWithIpx(
            new Request(`http://${host}${url}`, { method: req.method }),
          )
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

// TanStack Start's dev stylesheet crawls the SSR graph and inlines Nitro's
// Youch error-page CSS. Those rules are unlayered (`* { padding: 0 }`,
// `html, body { background; font; line-height }`) and override Tailwind.
// App CSS is already inlined on the root route, same as tanstack-books.
function ignoreLeakedDevStyles(): Plugin {
  return {
    name: 'ignore-leaked-dev-styles',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0] ?? ''
        if (!pathname.endsWith('/@tanstack-start/styles.css')) return next()
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/css')
        res.end('')
      })
    },
  }
}

export default defineConfig(async () => {
  const plugins: PluginOption[] = [ignoreLeakedDevStyles(), ipxDevPlugin()]

  if (isCloudflare) {
    const { cloudflare } = await import('@cloudflare/vite-plugin')
    plugins.push(cloudflare({ viteEnvironment: { name: 'ssr' } }))
  } else if (isNetlify) {
    const netlify = (await import('@netlify/vite-plugin-tanstack-start')).default
    plugins.push(netlify())
  } else {
    plugins.push(nitro())
  }

  plugins.push(tailwindcss(), tanstackStart(), viteSolid({ ssr: true }))

  return {
    server: { port: 3004 },
    resolve: { tsconfigPaths: true },
    define: {
      'import.meta.env.PUBLIC_IMAGE_CDN': JSON.stringify(imageCdn),
    },
    plugins,
  }
})
