import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

// No script-strategy API: hand-rolled lazy loader in head().scripts that injects
// the third-party tag after window load + idle (like Next's lazyOnload).
const lazyLoader = `addEventListener("load",function(){(window.requestIdleCallback||setTimeout)(function(){var s=document.createElement("script");s.src="/feature-tests/fake-analytics.js";s.async=true;document.head.appendChild(s);});});`;

export const Route = createFileRoute("/feature-tests/third-party-scripts")({
  head: () => ({ scripts: [{ children: lazyLoader }] }),
  component: () => (
    <FeaturePage label="Manual" title="Third-party scripts">
      <p>A stand-in analytics script (/feature-tests/fake-analytics.js) is injected after load + idle.</p>
    </FeaturePage>
  ),
});
