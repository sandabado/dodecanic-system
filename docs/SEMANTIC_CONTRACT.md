# Dodecanic semantic contract

This document defines what the product currently knows and what it must not
claim. Product copy and implementation defer to this contract and the ratified
`DODECANIC_CONSTITUTION.md`.

## Human outcome

The instrument succeeds when a person leaves with greater clarity about their
whole body at three scales:

1. Triangle — personal impulse, reflection, and timing.
2. Quincunx — Physical, Mental, Emotional, Spiritual, and Ethereal presence.
3. Dodecahedron — twelve areas of lived experience in relationship.

The system may offer a modeled direction, but the person retains authority to
accept, reject, or reinterpret it.

## Center, axis, and authority

- **YOU / Ethereal center** is the visible person at the center of the
  personal Sphere, quincunx, and dodecahedron.
- **The Sphere / the Whole** is the modeled boundary of the person's living
  field. It contains the human, torus, and dodecahedron.
- **The dodecahedron / structure** is the inner lattice. The twelve Houses
  occupy its twelve faces.
- **Position 9 / the Observer** is the system axis. It witnesses the complete
  turn without becoming a House, a body domain, or the user.
- **The Turn** is an authored Dodecanic torus-vortex metaphor that makes the
  relationship between the static structure and its motion visible. It is not
  presented as validated physics.
- The system may reflect or recommend. It does not replace human authority.

The distinction is deliberate: the human is central without being described as
the software Observer; the software can observe without claiming sovereignty.

The physical dodecahedron has 20 vertices, 30 edges, and 12 faces. Its physical
vertex graph has diameter 5. The House-bearing face-adjacency graph is the
icosahedral dual and has diameter 3. These two graphs must not be conflated.

## Naming boundaries

- **The Anchor** is House I's archetype.
- **Triangle root** is the lowercase timing/gating function.
- **The Root** is Jesse Gawlik's governance title and appears only in explicit
  governance or administration context.

The center of another person's Sphere is never labeled The Root.

## Whole Body orientation

The five positions have one canonical orientation in the object coordinate
frame. They rotate with the dodecahedron rather than remaining screen-fixed.

| Direction | Element | Glyph | Domain | Current |
| --- | --- | --- | --- | --- |
| North | Air | 🜁 | Mental | ∧ |
| South | Earth | 🜃 | Physical | V |
| West | Water | 🜄 | Emotional | W |
| East | Fire | 🜂 | Spiritual | ∞ |
| Center | Ether | Ø (᮰ alternate) | Ethereal / YOU | Ø |

## Twelve Houses

The current column follows the repository's canonical eight-current engine.
Meanings and questions are authored Dodecanic semantics, not diagnoses.

| House | Name | Archetype | Current | Primary body | Secondary | Human question |
| --- | --- | --- | --- | --- | --- | --- |
| I | Ground | The Anchor | V | Physical | — | What supports you right now? |
| II | Flow | The Steward | W | Physical | Emotional | What are you holding that needs to flow? |
| III | Tech | The Communicator | X | Mental | — | What are you building, and for whom? |
| IV | Heart | The Homekeeper | W | Emotional | — | Where do you feel safe enough to be seen? |
| V | Sound | The Creator | ∆ | Spiritual | — | What is yours to give that no one else can? |
| VI | Voice | The Healer | ∧ | Mental | Spiritual | What needs to be said that you have not said? |
| VII | Story | The Partner | ◇ | Emotional | Spiritual | Who mirrors you, and what do they show? |
| VIII | Gather | The Alchemist | X | Emotional | — | What forms when you are in the room? |
| IX | Wisdom | The Scholar | ◇ | Mental | Spiritual | What has your life taught you that another person needs? |
| X | Law | The Sovereign | ∆ | Mental | — | What rule have you accepted that you did not write? |
| XI | Future | The Visionary | ∞ | Spiritual | Mental | What future is asking you to build it? |
| XII | Tribe | The Elder | 8 | Spiritual | Emotional | What will you leave that you will never see? |

The complete human meanings, activation language, imbalance language,
reflections, and questions live in `types/houses.ts`. That file is the canonical
semantic House source; `lib/house-spectrum.ts` remains the canonical
correspondence source.

## Provenance contract

One section-level status communicates the source boundary. Repeating a badge on
every number creates noise and is prohibited.

| Layer | Current status | Honest meaning |
| --- | --- | --- |
| Birth details | User supplied | Shown as entered; not independently verified |
| Natal chart | Pending | No Swiss Ephemeris calculation is connected |
| Current time | Verified browser clock | Exact time only; current planets are pending |
| Current sky | Pending | Planetary positions remain uncalculated |
| Whole Body field | Modeled | Derived from authored language-pattern rules |
| Prompt House emphasis | Modeled from prompt | Not natal activation |
| House correspondences | Symbolic | Authored Dodecanic belief and correspondence |
| Triangle gate | Read only / modeled | Does not execute or prevent action |
| Observer memory | Session only | Process-local and not durable |
| Community field | Unavailable | No multi-user aggregation exists |
| Persistent profile/session | Pending | Supabase repositories and authentication are not connected |

Canonical UI status definitions live in `lib/data-provenance.ts`.

## Natal gate

The target membership product requires a successfully calculated birth chart
before personal House assignment and longitudinal Dodecanic guidance begin.
That hard gate must not be activated until all of the following are real:

1. place geocoding;
2. historical timezone resolution;
3. licensed Swiss Ephemeris calculation;
4. validated and versioned chart persistence;
5. authentication and clear user consent;
6. a ratified zodiac-sign-to-Dodecanic-House map.

The current preview remains explorable while showing **Chart pending**. It does
not treat submitted birth text as a calculated natal chart.

## Session and future memory

The MVP session model is a journal snapshot: prompt, modeled field state, House
states, quincunx state, Triangle state, and timestamp. Longitudinal training,
prediction, prescriptions, or personalization require sufficient consented
history and separate validation. They are not implied by saving one session.

## Dodecanic Turn boundary

The visible Sphere, torus, spiral phase, and coherence-responsive animation are
a modeled interface language. The Sphere is a personal field boundary, the
dodecahedron is its inner structure, and the torus visualizes circulation
through both. The application does not currently persist vortex state, count
turns, calculate a global turn speed, or show a multi-user field. Those
capabilities require a real data purpose and schema before implementation.

## Deferred platform scope

Application review, The Root administration, email authentication, invitations,
subscriptions, payments, role-based community visibility, wallets, and global
field views are future platform scope. None may appear operational until its
provider, authorization rules, privacy policy, and failure states are complete.

## Prohibited claims

The product must not claim:

- medical, biometric, HRV, psychological, or therapeutic measurement;
- scientific validation for Dodecanic, vortex, Solfeggio, or sacred-number
  correspondences;
- natal or transit placements without verified ephemeris output;
- durable or community memory while storage is process-local;
- executed governance, wallets, value transfer, or smart contracts;
- experimental results without documented reproducible methodology.

Symbolic belief may be stated as belief. Mathematical calculation may be stated
as calculation. Neither may be relabeled as empirical proof.
