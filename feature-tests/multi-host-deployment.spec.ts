import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { ROOT } from "./helpers";
import { evidence } from "./helpers";

// Each target: env that vite.config.ts uses to pick the adapter, and the output it must produce.
const TARGETS = [
  { name: "node (nitro)", env: { NITRO_PRESET: "node" }, clean: [".output"], expect: [".output/server/index.mjs", ".output/public"] },
  { name: "vercel (nitro preset)", env: { NITRO_PRESET: "vercel" }, clean: [".vercel/output"], expect: [".vercel/output/config.json", ".vercel/output/functions", ".vercel/output/static"] },
  { name: "netlify (@netlify/vite-plugin-tanstack-start)", env: { NETLIFY: "1" }, clean: [".netlify", "dist"], expect: [".netlify/v1/functions", "dist/client"] },
  { name: "cloudflare (@cloudflare/vite-plugin)", env: { CLOUDFLARE: "1" }, clean: ["dist"], expect: ["dist/client", "dist/server/wrangler.json"] },
];

test("multi-host-deployment: builds for node, vercel, netlify and cloudflare", async () => {
  test.setTimeout(1_200_000);
  const results: string[] = [];
  let passed = 0;
  for (const t of TARGETS) {
    for (const dir of t.clean) rmSync(`${ROOT}/${dir}`, { recursive: true, force: true });
    let built = true;
    try {
      execSync("npx vite build", { env: { ...process.env, ...t.env }, stdio: "pipe", cwd: ROOT });
    } catch {
      built = false;
    }
    const missing = t.expect.filter((p) => !existsSync(`${ROOT}/${p}`));
    const ok = built && missing.length === 0;
    if (ok) passed++;
    results.push(`${t.name}: ${ok ? "ok" : built ? `missing ${missing.join(",")}` : "build failed"}`);
  }
  evidence(results.join("; "));
  expect(passed).toBeGreaterThanOrEqual(2);
  expect(passed).toBe(TARGETS.length);
});
