# Product architecture

## Information architecture

The app has one entry journey and one primary workspace.

```text
Origin portal
  → Origin handoff
    → Living field
       ├─ YOU      fixed birth origin and natal blueprint
       ├─ NOW      exact current moment and moving-sky layer
       ├─ FIELD    Quincunx whole-body presence
       ├─ SESSION  prompt reflections and read-only Triangle of Trust
       └─ HOUSES   canonical twelve-House correspondence system
```

The prompt belongs to the workspace header because it changes the living field.
Supporting information belongs in shelves so the dodecahedron remains the
primary surface.

## Truth model

The application separates supplied data, verified calculations, authored
symbolism, and modeled interpretation.

- **Supplied origin:** birth text shown exactly as entered in the current
  browser session.
- **Verified origin:** supplied birth text after geocoding and historical
  timezone resolution.
- **Verified natal:** planetary positions, angles, Houses, and aspects returned
  by a licensed ephemeris provider.
- **Verified now:** current UTC plus current planetary positions.
- **Derived activation:** transit-to-natal relationships mapped into the twelve
  Dodecanic Houses.
- **Reflective observer:** language-pattern telemetry. It is not natal,
  medical, psychological, or biometric analysis.

Until a layer is connected, the UI reports it as pending and never supplies a
fabricated placement.

`docs/SEMANTIC_CONTRACT.md` is authoritative for the human/system distinction,
Whole Body orientation, House meanings, provenance labels, and claim boundaries.

## Code boundaries

```text
app/                    routes, metadata, and global design layers
components/             product components
components/dodecahedron canvas visualization and inspection
components/houses/      twelve-House correspondence UI
components/quincunx/    field, presence, trust, and profile surfaces
hooks/                  client telemetry lifecycle
lib/astrology/          versioned chart contract and provider validation
lib/dodecahedron/       immutable geometric topology
lib/observer-store.ts   explicit in-process session storage
lib/quincunx/           observer-to-body derivation
lib/supabase/           browser client boundary
supabase/migrations/    authoritative durable-data schema
types/                  canonical House definitions
```

## Data lifecycle

The current birth profile is intentionally session-local. Observer cycles use
an in-process store and may disappear between Vercel function invocations.
Supabase becomes authoritative only after authentication, migration deployment,
and repositories are connected. UI language must continue to say “session”
until that work is complete.

## Natal intelligence target

```text
birth input
  → place coordinates + historical timezone
  → UTC birth instant
  → natal calculation
  → current UTC calculation
  → transit-to-natal aspects
  → House activation
  → Dodecanic reading
```

Swiss Ephemeris must use either a Professional license or an AGPL-compatible
application license before the public calculation service is activated.
