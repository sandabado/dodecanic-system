import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

test("builds the Dodecanic birth portal", async () => {
  const [page, portalSource] = await Promise.all([
    readFile(new URL("app/page.tsx", templateRoot), "utf8"),
    readFile(new URL("components/BirthPortal.tsx", templateRoot), "utf8"),
    access(new URL(".next/BUILD_ID", templateRoot)),
  ]);

  assert.match(page, /title: "Birth Portal"/);
  assert.match(page, /<BirthPortal \/>/);
  assert.match(portalSource, /type="date"/);
  assert.match(portalSource, /type="time"/);
  assert.match(portalSource, /City, region, country/);
  assert.match(portalSource, /window\.sessionStorage\.setItem/);
  assert.match(portalSource, /window\.location\.assign\("\/loading"\)/);
  assert.doesNotMatch(`${page}\n${portalSource}`, /ObserverConsole|codex-preview|react-loading-skeleton/);
});

test("moves a verified session through a dedicated origin loading sequence", async () => {
  const [loadingPage, loadingSource, css] = await Promise.all([
    readFile(new URL("app/loading/page.tsx", templateRoot), "utf8"),
    readFile(new URL("components/BirthLoading.tsx", templateRoot), "utf8"),
    readFile(new URL("app/globals.css", templateRoot), "utf8"),
  ]);

  assert.match(loadingPage, /<BirthLoading \/>/);
  assert.match(loadingSource, /BIRTH_PROFILE_STORAGE_KEY/);
  assert.match(loadingSource, /Opening the twelve-House spectrum/);
  assert.match(loadingSource, /HOUSE_SPECTRUM_ORDER\.map/);
  assert.match(loadingSource, /window\.location\.replace\("\/quincunx"\)/);
  assert.match(loadingSource, /Verified natal placements appear only after the licensed astrology engine is connected/);
  assert.match(css, /\.birth-loading/);
  assert.match(css, /@keyframes loading-breathe/);
});

