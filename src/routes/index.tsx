import { createFileRoute, useRouterState } from "@tanstack/solid-router";
import { createMemo, Errored, isPending, latest, Loading } from "solid-js";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { getBooksCountFn, getBooksPageFn } from "@/features/book/book.functions";
import type { BookSummary } from "@/features/book/book-types";
import { preloadBookCovers } from "@/features/book/book-images";
import { BookCoverPreloads } from "@/features/book/components/book-cover-preloads";
import { BookGrid, BookGridSkeleton } from "@/features/book/components/book-grid";
import {
  BookPagination,
  BookPaginationSkeleton,
} from "@/features/book/components/book-pagination";
import type { SearchParams } from "@/lib/url-state";

type HomeLoaderData = {
  books: Promise<BookSummary[]>;
  searchParams: SearchParams;
  totalResults: Promise<number>;
};

export const Route = createFileRoute("/")({
  loaderDeps: ({ search }) => search,
  loader: ({ deps }): HomeLoaderData => ({
    books: getBooksPageFn({ data: deps }),
    searchParams: deps,
    totalResults: getBooksCountFn({ data: deps }),
  }),
  head: () => ({
    meta: [{ title: "Books · TanStack Solid Books" }],
  }),
  component: HomePage,
  errorComponent: HomeError,
});

function HomeBooks() {
  const data = Route.useLoaderData();
  const page = createMemo(() => data().books);
  const books = createMemo(() => preloadBookCovers(page()));
  const filtering = useRouterState({ select: (state) => state.status === "pending" });

  return (
    <>
      <Loading>
        <BookCoverPreloads books={page()} />
      </Loading>
      <Loading fallback={<BookGridSkeleton />}>
        <div
          aria-busy={latest(() => isPending(books) || filtering()) ? "true" : undefined}
          data-pending={latest(() => isPending(books) || filtering()) ? "" : undefined}
          class="transition-opacity duration-200 ease-out data-[pending]:opacity-60 group-has-[[data-filtering]]:opacity-60"
        >
          <BookGrid books={books()} searchParams={data().searchParams} />
        </div>
      </Loading>
    </>
  );
}

function HomePagination() {
  const data = Route.useLoaderData();
  const totalResults = createMemo(() => data().totalResults);
  return <BookPagination searchParams={data().searchParams} totalResults={totalResults()} />;
}

function HomePage() {
  return (
    <Errored
      fallback={(_error, reset) => (
        <ErrorState
          body="The catalog query failed. Check your database connection and try again."
          title="Can't load books"
        >
          <Button class="mt-1" onClick={reset} size="sm" variant="secondary">
            Try again
          </Button>
        </ErrorState>
      )}
    >
      <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
          <HomeBooks />
        </div>
        <footer class="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
          <Loading fallback={<BookPaginationSkeleton />}>
            <HomePagination />
          </Loading>
        </footer>
      </div>
    </Errored>
  );
}

function HomeError(props: { error: unknown; reset: () => void }) {
  const message = props.error instanceof Error ? props.error.message : "The catalog query failed.";
  return (
    <ErrorState body={message} title="Can't load books">
      <Button class="mt-1" onClick={() => props.reset()} size="sm" variant="secondary">
        Try again
      </Button>
    </ErrorState>
  );
}
