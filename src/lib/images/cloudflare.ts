const IPX_BASE = "/_ipx";
const ALLOWED_HOSTS = new Set(["images.gr-assets.com", "s.gr-assets.com"]);
const MAX_DIMENSION = 8192;

const SOURCE_HEADERS = {
  // Goodreads CDN rejects bare server fetches without a UA.
  "User-Agent":
    "Mozilla/5.0 (compatible; TanStackSolidBooksIPX/1.0; +https://github.com/MaxwellCohen/tanstack-solid-books)",
  Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  Referer: "https://www.goodreads.com/",
};

type ImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad";

type ImageTransform = {
  width?: number;
  height?: number;
  fit?: ImageFit;
};

type ImageOutput = {
  output(options: { format: string; quality?: number }): Promise<{
    response(options?: { headers?: HeadersInit }): Response;
  }>;
};

type ImageHandle = ImageOutput & {
  transform(options: ImageTransform): ImageOutput;
};

export type ImagesBinding = {
  input(stream: ReadableStream<Uint8Array>): ImageHandle;
};

type CloudflareEnv = { IMAGES?: ImagesBinding };

type RuntimeRequest = Request & {
  runtime?: { cloudflare?: { env?: CloudflareEnv } };
};

export async function imagesBinding(request: Request): Promise<ImagesBinding | undefined> {
  const fromRequest = (request as RuntimeRequest).runtime?.cloudflare?.env?.IMAGES;
  if (fromRequest) return fromRequest;

  const fromGlobal = (globalThis as { __env__?: CloudflareEnv }).__env__?.IMAGES;
  if (fromGlobal) return fromGlobal;

  const fromCloudflare = (globalThis as { Cloudflare?: { env?: CloudflareEnv } }).Cloudflare?.env
    ?.IMAGES;
  if (fromCloudflare) return fromCloudflare;

  try {
    // Cloudflare Vite plugin exposes bindings via `cloudflare:workers`.
    const mod = (await import(/* @vite-ignore */ "cloudflare:workers")) as {
      env?: CloudflareEnv;
    };
    if (mod.env?.IMAGES) return mod.env.IMAGES;
  } catch {
    // Not running on Workers / module unavailable.
  }

  return;
}

/** Vercel CDN collapses `https://` → `https:/` in pathnames; IPX still needs a valid URL. */
export function repairIpxSourceUrl(id: string): string {
  return id.replace(/^(https?:)\/(?!\/)/, "$1//");
}

export function ipxTarget(url: string): { id: string; modifiers: Record<string, string> } | null {
  const pathname = new URL(url).pathname;
  if (pathname !== IPX_BASE && !pathname.startsWith(`${IPX_BASE}/`)) return null;
  const rest = pathname.slice(IPX_BASE.length).replace(/^\//, "");
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  let id: string;
  try {
    id = decodeURIComponent(rest.slice(slash + 1));
  } catch {
    return null;
  }
  if (!id || id.includes("/_ipx/") || id.startsWith("/_ipx")) return null;
  const modifiers: Record<string, string> = {};
  for (const part of rest.slice(0, slash).split(",")) {
    if (!part || part === "_") continue;
    const split = part.indexOf("_");
    if (split === -1) modifiers[part] = "";
    else modifiers[part.slice(0, split)] = part.slice(split + 1);
  }
  return { id, modifiers };
}

function dimension(value: string | undefined): number | undefined {
  if (!value || !/^\d+$/.test(value)) return;
  const size = Number(value);
  if (size < 1 || size > MAX_DIMENSION) return;
  return size;
}

function fitOf(value: string | undefined): ImageFit | undefined {
  if (value === "contain" || value === "cover" || value === "crop" || value === "pad") return value;
  if (value === "inside" || value === "scale-down") return "scale-down";
  if (value === "outside" || value === "fill") return "cover";
  return;
}

export function cloudflareOptions(modifiers: Record<string, string>, accept: string) {
  const fromSize = modifiers.s?.split("x") ?? [];
  const width = dimension(fromSize[0]) ?? dimension(modifiers.w) ?? dimension(modifiers.width);
  const height = dimension(fromSize[1]) ?? dimension(modifiers.h) ?? dimension(modifiers.height);
  const transform: ImageTransform = {};
  if (width) transform.width = width;
  if (height) transform.height = height;
  if (width || height) transform.fit = fitOf(modifiers.fit) ?? "scale-down";

  const requested = modifiers.f || modifiers.format;
  let format = "image/jpeg";
  if (requested && requested !== "auto") {
    format = requested === "jpg" ? "image/jpeg" : `image/${requested}`;
  } else if (accept.includes("image/avif")) {
    format = "image/avif";
  } else if (accept.includes("image/webp")) {
    format = "image/webp";
  }

  const quality = dimension(modifiers.q) ?? dimension(modifiers.quality);
  return {
    transform,
    output: quality && quality <= 100 ? { format, quality } : { format },
  };
}

function allowedSource(id: string): URL | undefined {
  try {
    const url = new URL(id);
    if ((url.protocol === "https:" || url.protocol === "http:") && ALLOWED_HOSTS.has(url.hostname)) {
      return url;
    }
  } catch {
    return;
  }
}

export async function optimizeWithCloudflare(
  request: Request,
  images: ImagesBinding,
): Promise<Response> {
  const target = ipxTarget(request.url);
  if (!target) return new Response("Invalid image URL", { status: 400 });

  const source = allowedSource(repairIpxSourceUrl(target.id));
  if (!source) return new Response("Image host is not allowed", { status: 403 });

  const upstream = await fetch(source, { headers: SOURCE_HEADERS, redirect: "follow" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream image fetch failed", { status: upstream.status || 502 });
  }
  if (upstream.url && !allowedSource(upstream.url)) {
    return new Response("Image host is not allowed", { status: 403 });
  }

  const { transform, output } = cloudflareOptions(
    target.modifiers,
    request.headers.get("Accept") ?? "",
  );
  try {
    const handle =
      Object.keys(transform).length > 0
        ? images.input(upstream.body).transform(transform)
        : images.input(upstream.body);
    const result = await handle.output(output);
    return result.response({
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        Vary: "Accept",
      },
    });
  } catch {
    return new Response("Image optimization failed", { status: 502 });
  }
}
