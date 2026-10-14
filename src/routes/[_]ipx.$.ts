import { createFileRoute } from "@tanstack/solid-router";
import { imagesBinding, optimizeWithCloudflare } from "@/lib/images/cloudflare";

async function handleIpx(request: Request): Promise<Response> {
  const images = await imagesBinding(request);
  if (images) return optimizeWithCloudflare(request, images);

  // Repair Vercel CDN slash normalization (`https://` → `https:/`) before IPX parses.
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/\/(https?:)\/(?!\/)/, "/$1//");
  const repaired = new Request(url, request);

  const { handleWithIpx } = await import("@/lib/images/ipx");
  return handleWithIpx(repaired);
}

export const Route = createFileRoute("/_ipx/$")({
  server: {
    handlers: {
      GET: async ({ request }) => handleIpx(request),
      HEAD: async ({ request }) => handleIpx(request),
    },
  },
});
