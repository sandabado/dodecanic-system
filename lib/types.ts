export const CURRENTS = [
  { index: 0, symbol: "V", name: "Collapse", opcode: "Intake", signalKey: "hasIncomingData" },
  { index: 1, symbol: "∧", name: "Expanse", opcode: "Project", signalKey: "requiresOutput" },
  { index: 2, symbol: "W", name: "Wave", opcode: "Oscillate", signalKey: "isOscillating" },
  { index: 3, symbol: "∆", name: "Circuit", opcode: "Lock", signalKey: "isCommitting" },
  { index: 4, symbol: "X", name: "Intersect", opcode: "Junction", signalKey: "isConflicting" },
  { index: 5, symbol: "◇", name: "Mirror", opcode: "Reflect", signalKey: "requiresReview" },
  { index: 6, symbol: "∞", name: "Loop", opcode: "Sustain", signalKey: "isRecursive" },
  { index: 7, symbol: "8", name: "Return", opcode: "Reset", signalKey: "isCompleting" },
] as const;

export type Signal = {
  hasIncomingData: boolean;
  requiresOutput: boolean;
  isOscillating: boolean;
  isCommitting: boolean;
  isConflicting: boolean;
  requiresReview: boolean;
  isRecursive: boolean;
  isCompleting: boolean;
};

export type ValveAction = "OPEN" | "MONITOR" | "CLOSE";

export type Interaction = {
  currentA: string;
  currentB: string;
  lookupCode: string;
  valveAction: ValveAction;
};

export type CycleResult = {
  id?: string;
  inputText: string;
  inputSignal: Signal;
  stateByte: number;
  activeCurrents: string[];
  interactions: Interaction[];
  finalValve: ValveAction;
  response: string;
  createdAt: string;
  persisted?: boolean;
};
