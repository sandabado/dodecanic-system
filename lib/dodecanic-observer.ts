import { byteToBinary, indicesToByte, parseSignal, signalToActiveIndices } from "./signal-parser";
import { CURRENTS, type CycleResult, type Interaction, type Signal, type ValveAction } from "./types";

const LOOKUP_TABLE = [
  ["COMP", "BREATH", "VORTEX", "GROUND", "SING", "WITH", "ENCODE", "SEED"],
  ["BREATH", "AMP", "AMP", "OPEN", "MON", "MON", "OPEN", "OPEN"],
  ["VORTEX", "AMP", "HUM", "AC", "INT", "FEED", "SPIRAL", "DEC"],
  ["GROUND", "OPEN", "AC", "MON", "OPEN", "OPEN", "OPEN", "OPEN"],
  ["SING", "MON", "INT", "OPEN", "GRID", "MON", "MON", "HALT"],
  ["WITH", "MON", "FEED", "OPEN", "MON", "MIRROR", "OPEN", "OPEN"],
  ["ENCODE", "OPEN", "SPIRAL", "OPEN", "MON", "OPEN", "TRAP", "OPEN"],
  ["SEED", "OPEN", "DEC", "OPEN", "HALT", "OPEN", "OPEN", "RESET"],
] as const;

const MONITOR_CODES = new Set(["COMP", "SING", "INT", "WITH", "ENCODE", "MON"]);
const CLOSE_CODES = new Set(["GRID", "MIRROR", "TRAP", "HALT"]);

function valveFor(code: string): ValveAction {
  if (CLOSE_CODES.has(code)) return "CLOSE";
  if (MONITOR_CODES.has(code)) return "MONITOR";
  return "OPEN";
}

function buildResponse(valve: ValveAction, signal: Signal): string {
  if (valve === "CLOSE") {
    if (signal.isRecursive && signal.isConflicting) {
      return "Recursion and conflict are reinforcing each other. Break the cycle before proceeding.";
    }
    if (signal.isConflicting) return "Conflicting requirements have reached gridlock. Escalate for a human decision.";
    return "The flow is closed. Pause and introduce a manual checkpoint.";
  }

  if (valve === "MONITOR") {
    const notes = [
      signal.isConflicting && "conflict",
      signal.requiresReview && "verification",
      signal.isOscillating && "oscillation",
      signal.isRecursive && "recursion",
    ].filter(Boolean);
    return `Proceed with observation. Keep ${notes.length ? notes.join(", ") : "the exchange"} visible and review the next transition.`;
  }

  const flows = [
    signal.requiresOutput && "response channel",
    signal.isCommitting && "commitment path",
    signal.isRecursive && "memory channel",
    signal.isCompleting && "completion gate",
  ].filter(Boolean);
  return `${flows.length ? flows.join(", ") : "Signal path"} clear. The system can proceed.`;
}

export function runDodecanicCycle(inputText: string): CycleResult {
  const inputSignal = parseSignal(inputText);
  const activeIndices = signalToActiveIndices(inputSignal);
  const stateByte = indicesToByte(activeIndices);
  const interactions: Interaction[] = [];

  for (let a = 0; a < activeIndices.length; a += 1) {
    for (let b = a + 1; b < activeIndices.length; b += 1) {
      const currentA = activeIndices[a];
      const currentB = activeIndices[b];
      const lookupCode = LOOKUP_TABLE[currentA][currentB];
      interactions.push({
        currentA: CURRENTS[currentA].symbol,
        currentB: CURRENTS[currentB].symbol,
        lookupCode,
        valveAction: valveFor(lookupCode),
      });
    }
  }

  const finalValve: ValveAction = interactions.some((item) => item.valveAction === "CLOSE")
    ? "CLOSE"
    : interactions.some((item) => item.valveAction === "MONITOR")
      ? "MONITOR"
      : "OPEN";

  return {
    inputText,
    inputSignal,
    stateByte,
    activeCurrents: activeIndices.map((index) => CURRENTS[index].symbol),
    interactions,
    finalValve,
    response: buildResponse(finalValve, inputSignal),
    createdAt: new Date().toISOString(),
  };
}

export { byteToBinary };
