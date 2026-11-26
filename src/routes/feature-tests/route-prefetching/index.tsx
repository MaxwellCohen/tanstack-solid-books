import { createFileRoute, Link } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

// Router's built-in <Link preload="intent"> (router.tsx also sets defaultPreload: "intent").
export const Route = createFileRoute("/feature-tests/route-prefetching/")({
  component: () => (
    <FeaturePage label="1st-party" title="Route prefetching">
      <Link class="underline" data-testid="prefetch-link" preload="intent" to="/feature-tests/route-prefetching/target">
        Go to target (preloads on hover)
      </Link>
    </FeaturePage>
  ),
});
