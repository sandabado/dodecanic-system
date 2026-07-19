import { HOUSE_DEFINITIONS, type HouseDefinition, type HouseNumber } from "@/types/houses";

export type Current = "Ø" | "V" | "∧" | "W" | "X" | "∆" | "◇" | "∞" | "8" | "◯";
export type Corner = "physical" | "mental" | "emotional" | "spiritual";
export type ValveState = "closed" | "monitor" | "open";
export type CornerStatus = "ok" | "warning" | "critical";

export interface CoherenceState {
  score: number;
  threshold: number;
  timestamp: string;
}

export type CurrentAssignment = Record<
  Corner,
  { primary: Current; secondary?: Current }
>;

export interface Position9State {
  active: boolean;
  valve: ValveState;
  lastActivation: string;
  bias: Corner | null;
}

export interface CornerState {
  coherence: number;
  current: Current;
  status: CornerStatus;
}

export interface QuincunxState {
  corners: Record<Corner, CornerState>;
  position9: Position9State;
  overallCoherence: number;
  timestamp: string;
}

export type CornerReadings = Record<Corner, number>;
export type InteractionOutcome = "coherent" | "incoherent" | "monitor";

export const CORNERS: Corner[] = ["physical", "mental", "emotional", "spiritual"];

export const CORNER_CURRENTS: CurrentAssignment = {
  physical: { primary: "V", secondary: "∆" },
  mental: { primary: "∧", secondary: "X" },
  emotional: { primary: "W", secondary: "◇" },
  spiritual: { primary: "∞", secondary: "8" },
};

export const VALVE_THRESHOLDS = {
  open: 0.7,
  monitor: 0.4,
  closed: 0,
} as const;

export const HOUSE_ALIGNMENT_MAP: Record<HouseNumber, HouseDefinition> = HOUSE_DEFINITIONS;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateCornerCoherence(
  hrv: number,
  stress: number,
  baselineHrv = 50,
): number {
  const safeBaseline = Math.max(baselineHrv, 1);
  const hrvScore = clamp(hrv, 0, safeBaseline) / safeBaseline;
  const stressPenalty = clamp(stress, 0, 10) / 10;
  return clamp(hrvScore * (1 - stressPenalty), 0, 1);
}

export function calculateOverallCoherence(corners: CornerReadings): number {
  const product = CORNERS.reduce(
    (total, corner) => total * clamp(corners[corner], 0, 1),
    1,
  );
  return Math.pow(product, 1 / CORNERS.length);
}

export function determineValveState(coherence: number): ValveState {
  if (coherence >= VALVE_THRESHOLDS.open) return "open";
  if (coherence >= VALVE_THRESHOLDS.monitor) return "monitor";
  return "closed";
}

export function validatePosition9Impartiality(
  position9: Position9State,
): { valid: boolean; issue?: string } {
  if (!position9.active) return { valid: false, issue: "Position 9 inactive" };
  if (position9.bias !== null) {
    return { valid: false, issue: `Position 9 biased toward ${position9.bias}` };
  }
  return { valid: true };
}

function statusFor(score: number): CornerStatus {
  if (score >= VALVE_THRESHOLDS.open) return "ok";
  if (score >= VALVE_THRESHOLDS.monitor) return "warning";
  return "critical";
}

export function calculateQuincunxState(
  hrvReadings: CornerReadings,
  stressLevels: CornerReadings,
  position9: Position9State,
): QuincunxState {
  const coherences = Object.fromEntries(
    CORNERS.map((corner) => [
      corner,
      calculateCornerCoherence(hrvReadings[corner], stressLevels[corner]),
    ]),
  ) as CornerReadings;
  const overallCoherence = calculateOverallCoherence(coherences);
  const impartiality = validatePosition9Impartiality(position9);
  const valve = impartiality.valid ? determineValveState(overallCoherence) : "closed";

  const corners = Object.fromEntries(
    CORNERS.map((corner) => [
      corner,
      {
        coherence: coherences[corner],
        current: CORNER_CURRENTS[corner].primary,
        status: statusFor(coherences[corner]),
      },
    ]),
  ) as Record<Corner, CornerState>;

  return {
    corners,
    position9: { ...position9, valve },
    overallCoherence,
    timestamp: new Date().toISOString(),
  };
}

const CURRENT_ORDER: Current[] = ["Ø", "V", "∧", "W", "X", "∆", "◇", "∞", "8", "◯"];

function interactionKey(current1: Current, current2: Current): string {
  return [current1, current2]
    .sort((a, b) => CURRENT_ORDER.indexOf(a) - CURRENT_ORDER.indexOf(b))
    .join("+");
}

export const INTERACTION_TABLE: Record<string, InteractionOutcome> = {
  "V+∆": "coherent",
  "V+W": "incoherent",
  "V+X": "monitor",
  "∧+∆": "coherent",
  "∧+X": "coherent",
  "W+◇": "coherent",
  "W+W": "incoherent",
  "∞+8": "coherent",
  "∞+∞": "incoherent",
};

export function checkCurrentInteraction(
  current1: Current,
  current2: Current,
): InteractionOutcome {
  return INTERACTION_TABLE[interactionKey(current1, current2)] ?? "monitor";
}

export function getHouseQuincunxAlignment(houseNumber: HouseNumber): Corner {
  return HOUSE_ALIGNMENT_MAP[houseNumber].quincunxPrimary;
}

export function calculateHouseFitScore(
  userQuincunx: QuincunxState,
  houseNumber: HouseNumber,
): number {
  const alignment = HOUSE_ALIGNMENT_MAP[houseNumber];
  const primary = userQuincunx.corners[alignment.quincunxPrimary].coherence;
  if (!alignment.quincunxSecondary) return primary;
  const secondary = userQuincunx.corners[alignment.quincunxSecondary].coherence;
  return primary * 0.7 + secondary * 0.3;
}
