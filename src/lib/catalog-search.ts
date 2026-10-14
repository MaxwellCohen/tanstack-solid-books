import type { SearchParams } from "@/lib/url-state";

const SEARCH_KEYS = [
  "delay",
  "language",
  "list",
  "page",
  "pages",
  "rating",
  "search",
  "year",
] as const satisfies readonly (keyof SearchParams)[];

export function validateCatalogSearch(search: Record<string, unknown>): SearchParams {
  const next: SearchParams = {};
  for (const key of SEARCH_KEYS) {
    const value = search[key];
    if (typeof value === "string" && value !== "") next[key] = value;
  }
  return next;
}
