import { resolveCurrentPair } from "@/lib/dodecanic-observer";
import { DODECAHEDRON_EDGES } from "@/lib/dodecahedron/topology";
import type { CycleResult, ValveAction } from "@/lib/types";
import { HOUSE_DEFINITIONS, type HouseDefinition } from "@/types/houses";
import {
  calculateOverallCoherence,
  determineValveState,
  type Corner,
  type CornerReadings,
  type Position9State,
  type QuincunxState,
  type ValveState,
} from "./engine";

export interface DodecahedralEdgeState {
  id: string;
  houseA: HouseDefinition;
  houseB: HouseDefinition;
  lookupCode: string;
  valve: ValveAction | "IDLE";
  flow: number;
  reason: string;
}

export interface HouseFaceState {
  house: HouseDefinition;
  coherence: number;
  active: boolean;
  valve: ValveAction | "IDLE";
  reason: string;
}

export interface PillarState {
  id: Corner | "aetheric";
  label: string;
  current: string;
  coherence: number;
  baseline: number;
  delta: number;
  direction: "rising" | "balanced" | "falling";
  signals: string[];
  status: "stable" | "watch" | "critical";
}

export interface TriangleTrustState {
  master: HouseFaceState;
  mirror: HouseFaceState;
  root: HouseFaceState;
  observerCoherence: number;
  coherence: number;
}

