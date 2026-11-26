import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("route-prefetching: hovering <Link preload=intent> fetches target code/data before click", async ({ page }) => {
  await page.goto("/feature-tests/route-prefetching");
  await page.waitForLoadState("networkidle");

  const log: { url: string; phase: string }[] = [];
  let phase = "hover";
  page.on("request", (req) => {
    const url = req.url();
    if (url.includes("/_serverFn/") || /\/assets\/.*\.js$/.test(url)) log.push({ url, phase });
  });

  await page.getByTestId("prefetch-link").hover();
  await page.waitForTimeout(1000);
  const beforeClick = log.filter((r) => r.phase === "hover");

  phase = "click";
  await page.getByTestId("prefetch-link").click();
  await expect(page.getByTestId("target-data")).toHaveText("ft-prefetch-target-data");
  const afterClick = log.filter((r) => r.phase === "click");

  const short = (u: string) => new URL(u).pathname.replace(/^\/assets\//, "").slice(0, 40);
  evidence(
    `on hover (before click): ${beforeClick.map((r) => short(r.url)).join(", ") || "nothing"}; after click: ${
      afterClick.length
    } more request(s)`,
  );
  expect(beforeClick.some((r) => r.url.includes("/_serverFn/"))).toBe(true);
  expect(beforeClick.some((r) => /target-.*\.js$/.test(r.url))).toBe(true);
});
