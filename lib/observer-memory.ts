export type ObserverPatternType = "signal_pattern" | "breach_signature" | "optimal_config";

export interface ObserverPatternSummary {
  id: string;
  patternType: ObserverPatternType;
  signature: string;
  outcome: "success" | "neutral";
  confidenceScore: number;
  occurrenceCount: number;
  firstSeen: string;
  lastSeen: string;
  faded: boolean;
}

export interface ObserverMemorySummary {
  shortTermCapacity: 50;
  shortTermSamples: number;
  longTermPatterns: number;
  reinforcedPatterns: number;
  fadedPatterns: number;
  topPatterns: ObserverPatternSummary[];
}
