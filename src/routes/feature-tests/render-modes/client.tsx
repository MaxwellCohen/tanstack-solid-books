import { createFileRoute } from "@tanstack/solid-router";
import { FeaturePage } from "@/features/feature-tests/layout";

// Selective SSR: ssr: false renders this route only in the browser.
export const Route = createFileRoute("/feature-tests/render-modes/client")({
  ssr: false,
  loader: () => ({ where: typeof window === "undefined" ? "server" : "client" }),
  component: () => {
    const data = Route.useLoaderData();
    return (
      <FeaturePage label="1st-party" title="Render mode: client">
        <p data-testid="client-only">FT_CLIENT_ONLY_CONTENT rendered on the {data().where}</p>
      </FeaturePage>
    );
  },
});
