import { createServerFn } from "@tanstack/solid-start";
import { toBookFilters, toBookQuery } from "@/features/book/book-utils";
import { validateCatalogSearch } from "@/lib/catalog-search";
import { getApiDelayMs, MAX_API_DELAY_MS, type SearchParams } from "@/lib/url-state";
import { delay } from "@/lib/utils";

function validateBookId(input: unknown): { delay?: string; id: string } {
  const value = input as { delay?: unknown; id?: unknown };
  if (typeof value?.id !== "string" || value.id.length === 0) {
    throw new Error("Invalid book ID");
  }
  return {
    delay: typeof value.delay === "string" ? value.delay : undefined,
    id: value.id,
  };
}

async function withDelay<T>(params: SearchParams, work: () => Promise<T>): Promise<T> {
  const requested = getApiDelayMs(params);
  const envMs = Number(process.env.API_DELAY_MS ?? 0);
  const uiMs = Number.isFinite(requested) ? Math.min(MAX_API_DELAY_MS, Math.max(0, requested)) : 0;
  const ms = uiMs > 0 ? uiMs : Number.isFinite(envMs) ? envMs : 0;
  await delay(ms, ms > 0);
  return work();
}

export const getBooksPageFn = createServerFn({ method: "GET" })
  .validator(validateCatalogSearch)
  .handler(async ({ data }) => {
    const { getBooksPage } = await import("@/features/book/book-queries.server");
    return withDelay(data, () => getBooksPage(toBookQuery(data)));
  });

export const getBooksCountFn = createServerFn({ method: "GET" })
  .validator(validateCatalogSearch)
  .handler(async ({ data }) => {
    const { getBooksCount } = await import("@/features/book/book-queries.server");
    return withDelay(data, () => getBooksCount(toBookFilters(toBookQuery(data))));
  });

export const getBookByIdFn = createServerFn({ method: "GET" })
  .validator(validateBookId)
  .handler(async ({ data }) => {
    const { getBookById } = await import("@/features/book/book-queries.server");
    try {
      return await withDelay({ delay: data.delay }, () => getBookById(data.id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message === "Book not found" || message === "Invalid book ID") return null;
      throw error;
    }
  });
