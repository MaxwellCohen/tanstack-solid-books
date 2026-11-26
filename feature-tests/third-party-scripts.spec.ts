import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("third-party-scripts: stand-in script loads after window load + idle, never parser-blocking", async ({ page, request }) => {
  const html = await (await request.get("/feature-tests/third-party-scripts")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  const blockingTag = /<script[^>]*src="[^"]*fake-analytics\.js"/.test(html);

  await page.addInitScript(() => {
    addEventListener("load", () => ((window as any).__ftLoadAt = performance.now()));
  });
  let requestedAt = -1;
  page.on("request", async (req) => {
    if (req.url().includes("fake-analytics.js")) requestedAt = Date.now();
  });
  await page.goto("/feature-tests/third-party-scripts");
  await page.waitForFunction(() => (window as any).__fakeAnalytics, null, { timeout: 15_000 });
  const timing = await page.evaluate(() => ({
    loadAt: (window as any).__ftLoadAt as number,
    ranAt: (window as any).__fakeAnalytics.loadedAt as number,
    readyState: (window as any).__fakeAnalytics.readyState as string,
  }));

  evidence(
    `no <script src=fake-analytics> in HTML: ${!blockingTag}; loader inline in <head>: ${head.includes(
      "fake-analytics.js",
    )}; window load at ${timing.loadAt.toFixed(0)}ms, script ran at ${timing.ranAt.toFixed(0)}ms (readyState ${timing.readyState})`,
  );
  expect(blockingTag).toBe(false);
  expect(requestedAt).toBeGreaterThan(0);
  expect(timing.ranAt).toBeGreaterThanOrEqual(timing.loadAt);
  expect(timing.readyState).toBe("complete");
});
