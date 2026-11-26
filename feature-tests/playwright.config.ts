import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.FT_PORT ?? 4111);

export default defineConfig({
  testDir: ".",
  outputDir: "./.pw/test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"], ["json", { outputFile: process.env.FT_JSON ?? "./.pw/report.json" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: { executablePath: "/home/maxc/.local/bin/google-chrome" },
  },
});
