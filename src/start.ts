import { createMiddleware, createStart } from "@tanstack/solid-start";
import { hostDocumentCacheControl } from "@/lib/catalog-cache";

const catalogHeadersMiddleware = createMiddleware({ type: "request" }).server(async ({ request, next }) => {
  const result = await next();
  // Feature test (caching): keep the route's own `headers()` Cache-Control.
  if (new URL(request.url).pathname.startsWith("/feature-tests/caching")) return result;
  const contentType = result.response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return result;

  const headers = new Headers(result.response.headers);
  headers.set("Cache-Control", hostDocumentCacheControl());
  headers.delete("CDN-Cache-Control");
  headers.delete("Vercel-CDN-Cache-Control");
  headers.delete("Netlify-CDN-Cache-Control");

  return {
    ...result,
    response: new Response(result.response.body, {
      status: result.response.status,
      statusText: result.response.statusText,
      headers,
    }),
  };
});

export const startInstance = createStart(() => ({
  requestMiddleware: [catalogHeadersMiddleware],
}));
