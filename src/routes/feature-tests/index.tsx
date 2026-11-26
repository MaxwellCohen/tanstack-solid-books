import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";

export const FEATURES = [
  ["css-inlining", "Experimental"],
  ["font-optimization", "Third-party"],
  ["image-pipeline", "Third-party"],
  ["caching", "1st-party"],
  ["route-prefetching", "1st-party"],
  ["islands", "Experimental"],
  ["render-modes", "1st-party"],
  ["reactivity", "1st-party"],
  ["bundle-analysis", "Third-party"],
  ["third-party-scripts", "Manual"],
  ["multi-host-deployment", "Third-party"],
] as const;

export const Route = createFileRoute("/feature-tests/")({
  head: () => ({ meta: [{ title: "Feature tests · TanStack Solid Books" }] }),
  component: FeatureIndex,
});

function FeatureIndex() {
  return (
    <section class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
      <h1 class="text-2xl font-semibold">Feature tests</h1>
      <ul class="list-disc pl-6">
        <For each={FEATURES}>
          {(item) => (
            <li>
              <a class="underline" href={`/feature-tests/${item()[0]}`}>
                {item()[0]}
              </a>{" "}
              <span class="text-muted text-sm">({item()[1]})</span>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}
