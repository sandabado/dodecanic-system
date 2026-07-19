# The Dodecanic Constitution v1.0

**Status:** Ratified as amended  
**Ratified by:** Jesse Gawlik  
**Ratification date:** July 19, 2026  
**Implementation authority:** This document governs product semantics. Verified
geometry and the claim boundaries in `SEMANTIC_CONTRACT.md` govern technical
implementation.

## Preamble

The Dodecanic is a human-centered symbolic instrument. It uses geometry,
astrological calculation, authored correspondences, and modeled reflection as
different kinds of knowledge. The interface must always disclose which kind is
being presented.

The human is the authority on their own experience. The system may calculate,
observe, reflect, and suggest. It may not replace human judgment or represent a
symbolic model as scientific or biometric fact.

## Article I — Nested geometry

The personal living field has four nested, non-interchangeable layers:

1. **Human point / Ø** — the person at the Ethereal center; identity and
   supplied birth origin.
2. **Dodecahedron / 13** — the inner structural lattice; twelve pentagonal
   faces occupied by the twelve Houses.
3. **Torus / the Turn / Position 9 axis** — modeled circulation through the
   center, lattice, and field. It is a mechanism in the interface, not a
   separate person or a claim about physical energy.
4. **Sphere / ∞** — the outer boundary of the person's whole living field. It
   contains the human, torus, and dodecahedron.

The Sphere is the whole. The dodecahedron is structure within the whole. The
torus visualizes circulation through the whole. The human remains at the
center.

### Verified dodecahedral facts

- 20 vertices
- 30 physical edges
- 12 pentagonal faces
- Euler characteristic: `V − E + F = 20 − 30 + 12 = 2`
- physical vertex-graph diameter: 5
- each vertex has degree 3
- each face has five adjacent faces
- the dual face-adjacency graph is an icosahedral graph with diameter 3

Houses occupy faces, not physical vertices. Each physical edge is also the
boundary shared by two adjacent House faces. This produces 30 House-to-House
adjacencies without pretending that the face graph and vertex graph have the
same diameter.

If an edge can take 64 independent states, `30 × 64 = 1,920` counts edge-state
options across the edge set. It is not the total number of independent global
configurations; that count would be `64^30` before additional constraints.

### Community model

A future member is represented by one personal Sphere containing their own
human point, dodecahedron, and modeled toroidal flow. A future community view
may show Spheres in relationship. Personal dodecahedra do not merge and private
session content does not become community content.

No multi-user Sphere, community flow, or administrator constellation is
currently implemented.

## Article II — Center, axis, and authority

- **YOU / Ethereal center** is the human.
- **Position 9 / system witness** is the impartial modeled axis.
- Position 9 is not the human, a House, an administrator, or an autonomous
  decision-maker.
- The torus is labeled **Modeled Field**. It is not biometric, medical,
  electromagnetic, or quantum measurement.

Position 9 may eventually observe consented session state, interpret modeled
patterns, present questions, identify modeled stall conditions, and offer
suggestions. It may not decide for the human, execute governance, access another
person's private content, override preference, or claim authority over lived
experience.

The human decides what to focus on, whether to save, whether to accept a
suggestion, whether to override a modeled gate, and what any reading means to
them.

## Article III — Canonical House-current map

| House | Name | Archetype | Current |
| --- | --- | --- | --- |
| I | Ground | The Anchor | V |
| II | Flow | The Steward | W |
| III | Tech | The Communicator | X |
| IV | Heart | The Homekeeper | W |
| V | Sound | The Creator | ∆ |
| VI | Voice | The Healer | ∧ |
| VII | Story | The Partner | ◇ |
| VIII | Gather | The Alchemist | X |
| IX | Wisdom | The Scholar | ◇ |
| X | Law | The Sovereign | ∆ |
| XI | Future | The Visionary | ∞ |
| XII | Tribe | The Elder | 8 |

The eight House currents are `V`, `∧`, `W`, `X`, `∆`, `◇`, `∞`, and `8`.
Their distribution across twelve Houses is intentionally uneven.

`0` and `Ø` may describe creating and consuming/closed system states. They are
not assigned to Houses. Position 9 is the system witness, not a ninth current.
No index may be described as nonexistent while also being used as a canonical
current.

Physical edges carry modeled interaction states derived from their two
endpoint House faces. Contextual edge-current semantics require real session
evidence before further canonization.

## Article IV — Whole Body orientation

| Direction | Element | Glyph | Domain |
| --- | --- | --- | --- |
| North | Air | 🜁 | Mental |
| South | Earth | 🜃 | Physical |
| West | Water | 🜄 | Emotional |
| East | Fire | 🜂 | Spiritual |
| Center | Ether | Ø | Ethereal / YOU |

The directions rotate with the object. Ether belongs exclusively to the human
center and is not claimed by a House.

The complete House-to-element correspondence is not yet ratified. House records
with no approved elemental assignment use `unassigned`; they never borrow
Ether as a placeholder.

## Article V — Naming

Three former uses of “Root” are separated:

- **The Anchor** — House I archetype. House I is never called “The Root.”
- **Triangle root** — the lowercase functional timing/gating role in the
  Triangle of Trust.
- **The Root** — Jesse Gawlik's governance title. It appears only in explicit
  governance or administration contexts and never labels the center of another
  person's Sphere.

## Article VI — Astrology standard

The v1 calculation contract is:

- tropical zodiac;
- Whole Sign astrological houses;
- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto,
  North Node, and South Node;
- Ascendant and Midheaven only when exact birth time is known;
- conjunction, opposition, trine, square, and sextile;
- maximum orbs: Sun/Moon 8°, other planets 6°, ASC/MC 5°, Nodes 3°.