test("ships durable state and all eight observer currents", async () => {
  const [types, route, packageJson] = await Promise.all([
    readFile(new URL("lib/types.ts", templateRoot), "utf8"),
    readFile(new URL("app/api/cycle/route.ts", templateRoot), "utf8"),
    readFile(new URL("package.json", templateRoot), "utf8"),
  ]);

  for (const symbol of ["V", "∧", "W", "∆", "X", "◇", "∞", "8"]) {
    assert.match(types, new RegExp(`symbol: "${symbol}"`));
  }
  assert.match(route, /runDodecanicCycle/);
  assert.match(route, /saveCycle/);
  assert.match(packageJson, /"build":\s*"next build"/);
  assert.doesNotMatch(packageJson, /vinext|wrangler|@cloudflare/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

test("models one dodecahedral body with twelve faces and thirty unique edges", async () => {
  const [topologySource, bodySource, houseSource, monitorSource, quincunxSource, trustSource] = await Promise.all([
    readFile(new URL("lib/dodecahedron/topology.ts", templateRoot), "utf8"),
    readFile(new URL("lib/quincunx/whole-body.ts", templateRoot), "utf8"),
    readFile(new URL("types/houses.ts", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/WholeBodyMonitor.tsx", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/QuincunxPresence.tsx", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/TriangleOfTrust.tsx", templateRoot), "utf8"),
  ]);

  const edgeBlock = topologySource.match(/DODECAHEDRON_EDGE_PAIRS[^=]*= \[([\s\S]*?)\n\];/);
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

  const phi = (1 + Math.sqrt(5)) / 2;
  const coordinateBlock = topologySource.match(/FACE_COORDINATES[^=]*= \{([\s\S]*?)\n\};/);
  assert.ok(coordinateBlock, "face centers are declared once");
  const coordinates = new Map(
    [...coordinateBlock[1].matchAll(/(\d+): \[([^\]]+)\]/g)].map((match) => [
      Number(match[1]),
      match[2].split(",").map((token) => {
        const value = token.trim();
        if (value === "PHI") return phi;
        if (value === "-PHI") return -phi;
        return Number(value);
      }),
    ]),
  );
  assert.equal(coordinates.size, 12, "each face has one unique 3D center");
  assert.equal(new Set([...coordinates.values()].map((point) => point.join(","))).size, 12);
  for (const [houseA, houseB] of pairs) {
    const pointA = coordinates.get(houseA);
    const pointB = coordinates.get(houseB);
    const distance = Math.hypot(...pointA.map((value, index) => value - pointB[index]));
    assert.ok(Math.abs(distance - 2) < 1e-9, `edge ${houseA}-${houseB} is geometrically adjacent`);
  }

  const houseNumbers = [...houseSource.matchAll(/^\s*(\d+): \{ number: \d+/gm)].map((match) => Number(match[1]));
  assert.deepEqual(houseNumbers, Array.from({ length: 12 }, (_, index) => index + 1));
  assert.match(bodySource, /resolveCurrentPair\(houseA\.current, houseB\.current\)/);
  assert.match(bodySource, /pillarState\("aetheric"/);
  assert.match(bodySource, /direction: directionFor\(delta\)/);
  assert.match(bodySource, /signals: string\[\]/);
  assert.doesNotMatch(bodySource, /id: "observer", label: "Position 9"/);
  assert.match(monitorSource, /Whole-body presence/);
  assert.match(monitorSource, /<QuincunxPresence quincunx=\{body\.quincunx\} pillars=\{body\.pillars\}/);
  assert.doesNotMatch(monitorSource, /TriangleOfTrust/);
  assert.match(quincunxSource, /pillars\.map/);
  assert.match(quincunxSource, /"physical", "mental", "emotional", "spiritual"/);
  assert.match(quincunxSource, /Aetheric pillar/);
  assert.match(quincunxSource, /Position 9 observer/);
  assert.match(monitorSource, /body\.faces\.map/);
  assert.match(monitorSource, /body\.edges\.map/);
  assert.match(trustSource, /Triangle of Trust/);
  assert.match(trustSource, /<span>Ø<\/span>/);
  assert.match(trustSource, /Master sets direction/);
});

test("updates the whole-body model from prompt input in real time", async () => {
  const [dashboardSource, observerSource, pageSource, headerSource, livingSource, telemetryRoute, telemetryHook, diagnosticsRoute, diagnosticsSource, temporalSource, temporalComponent] = await Promise.all([
    readFile(new URL("components/quincunx/QuincunxDashboard.tsx", templateRoot), "utf8"),
    readFile(new URL("components/ObserverConsole.tsx", templateRoot), "utf8"),
    readFile(new URL("app/quincunx/page.tsx", templateRoot), "utf8"),
    readFile(new URL("components/SiteHeader.tsx", templateRoot), "utf8"),
    readFile(new URL("components/dodecahedron/LivingDodecahedron.tsx", templateRoot), "utf8"),
    readFile(new URL("app/api/observer/telemetry/route.ts", templateRoot), "utf8"),
    readFile(new URL("hooks/useObserverTelemetry.ts", templateRoot), "utf8"),
    readFile(new URL("app/api/observer/diagnostics/route.ts", templateRoot), "utf8"),
    readFile(new URL("lib/observer-diagnostics.ts", templateRoot), "utf8"),
    readFile(new URL("lib/observer-temporal.ts", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/TemporalObserver.tsx", templateRoot), "utf8"),
  ]);

  assert.match(dashboardSource, /runDodecanicCycle\(prompt\.trim\(\)/);
  assert.match(dashboardSource, /updatePrompt\(event\.target\.value\)/);
  assert.match(dashboardSource, /function updatePrompt\(nextPrompt: string\)/);
  assert.match(dashboardSource, /setReplayIndex\(null\)/);
  assert.match(observerSource, /WholeBodyMonitor result=\{displayResult\}/);
  assert.match(pageSource, /return <QuincunxDashboard \/>/);
  assert.doesNotMatch(pageSource, /SiteHeader|quincunx-intro/);
  assert.match(headerSource, /utility\?: ReactNode/);
  assert.match(dashboardSource, /The Dodecahedron is the field of creation/);
  assert.match(dashboardSource, /className="nav-prompt"/);
  assert.match(dashboardSource, /className="field-viewport"/);
  assert.match(dashboardSource, /className="field-shelf-rail"/);
  assert.match(dashboardSource, /00 \/ You/);
  assert.match(dashboardSource, /04 \/ Trust/);
  assert.match(dashboardSource, /05 \/ Presence/);
  assert.match(dashboardSource, /<TriangleOfTrust triangle=\{snapshot\.body\.triangle\} standalone \/>/);
  assert.match(dashboardSource, /BIRTH_PROFILE_STORAGE_KEY/);
  assert.match(dashboardSource, /type="range"/);
  assert.match(dashboardSource, /Memory \$\{replayIndex \+ 1\}/);
  assert.match(dashboardSource, /Updates with every character/);
  assert.doesNotMatch(dashboardSource, /toLocaleString\(/);
  assert.match(livingSource, /inspectAt\(event\.clientX, event\.clientY\)/);
  assert.match(livingSource, /selectedEdge\.reason/);
  assert.match(livingSource, /selectedFace\.reason/);
  assert.match(livingSource, /fillText\("Ø", centerX, centerY\)/);
  assert.match(livingSource, /DODECAHEDRON_VERTICES\.map/);
  assert.match(livingSource, /DODECAHEDRON_FACES\.map/);
  assert.match(livingSource, /topology\.vertexIndices/);
  assert.match(livingSource, /tracePolygon\(context, point\.points\)/);
  assert.match(livingSource, /isPointInPolygon\(x, y, point\.points\)/);
  assert.doesNotMatch(livingSource, /HOUSE_RING_ORDER|ringFaces|interiorFaces/);
  assert.match(livingSource, /event\.code !== "Space"/);
  assert.match(livingSource, /onPointerDown=\{beginOrbit\}/);
  assert.match(livingSource, /HOUSE_ROMAN, HOUSE_SPECTRUM/);
  assert.match(livingSource, /primaryLabel = `\$\{HOUSE_ROMAN\[point\.house\]\} · \$\{face\.house\.name\.toUpperCase\(\)\}`/);
  assert.match(livingSource, /const spectrum = HOUSE_SPECTRUM\[point\.house\]/);
  assert.match(livingSource, /mixHouseColors/);
  assert.match(livingSource, /face\.house\.name\.toUpperCase\(\)/);
  assert.match(livingSource, /COLLAPSE/);
  assert.match(livingSource, /EXPANSE/);
  assert.match(telemetryRoute, /listCycles\(limit\)/);
  assert.match(telemetryHook, /setInterval\(\(\) => void refetch\(\), 12_000\)/);
  assert.match(diagnosticsRoute, /runObserverDiagnostics\(\)/);
  assert.match(diagnosticsRoute, /fieldObserver: "Ø"/);
  assert.match(diagnosticsRoute, /bodyObserver: "Position 9"/);
  assert.match(diagnosticsSource, /body\.edges\.length === 30/);
  assert.match(diagnosticsSource, /body\.quincunx\.position9\.bias === null/);
  assert.match(temporalSource, /TRIANGLE_TARGET/);
  assert.match(temporalSource, /calculateTemporalBalance/);
  assert.match(temporalComponent, /Past · Present · Future/);
  assert.match(temporalComponent, /observerLoop/);
  assert.match(dashboardSource, /<TemporalObserver result=\{snapshot\.result\}/);
});

test("places the user in a legible natal-profile field with safe data scaffolding", async () => {
  const [dashboardSource, profileSource, astrologyTypes, providerSource, supabaseClient, migration, css] = await Promise.all([
    readFile(new URL("components/quincunx/QuincunxDashboard.tsx", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/NatalProfilePanel.tsx", templateRoot), "utf8"),
    readFile(new URL("lib/astrology/types.ts", templateRoot), "utf8"),
    readFile(new URL("lib/astrology/provider.ts", templateRoot), "utf8"),
    readFile(new URL("lib/supabase/client.ts", templateRoot), "utf8"),
    readFile(new URL("supabase/migrations/20260719_birth_profiles.sql", templateRoot), "utf8"),
    readFile(new URL("app/globals.css", templateRoot), "utf8"),
    access(new URL("public/portal-cosmos.png", templateRoot)),
  ]);

  assert.match(dashboardSource, /<NatalProfilePanel/);
  assert.match(profileSource, /You are inside the machine/);
  assert.match(profileSource, /natal-wheel/);
  assert.match(profileSource, /Big Three \+ angles/);
  assert.match(profileSource, /Planetary placements/);
  assert.match(profileSource, /Twelve house cusps/);
  assert.match(profileSource, /Aspect matrix/);
  assert.match(profileSource, /Reading synthesis/);
  assert.match(profileSource, /No placements are being guessed/);
  assert.match(astrologyTypes, /NATAL_CHART_SCHEMA_VERSION = 1/);
  assert.match(providerSource, /interface NatalChartProvider/);
  assert.doesNotMatch(providerSource, /from ["'](?:swisseph|sweph-wasm)/);
  assert.match(supabaseClient, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(css, /url\("\/portal-cosmos\.png"\)/);
  assert.match(css, /grid-template-columns: repeat\(7, minmax\(0, 1fr\)\)/);

  const subTenPixelType = [...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)]
    .map((match) => Number(match[1]))
    .filter((size) => size < 10);
  assert.deepEqual(subTenPixelType, [], "functional CSS type never drops below 10px");
});

test("uses one canonical twelve-House spectrum across the shelf, solid, and You profile", async () => {
  const [spectrumSource, spectrumComponent, dashboardSource, livingSource, profileSource] = await Promise.all([
    readFile(new URL("lib/house-spectrum.ts", templateRoot), "utf8"),
    readFile(new URL("components/houses/HouseSpectrum.tsx", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/QuincunxDashboard.tsx", templateRoot), "utf8"),
    readFile(new URL("components/dodecahedron/LivingDodecahedron.tsx", templateRoot), "utf8"),
    readFile(new URL("components/quincunx/NatalProfilePanel.tsx", templateRoot), "utf8"),
  ]);

  const records = [...spectrumSource.matchAll(/^\s+\d+: \{ colorHex:/gm)];
  assert.equal(records.length, 12, "the master spectrum defines exactly twelve House records");
  for (const field of ["colorHex", "wavelengthNm", "lightFrequencyThz", "soundFrequencyHz", "geometry", "mode", "note"]) {
    assert.match(spectrumSource, new RegExp(field));
  }
  assert.match(spectrumComponent, /Master correspondence system/);
  assert.match(spectrumComponent, /not a literal sound-to-light conversion/);
  assert.match(dashboardSource, /06 \/ Spectrum/);
  assert.match(dashboardSource, /<HouseSpectrum \/>/);
  assert.match(livingSource, /HOUSE_SPECTRUM\[selectedFace\.house\.number\]/);
  assert.match(profileSource, /HOUSE_SPECTRUM_CONIC/);
  assert.match(profileSource, /<HouseSpectrum variant="profile" \/>/);
});
