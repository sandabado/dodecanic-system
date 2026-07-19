# Design system

## Principles

1. **The field is primary.** Chrome and supporting panels recede behind the
   dodecahedron.
2. **One accent has one meaning.** Green is live/open, amber is pending/watch,
   and coral is stop/close. Supplied, modeled, symbolic, and session-only layers
   use their provenance colors. House colors identify Houses; they do not
   replace system status.
3. **Typography carries hierarchy.** Serif type names concepts, mono type shows
   coordinates and telemetry, and sans-serif type explains.
4. **No ornamental component without information.** Motion expresses state or
   orientation and respects reduced-motion preferences.
5. **Pending is visible.** Unconnected data is labeled, not simulated.

## Tokens

Canonical tokens live in `app/design-system.css`.

- Surfaces: `--color-canvas`, `--color-surface`, `--color-surface-raised`
- Content: `--color-text`, `--color-text-muted`, `--color-text-dim`
- State: `--color-live`, `--color-watch`, `--color-stop`
- Provenance: `--color-supplied`, `--color-modeled`, `--color-symbolic`,
  `--color-session`
- Brand: `--color-primary`, `--color-primary-bright`
- Type: `--font-sans`, `--font-mono`, `--font-serif`
- Rhythm: `--space-1` through `--space-8`
- Layout: `--content-max`, `--shelf-height`

Functional text never drops below 10px. Major reading text begins at 12px.

## House spectrum

`lib/house-spectrum.ts` is the only source for House Roman numeral, color,
visible-light wavelength, sound correspondence, note, mode, geometry, and
cymatic mark. Components consume this model rather than copying values.

Light values are physical visible-light references. Sound, mode, geometry, and
cymatic marks are authored correspondences, not literal sound-to-light science.

## Core components

- `Brand` — one identity lockup used by every route
- `BirthPortal` — origin input only
- `BirthLoading` — short transition, never a fake calculation
- `LivingDodecahedron` — primary interactive field
- `NatalProfilePanel` — fixed user layer
- `CurrentSkyPanel` — exact moving-time layer
- `WholeBodyMonitor` — Quincunx presence without duplicate face/edge tables
- `TriangleOfTrust` — trust relationship model
- `HouseSpectrum` — interactive canonical House legend

## Responsive behavior

Shelves occupy at most two-thirds of the viewport. On narrow screens the shelf
rail scrolls horizontally, the inspector overlays the field, multi-column data
becomes one column, and all primary actions remain keyboard accessible.
