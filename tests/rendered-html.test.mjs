import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("builds the three-step origin journey", async () => {
  const [home, portal, loadingPage, loading] = await Promise.all([
    source("app/page.tsx"),
    source("components/BirthPortal.tsx"),
    source("app/loading/page.tsx"),
    source("components/BirthLoading.tsx"),
    access(new URL(".next/BUILD_ID", root)),
  ]);

  assert.match(home, /<BirthPortal \/>/);
  assert.match(portal, /type="date"/);
  assert.match(portal, /type="time"/);
  assert.match(portal, /City, region, country/);
  assert.match(portal, /sessionStorage\.setItem/);
  assert.match(portal, /location\.assign\("\/loading"\)/);
  assert.match(loadingPage, /<BirthLoading \/>/);
  assert.match(loading, /HOUSE_SPECTRUM_ORDER\.map/);
  assert.match(loading, /location\.replace\("\/quincunx"\)/);
  assert.match(loading, /Verified natal placements appear only after the licensed astrology engine is connected/);
});

test("keeps one lean product architecture and design system", async () => {
  const [dashboard, tokens, packageJson, architecture, designSystem] = await Promise.all([
    source("components/quincunx/QuincunxDashboard.tsx"),
    source("app/design-system.css"),
    source("package.json"),
    source("docs/ARCHITECTURE.md"),
    source("docs/DESIGN_SYSTEM.md"),
  ]);

  for (const label of ["00 / You", "01 / Now", "02 / Field", "03 / Session", "04 / Houses"]) {
    assert.match(dashboard, new RegExp(label.replace("/", "\\/")));
  }
  assert.doesNotMatch(dashboard, /Diagnostics|05 \/ Presence|06 \/ Spectrum/);
  assert.match(dashboard, /<CurrentSkyPanel profile=\{birthProfile\} \/>/);
  assert.match(dashboard, /<TriangleOfTrust triangle=\{snapshot\.body\.triangle\} result=\{snapshot\.result\} \/>/);
  assert.match(tokens, /--color-canvas/);
  assert.match(tokens, /--shelf-height: 66\.667svh/);
  assert.match(architecture, /Origin portal[\s\S]*Living field/);
  assert.match(designSystem, /One accent has one meaning/);
  assert.doesNotMatch(packageJson, /drizzle|tailwind|wrangler|cloudflare/);

  for (const removed of [
    "components/ObserverConsole.tsx",
    "components/DodecahedronViewer.tsx",
    "app/api/quincunx/route.ts",
    "app/api/observer/diagnostics/route.ts",
    "drizzle.config.ts",
  ]) {
    await assert.rejects(access(new URL(removed, root)));
  }
});

test("ships all eight observer currents with honest session persistence", async () => {
  const [types, route, store, dashboard] = await Promise.all([
    source("lib/types.ts"),
    source("app/api/cycle/route.ts"),
    source("lib/observer-store.ts"),
    source("components/quincunx/QuincunxDashboard.tsx"),
  ]);

  for (const symbol of ["V", "∧", "W", "∆", "X", "◇", "∞", "8"]) {
    assert.match(types, new RegExp(`symbol: "${symbol}"`));
  }
  assert.match(route, /runDodecanicCycle/);
  assert.match(route, /saveCycle/);
  assert.match(store, /lifetime of the current Node process/);
  assert.match(dashboard, /durable memory is not connected/);
});

