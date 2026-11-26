import type { JSX } from "solid-js";

export function FeaturePage(props: { title: string; label: string; children?: JSX.Element }) {
  return (
    <section class="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
      <p class="text-sm">
        <a class="underline" href="/feature-tests">
          ← Feature tests
        </a>
      </p>
      <h1 class="text-2xl font-semibold">{props.title}</h1>
      <p class="text-muted text-sm">Claimed label: {props.label}</p>
      {props.children}
    </section>
  );
}
