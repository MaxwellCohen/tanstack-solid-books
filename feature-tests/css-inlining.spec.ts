import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("css-inlining: route CSS is inlined and not linked render-blocking", async ({ page, request }) => {
  const html = await (await request.get("/feature-tests/css-inlining")).text();
  const head = html.slice(0, html.indexOf("</head>"));

  const styles = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const inlined = styles.some((css) => css.includes(".ft-css-inline-marker"));

  // Any <link rel=stylesheet> in <head> whose file contains the route's CSS is render-blocking.
  const links = [...head.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  const blocking: string[] = [];
  for (const href of links) {
    const css = await (await request.get(href)).text();
    if (css.includes("ft-css-inline-marker")) blocking.push(href);
  }

  await page.goto("/feature-tests/css-inlining");
  const color = await page.getByTestId("css-marker").evaluate((el) => getComputedStyle(el).color);

  evidence(
    `inline <style> with route CSS: ${inlined}; render-blocking <link rel=stylesheet> for same CSS: ${
      blocking.length ? blocking.join(", ") : "none"
    }; computed color ${color}`,
  );
  expect(inlined, "route CSS should be in an inline <style>").toBe(true);
  expect(color).toBe("rgb(12, 34, 56)");
  expect(blocking, "route CSS must not also be a render-blocking <link rel=stylesheet>").toEqual([]);
});
