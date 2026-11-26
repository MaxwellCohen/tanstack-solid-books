import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { FeaturePage } from "@/features/feature-tests/layout";

declare global {
  interface Window {
    __ftRenderCount?: number;
  }
}

function SignalCounter() {
  // Component bodies run once in Solid; only the {count()} text node updates.
  if (typeof window !== "undefined") window.__ftRenderCount = (window.__ftRenderCount ?? 0) + 1;
  const [count, setCount] = createSignal(0);
  return (
    <div class="flex items-center gap-3">
      <button class="rounded border px-3 py-1" data-testid="increment" onClick={() => setCount((c) => c + 1)} type="button">
        Increment
      </button>
      <span data-testid="count">{count()}</span>
    </div>
  );
}

export const Route = createFileRoute("/feature-tests/reactivity")({
  component: () => (
    <FeaturePage label="1st-party" title="Reactivity (signals)">
      <SignalCounter />
    </FeaturePage>
  ),
});
