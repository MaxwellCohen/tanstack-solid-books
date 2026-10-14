import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/solid-router";
import { HydrationScript, type JSX } from "@solidjs/web";
import { Loading } from "solid-js";
import { AppFrame } from "@/app-frame";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { validateCatalogSearch } from "@/lib/catalog-search";
import appCss from "../app.css?url";

const description =
  "Browse two million Goodreads books with TanStack Start, Solid, streaming search, and URL-driven filters.";

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((t==="system"||!t)&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export const Route = createRootRoute({
  validateSearch: validateCatalogSearch,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Solid Books" },
      { name: "description", content: description },
      { name: "theme-color", content: "#fafafa", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#121212", media: "(prefers-color-scheme: dark)" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap",
      },
      { rel: "preconnect", href: "https://images.gr-assets.com" },
    ],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFound,
});

function RootDocument(props: { children: JSX.Element }) {
  return (
    <html lang="en">
      <head>
        <HydrationScript />
        <HeadContent />
      </head>
      <body class="bg-surface text-black antialiased dark:bg-surface-dark dark:text-white">
        <Loading>{props.children}</Loading>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppFrame>
      <Outlet />
    </AppFrame>
  );
}

function NotFound() {
  return (
    <AppFrame>
      <EmptyState body="That page isn't in the catalog." title="Page not found">
        <Button class="mt-1" href="/" variant="secondary">
          Back to the shelf
        </Button>
      </EmptyState>
    </AppFrame>
  );
}
