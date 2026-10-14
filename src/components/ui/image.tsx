import { Image as UnpicImage } from "@unpic/solid";
import type { ComponentProps } from "solid-js";
import { imageCdn } from "@/lib/image-config";

const IPX_OPTIONS = { ipx: { baseURL: "/_ipx" } } as const;

type UnpicProps = ComponentProps<typeof UnpicImage>;

export type ImageProps = Omit<UnpicProps, "cdn" | "fallback" | "options"> & {
  options?: UnpicProps["options"];
};

/** Cover images — host CDN in production; `/_ipx` locally and on Cloudflare Workers. */
export function Image(props: ImageProps) {
  return (
    <UnpicImage
      {...({
        ...props,
        cdn: imageCdn,
        options: imageCdn === "ipx" ? { ...IPX_OPTIONS, ...props.options } : props.options,
      } as UnpicProps)}
    />
  );
}
