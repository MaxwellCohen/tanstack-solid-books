import { createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { FeaturePage } from "@/features/feature-tests/layout";

const getTargetData = createServerFn().handler(async () => ({
  message: "ft-prefetch-target-data",
  at: new Date().toISOString(),
}));

export const Route = createFileRoute("/feature-tests/route-prefetching/target")({
  loader: () => getTargetData(),
  component: TargetPage,
});

function TargetPage() {
  const data = Route.useLoaderData();
  return (
    <FeaturePage label="1st-party" title="Prefetch target">
      <p data-testid="target-data">{data().message}</p>
    </FeaturePage>
  );
}
