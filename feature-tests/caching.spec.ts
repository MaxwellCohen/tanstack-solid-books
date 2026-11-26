import { expect, test, type Page } from "@playwright/test";
import { evidence } from "./helpers";

// The loader (a server fn returning an incrementing counter) has staleTime: 5s.
async function awayAndBack(page: Page) {
  await page.getByTestId("away").click(); // router.navigate → client-side
  await page.waitForURL("**/feature-tests");
  await page.goBack(); // popstate → client-side navigation back
  await page.waitForURL("**/feature-tests/caching");
  await page.waitForLoadState("networkidle");
  return page.getByTestId("counter").textContent();
}

test("caching: router loader cache reuses data within staleTime, refetches after; route headers set s-maxage", async ({ page, request }) => {
  const head = await request.get("/feature-tests/caching");
  const cacheControl = head.headers()["cache-control"] ?? "";

  let loaderCalls = 0;
  page.on("request", (req) => {
    // Only count calls made while on the caching route (root loaders also call server fns).
    if (req.url().includes("/_serverFn/") && page.url().includes("/feature-tests/")) loaderCalls++;
  });

  await page.goto("/feature-tests/caching");
  await page.waitForLoadState("networkidle");
  const first = await page.getByTestId("counter").textContent();

  const callsBefore = loaderCalls;
  const second = await awayAndBack(page); // within staleTime
  const callsWithinStale = loaderCalls - callsBefore;
  await page.waitForTimeout(6_000); // let staleTime (5s) expire
  const callsBeforeStale = loaderCalls;
  let third = await awayAndBack(page);
  // stale-while-revalidate: give the background refetch time to land in the UI.
  for (let i = 0; i < 20 && third === second; i++) {
    await page.waitForTimeout(250);
    third = await page.getByTestId("counter").textContent();
  }
  const callsAfterStale = loaderCalls - callsBeforeStale;

  evidence(
    `Cache-Control "${cacheControl}"; loader counter ${first} → ${second} (nav away/back inside 5s staleTime) → ${third} (after staleTime expired); server-fn requests: ${callsWithinStale} within staleTime, ${callsAfterStale} after expiry`,
  );
  expect(cacheControl).toContain("s-maxage=60");
  expect(second).toBe(first);
  expect(third).not.toBe(second);
  expect(Number(third)).toBeGreaterThan(Number(second));
});