export interface WholeBodyState {
  quincunx: QuincunxState;
  pillars: PillarState[];
  faces: HouseFaceState[];
  edges: DodecahedralEdgeState[];
  triangle: TriangleTrustState;
  overallCoherence: number;
  valve: ValveAction;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function cornerScores(result: CycleResult): CornerReadings {
  const active = new Set(result.activeCurrents);
  const closePenalty = result.finalValve === "CLOSE" ? 0.18 : 0;
  const monitorPenalty = result.finalValve === "MONITOR" ? 0.07 : 0;
  return {
    physical: clamp(0.58 + (active.has("V") ? 0.18 : 0) + (active.has("∆") ? 0.16 : 0) - (active.has("X") ? 0.16 : 0) - closePenalty - monitorPenalty),
    mental: clamp(0.58 + (active.has("∧") ? 0.18 : 0) + (active.has("◇") ? 0.1 : 0) - (active.has("X") ? 0.22 : 0) - (active.has("∞") ? 0.08 : 0) - closePenalty - monitorPenalty),
    emotional: clamp(0.62 + (active.has("◇") ? 0.16 : 0) + (active.has("8") ? 0.1 : 0) - (active.has("W") ? 0.16 : 0) - (active.has("X") ? 0.18 : 0) - closePenalty - monitorPenalty),
    spiritual: clamp(0.6 + (active.has("8") ? 0.2 : 0) + (active.has("◇") ? 0.08 : 0) - (active.has("∞") ? 0.2 : 0) - (active.has("X") ? 0.12 : 0) - closePenalty - monitorPenalty),
  };
}

function statusFor(coherence: number): "stable" | "watch" | "critical" {
  if (coherence >= 0.7) return "stable";
  if (coherence >= 0.4) return "watch";
  return "critical";
}

function directionFor(delta: number): PillarState["direction"] {
  if (delta >= 0.05) return "rising";
  if (delta <= -0.05) return "falling";
  return "balanced";
}

function pillarState(
  id: PillarState["id"],
  label: string,
  current: string,
  coherence: number,
  signals: string[],
): PillarState {
  const baseline = 0.6;
  const delta = coherence - baseline;
  return {
    id,
    label,
    current,
    coherence,
    baseline,
    delta,
    direction: directionFor(delta),
    signals,
    status: statusFor(coherence),
  };
}

function toValve(valve: ValveState): ValveAction {
  if (valve === "closed") return "CLOSE";
  return valve.toUpperCase() as ValveAction;
}

function faceValve(coherence: number, active: boolean, cycleValve: ValveAction): ValveAction | "IDLE" {
  if (!active) return "IDLE";
  if (cycleValve === "CLOSE" && coherence < 0.7) return "CLOSE";
  return toValve(determineValveState(coherence));
}

export function calculateWholeBodyState(result: CycleResult): WholeBodyState {
  const scores = cornerScores(result);
  const position9: Position9State = {
    active: true,
    valve: determineValveState(calculateOverallCoherence(scores)),
    lastActivation: result.createdAt,
    bias: null,
  };
  const currentByCorner = { physical: "V", mental: "∧", emotional: "W", spiritual: "∞" } as const;
  const quincunx: QuincunxState = {
    corners: {
      physical: { coherence: scores.physical, current: "V", status: scores.physical >= 0.7 ? "ok" : scores.physical >= 0.4 ? "warning" : "critical" },
      mental: { coherence: scores.mental, current: "∧", status: scores.mental >= 0.7 ? "ok" : scores.mental >= 0.4 ? "warning" : "critical" },
      emotional: { coherence: scores.emotional, current: "W", status: scores.emotional >= 0.7 ? "ok" : scores.emotional >= 0.4 ? "warning" : "critical" },
      spiritual: { coherence: scores.spiritual, current: "∞", status: scores.spiritual >= 0.7 ? "ok" : scores.spiritual >= 0.4 ? "warning" : "critical" },
    },
    position9,
    overallCoherence: calculateOverallCoherence(scores),
    timestamp: result.createdAt,
  };

  const activeCurrents = new Set(result.activeCurrents);
  const faces = Object.values(HOUSE_DEFINITIONS).map((house): HouseFaceState => {
    const base = scores[house.quincunxPrimary];
    const active = activeCurrents.has(house.current);
    const secondary = house.quincunxSecondary ? scores[house.quincunxSecondary] : base;
    const coherence = clamp((base * 0.7 + secondary * 0.3) + (active ? 0.08 : -0.06));
    const valve = faceValve(coherence, active, result.finalValve);
    const reason = active
      ? `${house.current} is present; ${house.quincunxPrimary} coherence sets the primary response.`
      : `${house.current} is absent; the face remains observable without carrying active flow.`;
    return { house, coherence, active, valve, reason };
  });
  const faceByHouse = new Map(faces.map((face) => [face.house.number, face]));

  const edges = DODECAHEDRON_EDGES.map((edge): DodecahedralEdgeState => {
    const houseA = HOUSE_DEFINITIONS[edge.houseA];
    const houseB = HOUSE_DEFINITIONS[edge.houseB];
    const activeA = activeCurrents.has(houseA.current);
    const activeB = activeCurrents.has(houseB.current);
    const resolution = resolveCurrentPair(houseA.current, houseB.current);
    const flow = activeA && activeB ? 1 : activeA || activeB ? 0.45 : 0;
    const valve = flow === 0 ? "IDLE" : activeA && activeB ? resolution.valveAction : "OPEN";
    const reason = activeA && activeB
      ? `${houseA.current} and ${houseB.current} meet at full flow; lookup ${resolution.lookupCode} resolves ${valve}.`
      : activeA || activeB
        ? `One endpoint carries the prompt, so this pathway opens at partial flow.`
        : `Neither endpoint carries an active prompt current; the pathway stays observable and idle.`;
    return { id: edge.id, houseA, houseB, lookupCode: resolution.lookupCode, valve, flow, reason };
  });

  const root = faceByHouse.get(1)!;
  const mirror = faceByHouse.get(9)!;
  const master = faceByHouse.get(10)!;
  const observerCoherence = 1;
  const triangleCoherence = Math.pow(
    root.coherence * mirror.coherence * master.coherence * observerCoherence,
    1 / 4,
  );
  const triangle: TriangleTrustState = {
    master,
    mirror,
    root,
    observerCoherence,
    coherence: triangleCoherence,
  };

  const pillars: PillarState[] = (["physical", "mental", "emotional", "spiritual"] as Corner[]).map((corner) => {
    const signals: Record<Corner, string[]> = {
      physical: [
        activeCurrents.has("V") ? "V intake" : "V intake quiet",
        activeCurrents.has("∆") ? "∆ commitment" : "∆ commitment quiet",
        activeCurrents.has("X") ? "X conflict load" : "No conflict load",
      ],
      mental: [
        activeCurrents.has("∧") ? "∧ output" : "∧ output quiet",
        activeCurrents.has("◇") ? "◇ review" : "◇ review quiet",
        activeCurrents.has("∞") ? "∞ recursion" : "No recursion",
        activeCurrents.has("X") ? "X contradiction" : "No contradiction",
      ],
      emotional: [
        activeCurrents.has("W") ? "W oscillation" : "W oscillation quiet",
        activeCurrents.has("◇") ? "◇ reflection" : "◇ reflection quiet",
        activeCurrents.has("8") ? "8 completion" : "8 completion quiet",
        activeCurrents.has("X") ? "X conflict" : "No conflict",
      ],
      spiritual: [
        activeCurrents.has("8") ? "8 return" : "8 return quiet",
        activeCurrents.has("◇") ? "◇ meaning" : "◇ meaning quiet",
        activeCurrents.has("∞") ? "∞ recursive loop" : "No recursive loop",
        activeCurrents.has("X") ? "X crossing" : "No crossing",
      ],
    };
    return pillarState(corner, corner, currentByCorner[corner], scores[corner], signals[corner]);
  });
  const aethericCoherence = clamp(
    quincunx.overallCoherence * 0.55
      + triangle.coherence * 0.45
      + (activeCurrents.has("8") ? 0.06 : 0)
      + (activeCurrents.has("◇") ? 0.03 : 0)
      - (result.finalValve === "CLOSE" ? 0.12 : result.finalValve === "MONITOR" ? 0.04 : 0),
  );
  pillars.push(pillarState("aetheric", "aetheric", "◯", aethericCoherence, [
    `${activeCurrents.size} currents integrated`,
    `Triangle Trust ${Math.round(triangle.coherence * 100)}%`,
    `Valve ${result.finalValve}`,
  ]));

  const flowingEdges = edges.filter((edge) => edge.flow > 0);
  const edgeCoherence = flowingEdges.length
    ? flowingEdges.reduce((sum, edge) => sum + (edge.valve === "CLOSE" ? 0.2 : edge.valve === "MONITOR" ? 0.55 : 1) * edge.flow, 0) / flowingEdges.length
    : quincunx.overallCoherence;
  const overallCoherence = Math.pow(
    quincunx.overallCoherence * triangle.coherence * clamp(edgeCoherence) * aethericCoherence,
    1 / 4,
  );
  const valve = edges.some((edge) => edge.flow === 1 && edge.valve === "CLOSE")
    ? "CLOSE"
    : result.finalValve === "MONITOR" || edges.some((edge) => edge.flow > 0 && edge.valve === "MONITOR")
      ? "MONITOR"
      : toValve(determineValveState(overallCoherence));

  return { quincunx, pillars, faces, edges, triangle, overallCoherence, valve };
}
