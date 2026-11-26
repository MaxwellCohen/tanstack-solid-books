import { createFileRoute, useRouter } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { FeaturePage } from "@/features/feature-tests/layout";

let counter = 0;

const getStamp = createServerFn().handler(async () => {
  counter += 1;
  return { counter, at: new Date().toISOString() };
});

// TanStack Router loader cache (staleTime) + route `headers` for HTTP caching.
export const Route = createFileRoute("/feature-tests/caching")({
  loader: () => getStamp(),
  staleTime: 5_000,
  headers: () => ({
    "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
  }),
  component: CachingPage,
});

function CachingPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  return (
    <FeaturePage label="1st-party" title="Caching">
      <p>
        Loader counter: <span data-testid="counter">{data().counter}</span> at{" "}
        <span data-testid="stamp">{data().at}</span>
      </p>
      <div class="flex gap-4">
        <a class="underline" data-testid="away" href="/feature-tests" onClick={(e) => {
          e.preventDefault();
          void router.navigate({ to: "/feature-tests" });
        }}>
          Away (client nav)
        </a>
        <button class="underline" data-testid="invalidate" onClick={() => void router.invalidate()} type="button">
          router.invalidate()
        </button>
      </div>
    </FeaturePage>
  );
}
