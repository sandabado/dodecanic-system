import type { TriangleTrustState } from "@/lib/quincunx/whole-body";
import type { CycleResult } from "@/lib/types";

export type EscapementGate = "OPEN" | "HOLD" | "LOCK";

export interface TriangleEscapementState {
  coherence: number;
  targetCoherence: number;
  inputPressure: number;
  impulse: number;
  restoringForce: number;
  alignmentLoss: number;
  modeledDelta: number;
  trustEfficiency: number;
  roleSpread: number;
  gate: EscapementGate;
  tick: 0 | 1;
  reason: string;
}

const TARGET_COHERENCE = 0.72;
const GEOMETRY_STRENGTH = 0.85;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * A transparent, read-only one-tick model—not a physical simulation or an
 * authorization system. H is prompt pressure, geometry restores toward a
 * fixed coherence target, and disagreement between the three roles is loss.
 */
export function modelTriangleEscapement(
  triangle: TriangleTrustState,
  cycle: CycleResult,
): TriangleEscapementState {
  const roleCoherences = [
    triangle.master.coherence,
    triangle.mirror.coherence,
    triangle.root.coherence,
  ];
  const roleSpread = Math.max(...roleCoherences) - Math.min(...roleCoherences);
  const inputPressure = clamp(cycle.activeCurrents.length / 8);
  const impulseDirection = cycle.finalValve === "CLOSE" ? -1 : cycle.finalValve === "MONITOR" ? 0.45 : 1;
  const impulse = inputPressure * 0.35 * impulseDirection;
  const restoringForce = GEOMETRY_STRENGTH * (TARGET_COHERENCE - triangle.coherence);
  const alignmentLoss = roleSpread * 0.35;
  const modeledDelta = impulse + restoringForce - alignmentLoss;
  const trustEfficiency = clamp(1 - roleSpread * 0.75 - (cycle.finalValve === "CLOSE" ? 0.18 : 0));
  const triangleLocked = cycle.finalValve === "CLOSE"
    || triangle.coherence < 0.4
    || [triangle.master, triangle.mirror, triangle.root].some((role) => role.valve === "CLOSE");
  const triangleHolding = cycle.finalValve === "MONITOR"
    || triangle.coherence < 0.68
    || roleSpread > 0.22;
  const gate: EscapementGate = triangleLocked ? "LOCK" : triangleHolding ? "HOLD" : "OPEN";

  const reason = gate === "LOCK"
    ? "The Triangle root locks the gate because a close signal or critical coherence is present. Human review is required."
    : gate === "HOLD"
      ? "Mirror holds the impulse while coherence or role alignment remains below the release threshold."
      : "Master impulse, Mirror alignment, and Triangle root timing satisfy this modeled release threshold.";

  return {
    coherence: triangle.coherence,
    targetCoherence: TARGET_COHERENCE,
    inputPressure,
    impulse,
    restoringForce,
    alignmentLoss,
    modeledDelta,
    trustEfficiency,
    roleSpread,
    gate,
    tick: gate === "OPEN" ? 1 : 0,
    reason,
  };
}
