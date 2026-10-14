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

// TanStack Start's dev stylesheet crawls the SSR graph and inlines Nitro's
// Youch error-page CSS. Those rules are unlayered (`* { padding: 0 }`,
// `html, body { background; font; line-height }`) and override Tailwind.
// App CSS is linked from the root route, so this collector can stay empty.
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
  const plugins: PluginOption[] = [ignoreLeakedDevStyles()]

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
    server: { port: 3002 },
    resolve: { tsconfigPaths: true },
    plugins,
  }
})
