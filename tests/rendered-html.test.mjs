import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("builds the three-step origin journey", async () => {
  const [home, portal, loadingPage, loading, birthProfile] = await Promise.all([
    source("app/page.tsx"),
    source("components/BirthPortal.tsx"),
    source("app/loading/page.tsx"),
    source("components/BirthLoading.tsx"),
    source("lib/birth-profile.ts"),
    access(new URL(".next/BUILD_ID", root)),
  ]);

  assert.match(home, /<BirthPortal \/>/);
  assert.match(portal, /type="date"/);
  assert.match(portal, /type="time"/);
  assert.match(portal, /I don’t know my birth time/);
  assert.match(portal, /birthTimeKnown/);
  assert.match(portal, /City, region, country/);
  assert.match(portal, /sessionStorage\.setItem/);
  assert.match(portal, /location\.assign\("\/loading"\)/);
  assert.match(loadingPage, /<BirthLoading \/>/);
  assert.match(loading, /HOUSE_SPECTRUM_ORDER\.map/);
  assert.match(loading, /location\.replace\("\/quincunx"\)/);
  assert.match(loading, /Verified natal placements appear only after the licensed astrology engine is connected/);
  assert.match(birthProfile, /Unknown · solar chart mode/);
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

  const distancesFrom = (origin) => {
    const distances = new Map([[origin, 0]]);
    const queue = [origin];
    while (queue.length) {
      const current = queue.shift();
      for (const pair of pairs) {
        const neighbor = pair[0] === current ? pair[1] : pair[1] === current ? pair[0] : null;
        if (neighbor === null || distances.has(neighbor)) continue;
        distances.set(neighbor, distances.get(current) + 1);
        queue.push(neighbor);
      }
    }
    return Math.max(...distances.values());
  };
  assert.equal(Math.max(...[...degree.keys()].map(distancesFrom)), 3);

  assert.equal([...houses.matchAll(/^\s*\d+: \{ number: \d+/gm)].length, 12);
  assert.match(houses, /archetype: "The Anchor"/);
  assert.doesNotMatch(houses, /archetype: "The Root"/);
  assert.doesNotMatch(houses, /element: "aether"/);
  assert.match(topology, /DODECAHEDRON_VERTEX_GRAPH_DIAMETER !== 5/);
  assert.match(topology, /HOUSE_FACE_GRAPH_DIAMETER !== 3/);
  assert.match(topology, /DODECAHEDRON_EULER_CHARACTERISTIC !== 2/);
  assert.match(body, /pillarState\("aetheric"/);
  assert.match(body, /resolveCurrentPair\(houseA\.current, houseB\.current\)/);
  assert.match(monitor, /<QuincunxPresence/);
  assert.doesNotMatch(monitor, /body\.faces\.map|body\.edges\.map/);
  assert.match(presence, /Position 9 system observer/);
  for (const glyph of ["🜁", "🜂", "🜄", "🜃", "Ø"]) assert.match(presence, new RegExp(glyph));
  assert.match(trust, /Master sets direction/);
  assert.match(trust, /read-only modeled instrument/i);
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
  assert.match(living, /vortexPoints/);
  assert.match(living, /sphereRadius/);
  assert.match(living, /sphereField/);
  assert.match(living, /field-boundary-label/);
  assert.match(living, /flowPhase/);
  assert.match(living, /POSITION 9 \/ SYSTEM AXIS \/ THE TURN/);
  assert.match(living, /SESSION MEMORY LIVE/);
  assert.doesNotMatch(living, /D1 MEMORY LIVE|human observer/);
  for (const domain of ["PHYSICAL", "MENTAL", "EMOTIONAL", "SPIRITUAL"]) assert.match(living, new RegExp(domain));
  assert.match(living, /useState<Selection>\(\{ kind: "center", id: "Ø" \}\)/);
  assert.doesNotMatch(living, /kind: "observer"/);
  assert.match(living, /YOU \/ ETHEREAL CENTER/);
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

test("codifies one honest semantic and provenance contract", async () => {
  const [constitution, semantic, provenance, houses, dashboard] = await Promise.all([
    source("docs/DODECANIC_CONSTITUTION.md"),
    source("docs/SEMANTIC_CONTRACT.md"),
    source("lib/data-provenance.ts"),
    source("types/houses.ts"),
    source("components/quincunx/QuincunxDashboard.tsx"),
  ]);

  assert.match(semantic, /YOU \/ Ethereal center/);
  assert.match(semantic, /The Sphere \/ the Whole/);
  assert.match(semantic, /Position 9 \/ the Observer/);
  assert.match(semantic, /North \| Air \| 🜁/);
  assert.match(semantic, /South \| Earth \| 🜃/);
  assert.match(semantic, /West \| Water \| 🜄/);
  assert.match(semantic, /East \| Fire \| 🜂/);
  assert.match(semantic, /does not currently persist vortex\s+state/);
  assert.match(semantic, /Prohibited claims/);
  assert.match(constitution, /Status:\*\* Ratified as amended/);
  assert.match(constitution, /Houses occupy faces, not physical vertices/);
  assert.match(constitution, /vertex-graph diameter: 5/);
  assert.match(constitution, /face-adjacency graph is an icosahedral graph with diameter 3/);
  assert.match(constitution, /64\^30/);
  assert.match(constitution, /The Anchor/);
  assert.match(constitution, /sign-to-Dodecanic-House correspondence remains unresolved/);
  for (const status of ["originSupplied", "natalPending", "currentSkyPending", "fieldModeled", "sessionOnly", "triangleReadOnly", "housesSymbolic", "communityUnavailable"]) {
    assert.match(provenance, new RegExp(status));
  }
  for (const field of ["humanMeaning", "activatesWhen", "imbalance", "reflection", "question"]) {
    assert.match(houses, new RegExp(field));
  }
  assert.equal([...dashboard.matchAll(/<DataProvenanceBadge compact/g)].length, 5);
});

test("separates fixed natal, current sky, and Dodecanic meaning", async () => {
  const [profile, currentSky, astrologyTypes, provider, supabase, migration, timeModeMigration] = await Promise.all([
    source("components/quincunx/NatalProfilePanel.tsx"),
    source("components/CurrentSkyPanel.tsx"),
    source("lib/astrology/types.ts"),
    source("lib/astrology/provider.ts"),
    source("lib/supabase/client.ts"),
    source("supabase/migrations/20260719_birth_profiles.sql"),
    source("supabase/migrations/20260719_birth_time_mode.sql"),
  ]);

  assert.match(profile, /Fixed layer/);
  assert.match(profile, /Moving layer/);
  assert.match(profile, /Meaning layer/);
  assert.match(profile, /Nothing is guessed/);
  assert.match(currentSky, /new Date\(\)\.toISOString\(\)/);
  assert.match(currentSky, /Current UTC/);
  assert.match(currentSky, /Planetary positions remain uncalculated/);
  assert.match(astrologyTypes, /NATAL_CHART_SCHEMA_VERSION = 2/);
  assert.match(astrologyTypes, /DODECANIC_ASTROLOGY_STANDARD/);
  assert.match(astrologyTypes, /houseSystem: "whole_sign"/);
  assert.match(astrologyTypes, /signToHouseMappingStatus: "unresolved"/);
  assert.doesNotMatch(astrologyTypes, /"chiron"|"black_moon_lilith"|"semisextile"|"sesquiquadrate"/);
  assert.match(provider, /interface NatalChartProvider/);
  assert.match(provider, /birthTimeMode === "solar_chart"/);
  assert.match(provider, /planets\.every\(\(planet\) => planet\.house === null\)/);
  assert.doesNotMatch(provider, /from ["'](?:swisseph|sweph-wasm)/);
  assert.match(supabase, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(timeModeMigration, /birth_time_known boolean not null default true/);
  assert.match(timeModeMigration, /birth_time drop not null/);
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
