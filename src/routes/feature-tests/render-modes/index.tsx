import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

export const Route = createFileRoute("/feature-tests/render-modes/")({
  component: () => (
    <FeaturePage label="1st-party" title="Render modes">
      <ul class="list-disc pl-6">
        <li><a class="underline" href="/feature-tests/render-modes/static">Prerendered (prerender.pages)</a></li>
        <li><a class="underline" href="/feature-tests/render-modes/ssr">SSR per request (ssr: true)</a></li>
        <li><a class="underline" href="/feature-tests/render-modes/client">Client-only (ssr: false)</a></li>
      </ul>
    </FeaturePage>
  ),
});
