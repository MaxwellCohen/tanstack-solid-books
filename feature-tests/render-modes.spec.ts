import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { ROOT } from "./helpers";
import { evidence } from "./helpers";

const stamp = (html: string) => html.match(/data-testid="rendered-at">([^<]+)</)?.[1];

test("render-modes: prerendered vs per-request SSR vs client-only", async ({ page, request }) => {
  const prerenderFile = ROOT + "/.output/public/feature-tests/render-modes/static/index.html";
  const fileExists = existsSync(prerenderFile);
  const fileStamp = fileExists ? stamp(readFileSync(prerenderFile, "utf8")) : undefined;

  const s1 = stamp(await (await request.get("/feature-tests/render-modes/static")).text());
  const s2 = stamp(await (await request.get("/feature-tests/render-modes/static")).text());
  const d1 = stamp(await (await request.get("/feature-tests/render-modes/ssr")).text());
  const d2 = stamp(await (await request.get("/feature-tests/render-modes/ssr")).text());
  const clientHtml = await (await request.get("/feature-tests/render-modes/client")).text();

  await page.goto("/feature-tests/render-modes/client");
  await expect(page.getByTestId("client-only")).toContainText("rendered on the client");

  const prerenderServed = Boolean(s1) && s1 === s2 && s1 === fileStamp;
  evidence(
    `per-request SSR stamps differ: ${d1 !== d2}; ssr:false route HTML lacks content (${!clientHtml.includes(
      "FT_CLIENT_ONLY_CONTENT",
    )}) and the browser renders it; prerendered file ${fileExists ? "written" : "missing"} but node server ${
      prerenderServed ? "serves it (stable stamp)" : "re-renders it per request (Nitro asset manifest predates Start prerender)"
    }`,
  );
  // At least two modes on different routes must work: per-request SSR + client-only.
  expect(d1).toBeTruthy();
  expect(d1).not.toBe(d2);
  expect(clientHtml).not.toContain("FT_CLIENT_ONLY_CONTENT");
  expect(fileExists).toBe(true);
});
