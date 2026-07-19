export type ProvenanceKind =
  | "supplied"
  | "verified"
  | "modeled"
  | "symbolic"
  | "pending"
  | "read-only"
  | "session"
  | "unavailable";

export interface DataProvenanceDefinition {
  kind: ProvenanceKind;
  label: string;
  disclosure: string;
}

/** One layer-level status per concept. Individual values do not repeat badges. */
export const DATA_PROVENANCE = {
  originPending: {
    kind: "pending",
    label: "Origin pending",
    disclosure: "Birth details have not been supplied in this browser session.",
  },
  originSupplied: {
    kind: "supplied",
    label: "User supplied",
    disclosure: "These birth details are shown exactly as entered; they are not yet a verified natal chart.",
  },
  natalPending: {
    kind: "pending",
    label: "Chart pending",
    disclosure: "Swiss Ephemeris, coordinates, historical timezone resolution, and the sign-to-House map are not connected.",
  },
  currentSkyPending: {
    kind: "pending",
    label: "Sky pending",
    disclosure: "The clock is live; planetary positions remain uncalculated.",
  },
  fieldModeled: {
    kind: "modeled",
    label: "Modeled",
    disclosure: "Sphere, torus, and coherence values reflect authored interface rules, not biometric, physical, or diagnostic measurements.",
  },
  sessionOnly: {
    kind: "session",
    label: "Session only",
    disclosure: "Reflections use process-local memory and may disappear between server invocations.",
  },
  triangleReadOnly: {
    kind: "read-only",
    label: "Read only",
    disclosure: "The Triangle models a gate state but does not authorize, block, or execute an action.",
  },
  housesSymbolic: {
    kind: "symbolic",
    label: "Dodecanic system",
    disclosure: "House meanings and correspondences are authored Dodecanic symbolism.",
  },
  communityUnavailable: {
    kind: "unavailable",
    label: "Not available",
    disclosure: "No multi-user community field is currently calculated or displayed.",
  },
} as const satisfies Record<string, DataProvenanceDefinition>;
