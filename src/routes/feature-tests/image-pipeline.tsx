import { createFileRoute } from "@tanstack/solid-router";
import { Image } from "@/components/ui/image";
import { FeaturePage } from "@/features/feature-tests/layout";

// @unpic/solid <Image> with the port's IPX (/_ipx) transformer.
export const Route = createFileRoute("/feature-tests/image-pipeline")({
  component: () => (
    <FeaturePage label="Third-party" title="Image pipeline">
      <Image
        alt="Hero sample"
        data-testid="hero-image"
        height={400}
        layout="constrained"
        priority
        src="/feature-tests/sample.jpg"
        width={640}
      />
      <div style={{ height: "2500px" }}>Spacer to push the next image off-screen.</div>
      <Image
        alt="Offscreen sample"
        data-testid="offscreen-image"
        height={400}
        layout="constrained"
        src="/feature-tests/sample.jpg"
        width={640}
      />
    </FeaturePage>
  ),
});
