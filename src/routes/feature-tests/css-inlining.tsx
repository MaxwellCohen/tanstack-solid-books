import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";
// Route-level CSS. With `server.build.inlineCss` on (vite.config.ts), Start
// writes it into a <style> in the SSR head instead of a <link rel=stylesheet>.
import "@/features/feature-tests/css-inlining.css";

export const Route = createFileRoute("/feature-tests/css-inlining")({
  component: () => (
    <FeaturePage label="Experimental" title="CSS inlining">
      <p class="ft-css-inline-marker" data-testid="css-marker">
        Styled by route CSS that Start inlined via <code>server.build.inlineCss</code>.
      </p>
    </FeaturePage>
  ),
});
