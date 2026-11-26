import { execSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { ROOT } from "./helpers";
import { evidence } from "./helpers";

test("bundle-analysis: ANALYZE=1 build writes rollup-plugin-visualizer report", async () => {
  test.setTimeout(600_000);
  rmSync(`${ROOT}/.analyze`, { recursive: true, force: true });
  execSync("npx vite build", { env: { ...process.env, ANALYZE: "1" }, stdio: "pipe", cwd: ROOT });
  const html = `${ROOT}/.analyze/client.html`;
  const json = `${ROOT}/.analyze/client.json`;
  const ok = existsSync(html) && existsSync(json);
  evidence(
    ok
      ? `${html} (${statSync(html).size} B) and ${json} (${statSync(json).size} B) written`
      : `report missing: html ${existsSync(html)}, json ${existsSync(json)}`,
  );
  expect(existsSync(html)).toBe(true);
  expect(existsSync(json)).toBe(true);
  expect(statSync(html).size).toBeGreaterThan(1000);
});
