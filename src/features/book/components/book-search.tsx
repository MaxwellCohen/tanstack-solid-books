import { useLocation, useNavigate, useRouterState, useSearch } from "@tanstack/solid-router";
import { createSignal, createTrackedEffect, createUniqueId } from "solid-js";
import { IconButton } from "@/components/ui/icon-button";
import { SearchIcon, XIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { buildHref, withFilters } from "@/lib/url-state";

const DEBOUNCE_MS = 220;

export function BookSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const search = useSearch({ from: "__root__" });
  const filtering = useRouterState({ select: (state) => state.status === "pending" });
  const [draft, setDraft] = createSignal<string>();
  const inputId = createUniqueId();
  const committed = () => search().search ?? "";
  const value = () => draft() ?? committed();

  createTrackedEffect(() => {
    committed();
    setDraft(undefined);
  });

  let timer: ReturnType<typeof setTimeout> | undefined;

  createTrackedEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  });

  function go(nextValue: string) {
    const query = nextValue.trim();
    void navigate({
      href: buildHref(withFilters(search(), { search: query || undefined })),
      replace: location().pathname === "/",
      resetScroll: false,
    });
  }

  function schedule(nextValue: string) {
    setDraft(nextValue);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => go(nextValue), DEBOUNCE_MS);
  }

  return (
    <form
      aria-busy={filtering() ? "true" : undefined}
      class="relative flex-1"
      data-filtering={filtering() ? "" : undefined}
      onSubmit={(event) => {
        event.preventDefault();
        if (timer) clearTimeout(timer);
        go(value());
      }}
      role="search"
    >
      <label class="sr-only" for={inputId}>
        Search books
      </label>
      <span
        aria-hidden="true"
        class="text-muted pointer-events-none absolute top-1/2 left-3.5 flex size-4 -translate-y-1/2 items-center justify-center"
      >
        {filtering() ? <Spinner class="size-4" /> : <SearchIcon class="size-4" />}
      </span>
      <Input
        class="peer"
        id={inputId}
        name="search"
        onInput={(event) => {
          schedule((event.currentTarget as HTMLInputElement).value);
        }}
        placeholder="Search books…"
        type="search"
        value={value()}
        variant="search"
      />
      <IconButton
        class="absolute top-1/2 right-1.5 -translate-y-1/2 peer-placeholder-shown:hidden"
        label="Clear search"
        onClick={() => {
          if (timer) clearTimeout(timer);
          setDraft("");
          go("");
        }}
      >
        <XIcon class="size-4" />
      </IconButton>
    </form>
  );
}
