import { expect, test } from "@playwright/test";
import { evidence } from "./helpers";

test("reactivity: signal updates the text node without re-running the component", async ({ page }) => {
  await page.goto("/feature-tests/reactivity");
  await page.waitForLoadState("networkidle");
  await expect.poll(() => page.evaluate(() => window.__ftRenderCount)).toBe(1);

  // Tag the text node to prove it is updated in place, not replaced by a re-render.
  await page.getByTestId("count").evaluate((el) => ((el as any).__ftTag = "same-node"));
  for (let i = 0; i < 3; i++) await page.getByTestId("increment").click();
  await expect(page.getByTestId("count")).toHaveText("3");

  const renders = await page.evaluate(() => window.__ftRenderCount);
  const sameNode = await page.getByTestId("count").evaluate((el) => (el as any).__ftTag === "same-node");
  evidence(`count 0 → 3 after 3 clicks; component render count ${renders}; same <span> node: ${sameNode}`);
  expect(renders).toBe(1);
  expect(sameNode).toBe(true);
});
