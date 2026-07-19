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

test("models one dodecahedral body with twelve faces and thirty unique edges", async () => {
  const [bodySource, houseSource, monitorSource] = await Promise.all([
    readFile(new URL("lib/quincunx/whole-body.ts", templateRoot), "utf8"),
    readFile(new URL("types/houses.ts", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/WholeBodyMonitor.tsx", templateRoot), "utf8"),
  ]);

  const edgeBlock = bodySource.match(/const EDGE_PAIRS[^=]*= \[([\s\S]*?)\n\];/);
  assert.ok(edgeBlock, "edge topology is declared once");
  const pairs = [...edgeBlock[1].matchAll(/\[(\d+),\s*(\d+)\]/g)].map((match) =>
    match.slice(1).map(Number),
  );
  assert.equal(pairs.length, 30, "a dodecahedron has exactly thirty edges");

  const normalizedEdges = new Set();
  const degree = new Map(Array.from({ length: 12 }, (_, index) => [index + 1, 0]));
  for (const [houseA, houseB] of pairs) {
    assert.notEqual(houseA, houseB, "an edge cannot link a face to itself");
    assert.ok(houseA >= 1 && houseA <= 12 && houseB >= 1 && houseB <= 12);
    normalizedEdges.add([houseA, houseB].sort((a, b) => a - b).join("-"));
    degree.set(houseA, degree.get(houseA) + 1);
    degree.set(houseB, degree.get(houseB) + 1);
  }

  assert.equal(normalizedEdges.size, 30, "no edge or reversed edge is duplicated");
  for (const [house, connections] of degree) {
    assert.equal(connections, 5, `face ${house} touches exactly five edges`);
  }

  const houseNumbers = [...houseSource.matchAll(/^\s*(\d+): \{ number: \d+/gm)].map((match) => Number(match[1]));
  assert.deepEqual(houseNumbers, Array.from({ length: 12 }, (_, index) => index + 1));
  assert.match(bodySource, /resolveCurrentPair\(houseA\.current, houseB\.current\)/);
  assert.match(bodySource, /id: "observer"/);
  assert.match(monitorSource, /body\.pillars\.map/);
  assert.match(monitorSource, /body\.faces\.map/);
  assert.match(monitorSource, /body\.edges\.map/);
  assert.match(monitorSource, /Triangle of Trust/);
});

test("updates the whole-body model from prompt input in real time", async () => {
  const [dashboardSource, observerSource, pageSource] = await Promise.all([
    readFile(new URL("components/quincunx/QuincunxDashboard.tsx", templateRoot), "utf8"),
    readFile(new URL("components/ObserverConsole.tsx", templateRoot), "utf8"),
    readFile(new URL("app/quincunx/page.tsx", templateRoot), "utf8"),
  ]);

  assert.match(dashboardSource, /runDodecanicCycle\(prompt\.trim\(\)/);
  assert.match(dashboardSource, /onChange=\{\(event\) => setPrompt\(event\.target\.value\)\}/);
  assert.match(observerSource, /WholeBodyMonitor result=\{displayResult\}/);
  assert.match(pageSource, /The Dodecahedron is the field of creation/);
});
