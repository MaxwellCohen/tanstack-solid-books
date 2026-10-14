import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, Errored, Loading, Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getBookByIdFn } from "@/features/book/book.functions";
import type { BookDetails } from "@/features/book/book-types";
import { BackToBooksLink } from "@/features/book/components/back-to-books-link";
import { BookCoverPreloads } from "@/features/book/components/book-cover-preloads";
import { BookDetail, BookDetailSkeleton } from "@/features/book/components/book-detail";

type BookLoaderData = {
  book: Promise<BookDetails | null>;
};

export const Route = createFileRoute("/$id")({
  loaderDeps: ({ search }) => search,
  loader: ({ deps, params }): BookLoaderData => ({
    book: getBookByIdFn({ data: { delay: deps.delay, id: params.id } }),
  }),
  head: () => ({
    meta: [{ title: "Book · TanStack Solid Books" }],
  }),
  component: BookPage,
  errorComponent: BookError,
});

function BookBody() {
  const data = Route.useLoaderData();
  const book = createMemo(() => data().book);
  return (
    <Show
      when={book()}
      fallback={
        <EmptyState body="We couldn't find a book with that id." title="Book not found">
          <Button class="mt-1" href="/" variant="secondary">
            Back to the shelf
          </Button>
        </EmptyState>
      }
    >
      {(book) => (
        <>
          <Loading>
            <BookCoverPreloads books={[book()]} />
          </Loading>
          <BookDetail book={book()} />
        </>
      )}
    </Show>
  );
}

function BookPage() {
  return (
    <div class="flex flex-1 flex-col px-4 py-5 sm:px-6">
      <BackToBooksLink class="mb-6" />
      <Errored
        fallback={(_error, reset) => (
          <ErrorState body="We couldn't load this book's details." title="Can't load book">
            <Button class="mt-1" onClick={reset} size="sm" variant="secondary">
              Try again
            </Button>
          </ErrorState>
        )}
      >
        <Loading fallback={<BookDetailSkeleton />}>
          <BookBody />
        </Loading>
      </Errored>
    </div>
  );
}

function BookError(props: { error: unknown; reset: () => void }) {
  const message = props.error instanceof Error ? props.error.message : "We couldn't load this book's details.";
  return (
    <ErrorState body={message} title="Can't load book">
      <Button class="mt-1" onClick={() => props.reset()} size="sm" variant="secondary">
        Try again
      </Button>
    </ErrorState>
  );
}
