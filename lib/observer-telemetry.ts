import type { CycleResult, ValveAction } from "@/lib/types";
import type { ObserverMemorySummary } from "@/lib/observer-memory";
import { calculateWholeBodyState, type WholeBodyState } from "@/lib/quincunx/whole-body";

export interface ObserverSnapshot {
  id: string;
  source: "live" | "memory";
  result: CycleResult;
  body: WholeBodyState;
}

export interface CommunityTelemetry {
  observedCycles: number;
  averageCoherence: number;
  openCycles: number;
  monitorCycles: number;
  closedCycles: number;
  latestAt: string | null;
}

export interface ObserverTelemetryPayload {
  history: ObserverSnapshot[];
  community: CommunityTelemetry;
  memory: ObserverMemorySummary;
  persisted: boolean;
}

export function createObserverSnapshot(
  result: CycleResult,
  source: ObserverSnapshot["source"] = "live",
): ObserverSnapshot {
  return {
    id: result.id ?? `live-${result.stateByte}-${result.createdAt}`,
    source,
    result,
    body: calculateWholeBodyState(result),
  };
}

export function summarizeObserverHistory(cycles: CycleResult[]): CommunityTelemetry {
  const snapshots = cycles.map((cycle) => createObserverSnapshot(cycle, "memory"));
  const count = snapshots.length;
  const valveCount = (valve: ValveAction) => snapshots.filter((snapshot) => snapshot.body.valve === valve).length;

  return {
    observedCycles: count,
    averageCoherence: count
      ? snapshots.reduce((sum, snapshot) => sum + snapshot.body.overallCoherence, 0) / count
      : 0,
    openCycles: valveCount("OPEN"),
    monitorCycles: valveCount("MONITOR"),
    closedCycles: valveCount("CLOSE"),
    latestAt: cycles[0]?.createdAt ?? null,
  };
}
