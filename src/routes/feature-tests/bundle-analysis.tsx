import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

export const Route = createFileRoute("/feature-tests/bundle-analysis")({
  component: () => (
    <FeaturePage label="Third-party" title="Bundle analysis">
      <p>
        Build-time only. <code>ANALYZE=1 vite build</code> adds <code>rollup-plugin-visualizer</code>{" "}
        (vite.config.ts) to the client environment and writes <code>.analyze/client.html</code> and{" "}
        <code>.analyze/client.json</code>. The test in <code>feature-tests/bundle-analysis.spec.ts</code> runs it.
      </p>
    </FeaturePage>
  ),
});