Sextile is a major v1 aspect. Quincunx, semisextile, semisquare, and
sesquiquadrate are deferred.

### Unknown birth time

The user may explicitly mark birth time unknown. Future calculation then uses a
disclosed solar-chart reference time for planetary positions. It does not
calculate or invent an Ascendant, Midheaven, or cusp-derived Houses. The result
is labeled **Solar Chart — Birth Time Unknown**.

### Dodecanic sign mapping

The zodiac-sign-to-Dodecanic-House correspondence remains unresolved. It is a
philosophical mapping, not an astronomical calculation. Therefore:

- Swiss Ephemeris may eventually return verified planetary positions;
- no natal Dodecanic House may be assigned until the mapping is ratified;
- no transit may activate a Dodecanic House until the mapping is ratified;
- no traditional sign or astrological House may be silently treated as an
  identically numbered Dodecanic House.

### Future prevalence algorithm

After the sign map and provider are verified:

1. calculate current positions at the current UTC instant;
2. map supported transiting bodies through the ratified sign map;
3. apply Sun `2.0`, Moon `1.5`, Mercury–Pluto `1.0`, and North Node `0.5`;
4. multiply a transit by `1.5` when it is within the ratified major-aspect orb
   of a natal point;
5. do not use current ASC or MC without a separately supplied current
   observation location;
6. if the second-highest score is at least 90% of the highest, label the result
   ambiguous and use the natal Sun House as **Default Orientation**;
7. if the natal Sun House cannot be assigned, show **Orientation pending**.

The fixed set of planets makes a “negligible total weight” test meaningless;
the v1 fallback therefore uses the top-two margin.

All calculation is blocked until place geocoding, historical timezone
resolution, Swiss Ephemeris licensing, provider validation, and persistence are
real. No invented placements or estimates are permitted.

## Article VII — Consent and data governance target

Birth data and calculated charts require encryption at rest, transport
security, least-privilege access, authentication, deletion, and export. The
system must not promise “zero-access encryption” while a server-held key can
decrypt data for calculation.

Sessions are unsaved by default. A future persistent session requires an
explicit **Save this session** action. A saved snapshot may contain the prompt,
modeled field state, House state, quincunx state, Triangle state, and timestamp.

The member may delete individual saved sessions, export their data, or close
their account. Training requires a separate opt-in that defaults off and may be
withdrawn for future use.

An administrator may eventually see account/application/payment state, a
member's assigned House, modeled gate state, and aggregate field summaries. An
administrator may not read private prompts or saved-session content. Aggregate
patterns require `n ≥ 5`; smaller groups are suppressed.

These are target policies, not claims about the current preview. They require
privacy and legal review before public launch.

## Article VIII — Application and membership target

The target lifecycle is:

`Applicant → Pending review → Chart pending → Chart verified → Eligibility
decision → Approved/invited → Payment pending → Subscribed/active`

It must also model request-more-information, rejection, expired invitation,
suspension, revocation, voluntary cancellation, refund processing, final
cancellation, and reapplication eligibility.

No chart means no chart-dependent eligibility decision. Approval is human in
v1. No payment, invitation, subscription, approval, or rejection state may
appear operational until its provider, authorization, audit trail, failure
handling, and policy are implemented.

## Article IX — Sovereigns and geometry

The future governance metaphor has 24 mandate holders—two per House face—and
one governance center, for 25 roles. The 20 physical vertices are structural
intersections and the 30 edges are exchange pathways; they are not seats.

This governance model is deferred platform scope. It does not change the
personal Sphere center, which always belongs to that person.

## Article X — Recommendation boundary

The system may label and provide:

- **Modeled Reflection**
- **Modeled Suggestion**
- **Calculated Placement** after verified calculation
- **Modeled Gate State**
- **Dodecanic Suggestion**
- **Observed Pattern** after consented persistence is verified
- **House Inquiry**

It must never diagnose, claim biometric measurement, predict a specific future
event, execute governance or financial action, present modeled values as fact,
override the human, compare identifiable members, or claim proven
physiological effects for a frequency.

When a person disagrees with a reading, the interface says:

> You know yourself better than this instrument does. If this reading does not
> resonate, you may dismiss it. Your assessment takes precedence over the
> model.

When a person overrides HOLD or LOCK, the interface makes clear that the state
is a modeled suggestion rather than a prohibition. Logging occurs only when a
real, consented session log exists.

## Article XI — Public belief statement

The Dodecanic holds that the dodecahedron—twelve faces around one center—is a
useful geometric metaphor for integrating human experience. Astrological
placements, once connected, are calculated with Swiss Ephemeris and presented
as interpretive frameworks rather than scientifically validated determinants
of personality or fate. Coherence values are mathematical reflections of
language and self-reporting, not biometric measurements. The torus, Triangle
of Trust, and related geometry are symbolic interfaces intended to help people
see themselves more clearly. The product distinguishes belief, calculation,
interpretation, and empirical evidence. The human is always the authority.

## Article XII — Verification and amendment

The word “verified” is reserved for a reproducible calculation, authoritative
source, or test appropriate to the claim. A mathematically true octave doubling
does not establish a physiological effect. A graph constraint does not “forbid
hallucination” unless the software actually enforces traversal and validation.
Legal validity, HRV effects, decision-speed targets, token economics,
trademarks, religious classification, and research programs require separate
expert work and are not certified by this Constitution.

Later notes do not silently supersede this ratified document. An amendment must
identify the changed article, resolve contradictions, receive explicit
ratification, and add or update verification proportional to the claim.
