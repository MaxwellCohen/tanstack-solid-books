import { createFileRoute } from "@tanstack/solid-router";
import { createServerFn } from "@tanstack/solid-start";
import { FeaturePage } from "@/features/feature-tests/layout";

const getRenderedAt = createServerFn().handler(async () => new Date().toISOString() + "/" + Math.random().toString(36).slice(2));

export const Route = createFileRoute("/feature-tests/render-modes/ssr")({
  ssr: true,
  loader: () => getRenderedAt(),
  component: () => {
    const renderedAt = Route.useLoaderData();
    return (
      <FeaturePage label="1st-party" title="Render mode: ssr">
        <p>Rendered at: <span data-testid="rendered-at">{renderedAt()}</span></p>
      </FeaturePage>
    );
  },
});
