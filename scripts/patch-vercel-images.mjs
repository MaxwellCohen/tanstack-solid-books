import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const configPath = resolve('.vercel/output/config.json')
if (!existsSync(configPath)) {
  console.warn('patch-vercel-images: no .vercel/output/config.json — skipping')
  process.exit(0)
}

const config = JSON.parse(readFileSync(configPath, 'utf8'))
config.images = {
  sizes: [
    16, 32, 48, 64, 96, 128, 160, 256, 320, 384, 400, 480, 640, 750, 828, 960, 1080, 1200, 1920,
    2048, 3840,
  ],
  domains: ['images.gr-assets.com', 's.gr-assets.com'],
  remotePatterns: [
    { protocol: 'https', hostname: 'images.gr-assets.com' },
    { protocol: 'https', hostname: 's.gr-assets.com' },
  ],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 14400,
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`)
console.log('patch-vercel-images: wrote images config to .vercel/output/config.json')
