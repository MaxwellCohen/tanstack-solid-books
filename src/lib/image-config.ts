/**
 * Image optimization CDN selection (build-time via Vite `define`).
 *
 * - `ipx` — local / Cloudflare Workers (`/_ipx` + IMAGES binding)
 * - `vercel` — Vercel Image Optimization (`/_vercel/image`)
 * - `netlify` — Netlify Image CDN (`/.netlify/images`)
 */
export type ImageCdn = "ipx" | "vercel" | "netlify";

export const imageCdn = (import.meta.env.PUBLIC_IMAGE_CDN as ImageCdn | undefined) ?? "ipx";
