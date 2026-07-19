# Dodecanic

Dodecanic places a person at the center of a twelve-House living field. The
product is organized around three layers:

1. **Origin** — verified birth date, exact time, and place.
2. **Now** — the exact current moment and, once licensed, the current sky.
3. **Field** — the Dodecanic House, color, current, and observer model.

The Swiss Ephemeris calculation boundary and Supabase schema are prepared but
not yet connected. The interface never invents natal placements while those
services are unavailable. Observer cycles currently persist only for the
lifetime of a warm server process.

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
