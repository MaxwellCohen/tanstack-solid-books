import { useNavigate, useRouter } from "@tanstack/solid-router";
import { createTrackedEffect } from "solid-js";
import type { JSX } from "@solidjs/web";

type Props = {
  "aria-label"?: string;
  children?: JSX.Element;
  class?: string;
  href: string;
  prefetch?: boolean;
};

export function FastLink(props: Props) {
  const navigate = useNavigate();
  const router = useRouter();

  function warm() {
    const url = new URL(props.href, "http://tanstack-solid-books.local");
    const id = url.pathname === "/" ? undefined : url.pathname.slice(1);
    const search = Object.fromEntries(url.searchParams);
    void router
      .preloadRoute(
        id
          ? { to: "/$id", params: { id }, search }
          : { to: "/", search },
      )
      .catch(() => {});
  }

  createTrackedEffect(() => {
    if (typeof window === "undefined") return;
    if (props.prefetch) warm();
  });

  function shouldFastNavigate(event: MouseEvent) {
    const target = (event.currentTarget as HTMLAnchorElement).getAttribute("target");
    const interactiveTarget =
      event.target instanceof Element
        ? event.target.closest(
            "button, input, select, textarea, [contenteditable='true'], [role='button']",
          )
        : null;
    return (
      !interactiveTarget &&
      (!target || target === "_self") &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      !(event.currentTarget as HTMLAnchorElement).hasAttribute("download") &&
      event.button === 0
    );
  }

  return (
    <a
      aria-label={props["aria-label"]}
      class={props.class}
      href={props.href}
      onFocus={warm}
      onMouseDown={(event) => {
        if (!shouldFastNavigate(event)) return;
        event.preventDefault();
        void navigate({ href: props.href });
      }}
      onMouseEnter={warm}
    >
      {props.children}
    </a>
  );
}