test("models one dodecahedron with twelve faces and thirty unique edges", async () => {
  const [topology, body, houses, monitor, presence, trust] = await Promise.all([
    source("lib/dodecahedron/topology.ts"),
    source("lib/quincunx/whole-body.ts"),
    source("types/houses.ts"),
    source("components/quincunx/WholeBodyMonitor.tsx"),
    source("components/quincunx/QuincunxPresence.tsx"),
    source("components/quincunx/TriangleOfTrust.tsx"),
  ]);

  const edgeBlock = topology.match(/DODECAHEDRON_EDGE_PAIRS[^=]*= \[([\s\S]*?)\n\];/);
  assert.ok(edgeBlock);
  const pairs = [...edgeBlock[1].matchAll(/\[(\d+),\s*(\d+)\]/g)].map((match) => match.slice(1).map(Number));
  assert.equal(pairs.length, 30);
  assert.equal(new Set(pairs.map((pair) => pair.sort((a, b) => a - b).join("-"))).size, 30);

  const degree = new Map(Array.from({ length: 12 }, (_, index) => [index + 1, 0]));
  for (const [houseA, houseB] of pairs) {
    degree.set(houseA, degree.get(houseA) + 1);
    degree.set(houseB, degree.get(houseB) + 1);
  }
  for (const connections of degree.values()) assert.equal(connections, 5);

  assert.equal([...houses.matchAll(/^\s*\d+: \{ number: \d+/gm)].length, 12);
  assert.match(body, /pillarState\("aetheric"/);
  assert.match(body, /resolveCurrentPair\(houseA\.current, houseB\.current\)/);
  assert.match(monitor, /<QuincunxPresence/);
  assert.doesNotMatch(monitor, /body\.faces\.map|body\.edges\.map/);
  assert.match(presence, /Position 9 observer/);
  assert.match(trust, /Master sets direction/);
  assert.match(trust, /Read-only modeled instrument/);
});

test("keeps the interactive solid as the primary field surface", async () => {
  const [dashboard, living, telemetryRoute, telemetryHook, escapement] = await Promise.all([
    source("components/quincunx/QuincunxDashboard.tsx"),
    source("components/dodecahedron/LivingDodecahedron.tsx"),
    source("app/api/observer/telemetry/route.ts"),
    source("hooks/useObserverTelemetry.ts"),
    source("lib/triangle-escapement.ts"),
  ]);

  assert.match(dashboard, /runDodecanicCycle\(prompt\.trim\(\)/);
  assert.match(dashboard, /className="nav-prompt"/);
  assert.match(dashboard, /className="field-viewport"/);
  assert.match(living, /DODECAHEDRON_VERTICES\.map/);
  assert.match(living, /DODECAHEDRON_FACES\.map/);
  assert.match(living, /isPointInPolygon\(x, y, point\.points\)/);
  assert.match(living, /event\.code !== "Space"/);
  assert.match(living, /HOUSE_ROMAN, HOUSE_SPECTRUM/);
  assert.match(living, /mixHouseColors/);
  assert.match(living, /COMPASS_DIRECTIONS\.map/);
  assert.match(living, /rotatePoint\(direction\.coordinates, angleY, angleX\)/);
  assert.match(living, /QUINCUNX_DOMAINS\.map/);
  assert.match(living, /body\.quincunx\.corners\[point\.id\]\.coherence/);
  for (const domain of ["PHYSICAL", "MENTAL", "EMOTIONAL", "SPIRITUAL"]) assert.match(living, new RegExp(domain));
  assert.match(living, /useState<Selection>\(\{ kind: "observer", id: "Ø" \}\)/);
  assert.match(living, /YOU \/ HUMAN CENTER/);
  assert.match(living, /className="human-figure"/);
  assert.match(living, /className="human-body"/);
  assert.match(living, /className="human-echo"/);
  assert.match(living, /"Ø SELECTED"/);
  assert.match(escapement, /TARGET_COHERENCE - triangle\.coherence/);
  assert.match(escapement, /read-only one-tick model/);
  assert.doesNotMatch(escapement, /supabase|createClient|collectTriangleVotes/);
  assert.match(telemetryRoute, /listCycles\(limit\)/);
  assert.match(telemetryHook, /setInterval\(\(\) => void refetch\(\), 12_000\)/);
});

test("separates fixed natal, current sky, and Dodecanic meaning", async () => {
  const [profile, currentSky, astrologyTypes, provider, supabase, migration] = await Promise.all([
    source("components/quincunx/NatalProfilePanel.tsx"),
    source("components/CurrentSkyPanel.tsx"),
    source("lib/astrology/types.ts"),
    source("lib/astrology/provider.ts"),
    source("lib/supabase/client.ts"),
    source("supabase/migrations/20260719_birth_profiles.sql"),
  ]);

  assert.match(profile, /Fixed layer/);
  assert.match(profile, /Moving layer/);
  assert.match(profile, /Meaning layer/);
  assert.match(profile, /Nothing is guessed/);
  assert.match(currentSky, /new Date\(\)\.toISOString\(\)/);
  assert.match(currentSky, /Current UTC/);
  assert.match(currentSky, /Planetary positions remain uncalculated/);
  assert.match(astrologyTypes, /NATAL_CHART_SCHEMA_VERSION = 1/);
  assert.match(provider, /interface NatalChartProvider/);
  assert.doesNotMatch(provider, /from ["'](?:swisseph|sweph-wasm)/);
  assert.match(supabase, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /auth\.uid\(\)/);
});

test("uses one canonical twelve-House spectrum everywhere", async () => {
  const [spectrum, component, dashboard, living, profile, css] = await Promise.all([
    source("lib/house-spectrum.ts"),
    source("components/houses/HouseSpectrum.tsx"),
    source("components/quincunx/QuincunxDashboard.tsx"),
    source("components/dodecahedron/LivingDodecahedron.tsx"),
    source("components/quincunx/NatalProfilePanel.tsx"),
    source("app/globals.css"),
  ]);

  assert.equal([...spectrum.matchAll(/^\s+\d+: \{ colorHex:/gm)].length, 12);
  for (const field of ["colorHex", "wavelengthNm", "lightFrequencyThz", "soundFrequencyHz", "geometry", "mode", "note"]) {
    assert.match(spectrum, new RegExp(field));
  }
  assert.match(component, /Master correspondence system/);
  assert.match(component, /not a literal sound-to-light conversion/);
  assert.match(dashboard, /<HouseSpectrum \/>/);
  assert.match(living, /HOUSE_SPECTRUM\[selectedFace\.house\.number\]/);
  assert.match(profile, /HOUSE_SPECTRUM_CONIC/);
  assert.match(css, /grid-template-columns: repeat\(5, minmax\(0, 1fr\)\)/);

  const subTenPixelType = [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((match) => Number(match[1]))
    .filter((size) => size < 10);
  assert.deepEqual(subTenPixelType, []);
});
