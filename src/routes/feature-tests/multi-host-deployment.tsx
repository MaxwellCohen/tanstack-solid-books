import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

export const Route = createFileRoute("/feature-tests/multi-host-deployment")({
  component: () => (
    <FeaturePage label="Third-party" title="Multi-host deployment">
      <p>
        Build-time only. vite.config.ts picks <code>nitro()</code> (node by default,{" "}
        <code>NITRO_PRESET=vercel</code> for Vercel), <code>@netlify/vite-plugin-tanstack-start</code>{" "}
        (<code>NETLIFY=1</code>) or <code>@cloudflare/vite-plugin</code> (<code>CLOUDFLARE=1</code>).
        The test builds several targets and checks each output directory.
      </p>
    </FeaturePage>
  ),
});
