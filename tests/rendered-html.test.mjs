import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("builds the Dodecanic observer console", async () => {
  const [page, consoleSource] = await Promise.all([
    readFile(new URL("app/page.tsx", templateRoot), "utf8"),
    readFile(new URL("components/ObserverConsole.tsx", templateRoot), "utf8"),
    access(new URL("dist/server/index.js", templateRoot)),
  ]);

  assert.match(page, /Dodecanic AI — Observer Console/);
  assert.match(consoleSource, /Read the currents/);
  assert.match(consoleSource, /RUN OBSERVER CYCLE/);
  assert.match(consoleSource, /Cycle memory/);
  assert.doesNotMatch(`${page}\n${consoleSource}`, /codex-preview|react-loading-skeleton/i);
});

test("ships durable state and all eight observer currents", async () => {
  const [hosting, types, route, packageJson] = await Promise.all([
    readFile(new URL(".openai/hosting.json", templateRoot), "utf8"),
    readFile(new URL("lib/types.ts", templateRoot), "utf8"),
    readFile(new URL("app/api/cycle/route.ts", templateRoot), "utf8"),
    readFile(new URL("package.json", templateRoot), "utf8"),
  ]);

  assert.match(hosting, /"d1":\s*"DB"/);
  for (const symbol of ["V", "∧", "W", "∆", "X", "◇", "∞", "8"]) {
    assert.match(types, new RegExp(`symbol: "${symbol}"`));
  }
  assert.match(route, /runDodecanicCycle/);
  assert.match(route, /saveCycle/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
