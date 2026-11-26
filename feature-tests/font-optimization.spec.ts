import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("font-optimization: self-hosted Fontsource font with font-display and preload", async ({ page }) => {
  const external: string[] = [];
  const fontRequests: string[] = [];
  page.on("request", (req) => {
    const url = req.url();
    if (/fonts\.(googleapis|gstatic)\.com/.test(url)) external.push(url);
    if (req.resourceType() === "font" || url.endsWith(".woff2")) fontRequests.push(url);
  });

  const response = await page.goto("/feature-tests/font-optimization");
  const html = (await response!.text()) as string;
  const head = html.slice(0, html.indexOf("</head>"));

  const preload = head.match(/<link[^>]*rel="preload"[^>]*as="font"[^>]*>|<link[^>]*as="font"[^>]*rel="preload"[^>]*>/)?.[0];
  const fontFaces = [...head.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);
  const withDisplay = fontFaces.filter((rule) => /font-display:\s*(optional|swap|fallback|block)/.test(rule));

  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  const origin = new URL(page.url()).origin;
  const sameOrigin = fontRequests.filter((u) => u.startsWith(origin));

  evidence(
    `${fontFaces.length} inline @font-face (${withDisplay.length} with font-display), preload ${
      preload ? "present" : "missing"
    }, ${sameOrigin.length} same-origin woff2 request(s), ${external.length} Google Fonts request(s)`,
  );
  expect(external).toEqual([]);
  expect(fontFaces.length).toBeGreaterThan(0);
  expect(withDisplay.length).toBe(fontFaces.length);
  expect(preload).toBeTruthy();
  expect(sameOrigin.length).toBeGreaterThan(0);
});
