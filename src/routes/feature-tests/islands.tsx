import { createFileRoute } from "@tanstack/solid-router";
import { Hydrate } from "@tanstack/solid-start";
import { never, visible } from "@tanstack/solid-start/hydration";
import { createSignal } from "solid-js";
import { FeaturePage } from "@/features/feature-tests/layout";

function StaticCard() {
  // Unique marker: must appear in the SSR HTML but never in client JS that loads.
  const marker = "FT_STATIC_ISLAND_MARKER_7f3a";
  return (
    <div class="rounded border p-4" data-testid="static-card">
      <p>Server-only content ({marker}). Rendered once on the server; never hydrated.</p>
    </div>
  );
}

function CounterIsland() {
  const [count, setCount] = createSignal(0);
  return (
    <button class="rounded border px-3 py-1" data-testid="island-button" onClick={() => setCount((c) => c + 1)} type="button">
      Island clicks: <span data-testid="island-count">{count()}</span>
    </button>
  );
}

// Experimental <Hydrate> from @tanstack/solid-start: never() keeps the static
// card's code out of the client; visible() hydrates the counter island.
// (Observed: when={load()} appends a second client-rendered copy instead of hydrating.)
export const Route = createFileRoute("/feature-tests/islands")({
  component: () => (
    <FeaturePage label="Experimental" title="Islands (deferred hydration)">
      <Hydrate when={never()}>
        <StaticCard />
      </Hydrate>
      <Hydrate when={visible({ rootMargin: "400px" })}>
        <CounterIsland />
      </Hydrate>
    </FeaturePage>
  ),
});
