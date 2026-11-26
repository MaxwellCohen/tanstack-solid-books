// Builds, serves on PORT (default 4111), runs every feature spec, writes feature-tests/results.json.
import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DIR = fileURLToPath(new URL(".", import.meta.url));
const PORT = process.env.FT_PORT ?? "4111";

const META = {
  "css-inlining": { claimedLabel: "experimental", method: "TanStack Start `server.build.inlineCss: true` (vite.config.ts) + route-level `import '…/css-inlining.css'`" },
  "font-optimization": { claimedLabel: "third-party", method: "@fontsource-variable/geist woff2 via hand-written @font-face (font-display: optional) in app.css + head().links preload in __root.tsx" },
  "image-pipeline": { claimedLabel: "third-party", method: "@unpic/solid <Image> (port's Image wrapper) with IPX transformer at /_ipx (Nitro server route)" },
  caching: { claimedLabel: "first-party", method: "TanStack Router loader cache (`staleTime: 5_000`) over a createServerFn counter + route `headers()` Cache-Control" },
  "route-prefetching": { claimedLabel: "first-party", method: "@tanstack/solid-router <Link preload=\"intent\"> to a route with a server-fn loader (router also sets defaultPreload: 'intent')" },
  islands: { claimedLabel: "experimental", method: "<Hydrate when={never()}> around a static card + <Hydrate when={visible()}> around a counter (@tanstack/solid-start)" },
  "render-modes": { claimedLabel: "first-party", method: "Per-route `ssr: true` vs `ssr: false` (selective SSR) + `prerender.pages` for one route" },
  reactivity: { claimedLabel: "first-party", method: "Solid createSignal; component-body run counter on window" },
  "bundle-analysis": { claimedLabel: "third-party", method: "rollup-plugin-visualizer (treemap + raw-data) added to the client environment when ANALYZE=1" },
  "third-party-scripts": { claimedLabel: "manual", method: "Hand-rolled inline loader in route head().scripts that injects the script after window load + requestIdleCallback" },
  "multi-host-deployment": { claimedLabel: "third-party", method: "vite.config.ts adapter switch: nitro() (node / NITRO_PRESET=vercel), @netlify/vite-plugin-tanstack-start, @cloudflare/vite-plugin" },
};

const sh = (cmd, env = {}) => execSync(cmd, { cwd: ROOT, stdio: "inherit", env: { ...process.env, ...env } });

function playwright(jsonName, args) {
  const out = `${DIR}.pw/${jsonName}`;
  rmSync(out, { force: true });
  try {
    execSync(`npx playwright test --config playwright.config.ts ${args}`, {
      cwd: DIR,
      stdio: "inherit",
      env: { ...process.env, FT_PORT: PORT, FT_JSON: out },
    });
  } catch {
    // failures are recorded in the JSON report
  }
  return existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : null;
}

async function waitForServer(url, ms = 30_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`server did not start at ${url}`);
}

const reports = [];
// 1. Build-time features first (they run their own builds and overwrite output dirs).
reports.push(playwright("build.json", "bundle-analysis.spec.ts multi-host-deployment.spec.ts"));

// 2. Production node build + server on PORT.
sh("npx vite build");
const server = spawn("node", [".output/server/index.mjs"], {
  cwd: ROOT,
  env: { ...process.env, PORT, HOST: "127.0.0.1" },
  stdio: "ignore",
});
try {
  await waitForServer(`http://localhost:${PORT}/feature-tests/`);
  // 3. Browser features against the running production server.
  reports.push(playwright("browser.json", "--grep-invert \"bundle-analysis|multi-host\""));
} finally {
  server.kill("SIGTERM");
}

// 4. Merge into results.json.
const results = {};
for (const report of reports.filter(Boolean)) {
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      const id = spec.file.replace(/\.spec\.ts$/, "").split("/").pop();
      const t = spec.tests[0];
      const r = t.results.at(-1);
      const notes = Object.fromEntries((t.annotations ?? []).map((a) => [a.type, a.description]));
      const error = (r?.error?.message ?? "").replace(/\x1b\[[0-9;]*m/g, "").split("\n")[0];
      results[id] = {
        ...META[id],
        status: r?.status === "passed" ? "pass" : "fail",
        evidence: notes.evidence ?? (error || "no evidence recorded"),
        ...(notes.suggestedLabel ? { suggestedLabel: notes.suggestedLabel } : {}),
        test: `feature-tests/${id}.spec.ts`,
      };
      if (r?.status !== "passed" && notes.evidence && error) results[id].evidence += ` — failed: ${error}`;
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites) walk(suite);
}
const ordered = Object.fromEntries(
  Object.keys(META).map((id) => [id, results[id] ?? { ...META[id], status: "blocked", evidence: "spec did not run", test: `feature-tests/${id}.spec.ts` }]),
);
const commit = execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim();
writeFileSync(
  `${DIR}results.json`,
  JSON.stringify(
    { framework: "tanstack-start-solid", repo: "tanstack-solid-books", commit, ranAt: new Date().toISOString(), results: ordered },
    null,
    2,
  ) + "\n",
);
console.table(Object.fromEntries(Object.entries(ordered).map(([k, v]) => [k, v.status])));
