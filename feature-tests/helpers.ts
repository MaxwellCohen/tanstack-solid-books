import { fileURLToPath } from "node:url";
import { test } from "@playwright/test";

/** Repo root (specs run with cwd = feature-tests/). */
export const ROOT = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");

/** Attach a one-line evidence string to the current test (collected into results.json). */
export function evidence(text: string) {
  test.info().annotations.push({ type: "evidence", description: text });
}

/** Record a label correction suggested by what the test observed. */
export function suggestLabel(label: string) {
  test.info().annotations.push({ type: "suggestedLabel", description: label });
}
