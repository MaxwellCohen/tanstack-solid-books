import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

// Fonts come from the root route: @fontsource-variable/geist woff2 files
// referenced by hand-written @font-face (font-display: optional) in app.css,
// plus a <link rel=preload as=font> in __root.tsx head().links.
export const Route = createFileRoute("/feature-tests/font-optimization")({
  component: () => (
    <FeaturePage label="Third-party" title="Font optimization">
      <p data-testid="font-sample" style={{ "font-family": '"Geist Variable", sans-serif' }}>
        The quick brown fox jumps over the lazy dog (Geist Variable, self-hosted via Fontsource).
      </p>
    </FeaturePage>
  ),
});
