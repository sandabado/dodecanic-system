# Dodecanic

Dodecanic places a person at the center of a Sphere containing a twelve-House
dodecahedral lattice and modeled toroidal flow. The product is organized around
three information layers:

1. **Origin** — supplied birth date, time status, and place.
2. **Now** — the exact current moment and, once licensed, the current sky.
3. **Field** — the Dodecanic House, color, current, and observer model.

The Swiss Ephemeris calculation boundary and Supabase schema are prepared but
not yet connected. The interface never invents natal placements while those
services are unavailable. Observer cycles currently persist only for the
lifetime of a warm server process.

Product meaning is ratified in
[`docs/DODECANIC_CONSTITUTION.md`](docs/DODECANIC_CONSTITUTION.md). Current
data-claim boundaries are defined in
[`docs/SEMANTIC_CONTRACT.md`](docs/SEMANTIC_CONTRACT.md).

## Product map

- `/` — birth-origin portal
- `/loading` — short origin handoff
- `/quincunx` — the living field
- `/api/cycle` — prompt reflection cycle
- `/api/observer/telemetry` — current session telemetry

Inside the field, five shelves contain the supporting information: **YOU**,
**NOW**, **FIELD**, **SESSION**, and **HOUSES**.

## Local development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Validation

```bash
npm run lint
npx tsc --noEmit
npm test
```

See [Product architecture](docs/ARCHITECTURE.md) and
[Design system](docs/DESIGN_SYSTEM.md) for the project boundaries.
