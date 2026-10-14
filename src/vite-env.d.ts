/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PUBLIC_IMAGE_CDN?: "ipx" | "vercel" | "netlify";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "cloudflare:workers" {
  export const env: {
    IMAGES?: import("@/lib/images/cloudflare").ImagesBinding;
    DATABASE_URL?: string;
    [key: string]: unknown;
  };
}
