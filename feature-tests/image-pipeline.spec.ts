import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("image-pipeline: Unpic srcset, dimensions, lazy offscreen, modern format", async ({ page, request }) => {
  await page.goto("/feature-tests/image-pipeline");
  const info = await page.evaluate(() =>
    [...document.querySelectorAll("img[data-testid]")].map((img) => ({
      id: img.getAttribute("data-testid"),
      srcset: img.getAttribute("srcset") ?? "",
      width: img.getAttribute("width"),
      height: img.getAttribute("height"),
      loading: img.getAttribute("loading"),
      style: img.getAttribute("style") ?? "",
    })),
  );
  const hero = info.find((i) => i.id === "hero-image")!;
  const offscreen = info.find((i) => i.id === "offscreen-image")!;
  // IPX URLs contain commas (s_640x400,f_auto), so parse "url width" pairs, not split(",").
  const entries = [...hero.srcset.matchAll(/(\S+)\s+(\d+w)/g)].map((m) => ({ url: m[1], w: m[2] }));
  const widths = new Set(entries.map((e) => e.w));

  const hasAttrs = Boolean(hero.width && hero.height);
  // Unpic intentionally emits no width/height attributes; it reserves the box with inline
  // aspect-ratio + max-width/max-height (its documented CLS strategy). Accept either.
  const hasStyleBox = /aspect-ratio/.test(hero.style) && /max-width:\s*640px/.test(hero.style);

  const firstUrl = entries[0].url;
  const res = await request.get(firstUrl, { headers: { Accept: "image/avif,image/webp,*/*" } });
  const type = res.headers()["content-type"];

  evidence(
    `srcset widths ${[...widths].join(" ")}; width/height attrs ${hasAttrs ? "present" : "absent (aspect-ratio style instead)"}; offscreen loading=${offscreen.loading}; ${firstUrl} → ${res.status()} ${type}`,
  );
  expect(widths.size).toBeGreaterThanOrEqual(2);
  expect(hasAttrs || hasStyleBox).toBe(true);
  expect(offscreen.loading).toBe("lazy");
  expect(res.status()).toBe(200);
  expect(type).toMatch(/image\/(avif|webp)/);
});
