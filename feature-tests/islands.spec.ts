import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

const MARKER = "FT_STATIC_ISLAND_MARKER_7f3a";

test("islands: <Hydrate when=never> keeps static code off the client; visible() island works", async ({ page }) => {
  const jsBodies: { url: string; body: string }[] = [];
  page.on("response", async (res) => {
    const url = res.url();
    if (res.request().resourceType() === "script" || url.endsWith(".js")) {
      try {
        jsBodies.push({ url, body: await res.text() });
      } catch {}
    }
  });

  const response = await page.goto("/feature-tests/islands");
  const html = await response!.text();
  await page.waitForLoadState("networkidle");

  const buttons = await page.getByTestId("island-button").count();
  await page.getByTestId("island-button").first().click();
  await page.getByTestId("island-button").first().click();
  await expect(page.getByTestId("island-count").first()).toHaveText("2");

  const shipped = jsBodies.filter((b) => b.body.includes(MARKER)).map((b) => new URL(b.url).pathname);
  evidence(
    `marker in SSR HTML: ${html.includes(MARKER)}; island buttons in DOM: ${buttons}; counter → 2 after clicks; ${jsBodies.length} JS files loaded, marker found in: ${
      shipped.join(", ") || "none"
    }`,
  );
  expect(html).toContain(MARKER);
  await expect(page.getByTestId("static-card")).toContainText(MARKER);
  expect(buttons).toBe(1);
  expect(shipped).toEqual([]);
});
