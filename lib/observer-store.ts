import type { ObserverMemorySummary, ObserverPatternSummary } from "@/lib/observer-memory";
import { calculateWholeBodyState } from "@/lib/quincunx/whole-body";
import type { CycleResult } from "@/lib/types";

interface ObserverStore {
  cycles: CycleResult[];
  patterns: Map<string, ObserverPatternSummary>;
}

const MAX_CYCLES = 50;

function getStore(): ObserverStore {
  const serverGlobal = globalThis as typeof globalThis & {
    __dodecanicObserverStore?: ObserverStore;
  };

  if (!serverGlobal.__dodecanicObserverStore) {
    serverGlobal.__dodecanicObserverStore = {
      cycles: [],
      patterns: new Map<string, ObserverPatternSummary>(),
    };
  }

  return serverGlobal.__dodecanicObserverStore;
}

function cloneCycle(cycle: CycleResult): CycleResult {
  return structuredClone(cycle);
}

function patternId(signature: string): string {
  return `pattern-${Array.from(signature).reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7).toString(16)}`;
}

function effectiveConfidence(pattern: ObserverPatternSummary, now = Date.now()): ObserverPatternSummary {
  const ageDays = Math.max(0, now - new Date(pattern.lastSeen).getTime()) / 86_400_000;
  const confidenceScore = Math.max(0, pattern.confidenceScore - Math.floor(ageDays / 30) * 0.05);
  return {
    ...pattern,
    confidenceScore,
    faded: confidenceScore < pattern.confidenceScore,
  };
}

function recordObserverMemory(cycle: CycleResult): void {
  const store = getStore();
  const body = calculateWholeBodyState(cycle);
  const currentSignature = cycle.activeCurrents.slice().sort().join("+") || "none";
  const patterns: Array<{
    patternType: ObserverPatternSummary["patternType"];
    signature: string;
    outcome: ObserverPatternSummary["outcome"];
  }> = [{
    patternType: "signal_pattern",
    signature: `currents:${currentSignature}`,
    outcome: cycle.finalValve === "OPEN" ? "success" : "neutral",
  }];

  for (const interaction of cycle.interactions.filter((item) => item.valveAction === "CLOSE")) {
    patterns.push({
      patternType: "breach_signature",
      signature: `breach:${interaction.currentA}+${interaction.currentB}@${interaction.lookupCode}`,
      outcome: "neutral",
    });
  }

  if (body.overallCoherence >= 0.8) {
    patterns.push({
      patternType: "optimal_config",
      signature: `optimal:${cycle.finalValve}:${currentSignature}`,
      outcome: "success",
    });
  }

  for (const pattern of patterns) {
    const existing = store.patterns.get(pattern.signature);
    if (existing) {
      store.patterns.set(pattern.signature, {
        ...existing,
        outcome: pattern.outcome,
        confidenceScore: Math.min(1, existing.confidenceScore + 0.05),
        occurrenceCount: existing.occurrenceCount + 1,
        lastSeen: cycle.createdAt,
        faded: false,
      });
      continue;
    }

    store.patterns.set(pattern.signature, {
      id: patternId(pattern.signature),
      patternType: pattern.patternType,
      signature: pattern.signature,
      outcome: pattern.outcome,
      confidenceScore: 0.5,
      occurrenceCount: 1,
      firstSeen: cycle.createdAt,
      lastSeen: cycle.createdAt,
      faded: false,
    });
  }
}

/**
 * Stores the cycle for the lifetime of the current Node process. This keeps
 * local development and warm Vercel functions stateful without binding the
 * application bundle to a Cloudflare runtime.
 */
export async function saveCycle(cycle: CycleResult): Promise<CycleResult> {
  const stored: CycleResult = {
    ...cloneCycle(cycle),
    id: crypto.randomUUID(),
    persisted: false,
  };
  const store = getStore();
  store.cycles.unshift(stored);
  if (store.cycles.length > MAX_CYCLES) store.cycles.length = MAX_CYCLES;

  try {
    recordObserverMemory(stored);
  } catch {
    // Consolidation is best-effort and must not discard the committed cycle.
  }

  return cloneCycle(stored);
}

export async function listCycles(limit = 12): Promise<CycleResult[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), MAX_CYCLES);
  return getStore().cycles.slice(0, safeLimit).map(cloneCycle);
}

export async function listObserverPatterns(limit = 12): Promise<ObserverPatternSummary[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  return [...getStore().patterns.values()]
    .map((pattern) => effectiveConfidence(pattern))
    .sort((left, right) => right.confidenceScore - left.confidenceScore || right.lastSeen.localeCompare(left.lastSeen))
    .slice(0, safeLimit);
}

export async function getObserverMemorySummary(shortTermSamples = 0): Promise<ObserverMemorySummary> {
  const patterns = await listObserverPatterns(50);
  return {
    shortTermCapacity: 50,
    shortTermSamples,
    longTermPatterns: patterns.length,
    reinforcedPatterns: patterns.filter((pattern) => pattern.occurrenceCount > 1).length,
    fadedPatterns: patterns.filter((pattern) => pattern.faded).length,
    topPatterns: patterns.slice(0, 8),
  };
}
