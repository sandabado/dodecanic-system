# Dodecanic AI

A production-ready testbed for the eight-current Dodecanic Observer. The app
classifies natural-language signals, resolves every active current pair through
the 64-state lookup table, determines an `OPEN`, `MONITOR`, or `CLOSE` valve,
and records completed cycles in durable D1 storage.

## Observer cycle

1. **Sense** — classify the incoming signal across eight currents.
2. **Read** — evaluate every active current pair through the lookup table.
3. **Actuate** — resolve the valve with `CLOSE > MONITOR > OPEN` priority.
4. **Respond** — return a concise operational recommendation.

## Local development

```bash
npm install
npm run dev
```

The local app runs at `http://localhost:3000`. Use `Command + Enter` from the
signal field to run a cycle.

## Validation

```bash
npm run build
npm run lint
node --test tests/rendered-html.test.mjs
./node_modules/.bin/tsc --noEmit
```

The first API request initializes the local D1 schema. The checked-in Drizzle
migration in `drizzle/` is used for hosted environments.
