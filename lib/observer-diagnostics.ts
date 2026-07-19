import { DODECAHEDRON_EDGES } from "@/lib/dodecahedron/topology";
import { runDodecanicCycle } from "@/lib/dodecanic-observer";
import { calculateWholeBodyState } from "@/lib/quincunx/whole-body";
import type { ValveAction } from "@/lib/types";

export interface DiagnosticCase {
  id: string;
  label: string;
  prompt: string;
  expectedCurrents: string[];
  expectedValve: ValveAction;
}

export interface DiagnosticResult extends DiagnosticCase {
  passed: boolean;
  actualCurrents: string[];
  actualValve: ValveAction;
  checks: {
    currents: boolean;
    valve: boolean;
    faces: boolean;
    edges: boolean;
    pillars: boolean;
    observer: boolean;
  };
}

export const DIAGNOSTIC_CASES: DiagnosticCase[] = [
  {
    id: "intake",
    label: "Clean intake",
    prompt: "Incoming signal received.",
    expectedCurrents: ["V"],
    expectedValve: "OPEN",
  },
  {
    id: "delivery",
    label: "Clear delivery",
    prompt: "Please build, approve, and ship this response.",
    expectedCurrents: ["V", "∧", "∆"],
    expectedValve: "OPEN",
  },
  {
    id: "review",
    label: "Review tension",
    prompt: "Review this plan, but verify the conflicting requirement.",
    expectedCurrents: ["V", "X", "◇"],
    expectedValve: "MONITOR",
  },
  {
    id: "gridlock",
    label: "Forced gridlock",
    prompt: "The conflict loops forever against the previous decision, but it must finally end.",
    expectedCurrents: ["V", "X", "∞", "8"],
    expectedValve: "CLOSE",
  },
  {
    id: "return",
    label: "Verified return",
    prompt: "Review the result; reset after completion.",
    expectedCurrents: ["V", "◇", "8"],
    expectedValve: "MONITOR",
  },
  {
    id: "oscillation",
    label: "Visible oscillation",
    prompt: "Repeat the alternate rotation again.",
    expectedCurrents: ["V", "W"],
    expectedValve: "OPEN",
  },
];

function sameCurrents(actual: string[], expected: string[]): boolean {
  return actual.length === expected.length && expected.every((current) => actual.includes(current));
}

export function runObserverDiagnostics(): DiagnosticResult[] {
  return DIAGNOSTIC_CASES.map((diagnostic) => {
    const result = runDodecanicCycle(diagnostic.prompt);
    const body = calculateWholeBodyState(result);
    const checks = {
      currents: sameCurrents(result.activeCurrents, diagnostic.expectedCurrents),
      valve: result.finalValve === diagnostic.expectedValve,
      faces: body.faces.length === 12 && new Set(body.faces.map((face) => face.house.number)).size === 12,
      edges: body.edges.length === 30 && DODECAHEDRON_EDGES.length === 30 && new Set(body.edges.map((edge) => edge.id)).size === 30,
      pillars: body.pillars.length === 5,
      observer: body.quincunx.position9.active && body.quincunx.position9.bias === null,
    };
    return {
      ...diagnostic,
      passed: Object.values(checks).every(Boolean),
      actualCurrents: result.activeCurrents,
      actualValve: result.finalValve,
      checks,
    };
  });
}
