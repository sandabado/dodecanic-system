import { calculateWholeBodyState } from "@/lib/quincunx/whole-body";
import type { CycleResult, ValveAction } from "@/lib/types";

export const TRIANGLE_TARGET = {
  coherence: 0.85,
  valve: "OPEN" as ValveAction,
  current: "∧",
  label: "Triangle target",
};

export interface TemporalBalance {
  past: {
    coherence: number;
    samples: number;
    anomalies: number;
    dominantValve: ValveAction | "NONE";
    memoryWindow: string;
  };
  present: {
    coherence: number;
    valve: ValveAction;
    activeCurrents: string[];
    flowingEdges: number;
  };
  future: {
    targetCoherence: number;
    gap: number;
    targetValve: ValveAction;
    targetCurrent: string;
    label: string;
    advisory: boolean;
  };
  alignment: number;
  direction: "rising" | "aligned" | "falling";
  observerLoop: readonly ["READ PRESENT", "COMPARE PAST", "ALIGN FUTURE", "WITNESS Ø"];
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function dominantValve(cycles: CycleResult[]): ValveAction | "NONE" {
  if (!cycles.length) return "NONE";
  const counts = cycles.reduce<Record<ValveAction, number>>((result, cycle) => {
    result[cycle.finalValve] += 1;
    return result;
  }, { OPEN: 0, MONITOR: 0, CLOSE: 0 });
  return (Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "NONE") as ValveAction;
}

export function calculateTemporalBalance(result: CycleResult, history: CycleResult[] = []): TemporalBalance {
  const presentBody = calculateWholeBodyState(result);
  const pastBodies = history.map((cycle) => calculateWholeBodyState(cycle));
  const pastCoherence = pastBodies.length
    ? pastBodies.reduce((sum, body) => sum + body.overallCoherence, 0) / pastBodies.length
    : presentBody.overallCoherence;
  const gap = TRIANGLE_TARGET.coherence - presentBody.overallCoherence;
  const spread = (
    Math.abs(pastCoherence - presentBody.overallCoherence)
      + Math.abs(presentBody.overallCoherence - TRIANGLE_TARGET.coherence)
      + Math.abs(TRIANGLE_TARGET.coherence - pastCoherence)
  ) / 3;

  return {
    past: {
      coherence: pastCoherence,
      samples: history.length,
      anomalies: history.filter((cycle) => cycle.finalValve !== "OPEN" || cycle.interactions.some((interaction) => interaction.valveAction === "CLOSE")).length,
      dominantValve: dominantValve(history),
      memoryWindow: "Last 50 committed cycles",
    },
    present: {
      coherence: presentBody.overallCoherence,
      valve: presentBody.valve,
      activeCurrents: result.activeCurrents,
      flowingEdges: presentBody.edges.filter((edge) => edge.flow > 0).length,
    },
    future: {
      targetCoherence: TRIANGLE_TARGET.coherence,
      gap,
      targetValve: TRIANGLE_TARGET.valve,
      targetCurrent: TRIANGLE_TARGET.current,
      label: TRIANGLE_TARGET.label,
      advisory: true,
    },
    alignment: clamp(1 - spread),
    direction: gap > 0.05 ? "rising" : gap < -0.05 ? "falling" : "aligned",
    observerLoop: ["READ PRESENT", "COMPARE PAST", "ALIGN FUTURE", "WITNESS Ø"],
  };
}
