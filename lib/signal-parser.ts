import { CURRENTS, type Signal } from "./types";

const EMPTY_SIGNAL: Signal = {
  hasIncomingData: false,
  requiresOutput: false,
  isOscillating: false,
  isCommitting: false,
  isConflicting: false,
  requiresReview: false,
  isRecursive: false,
  isCompleting: false,
};

export function parseSignal(text: string): Signal {
  const lower = text.toLowerCase().trim();
  if (!lower) return { ...EMPTY_SIGNAL };

  const words = lower.match(/[\p{L}\p{N}']+/gu) ?? [];

  return {
    hasIncomingData: true,
    requiresOutput:
      lower.includes("?") ||
      /\b(please|explain|tell|show|create|build|help|what|why|how|when|where|who|can you|could you|would you)\b/i.test(lower) ||
      (words.length === 1 && words[0].length < 10),
    isOscillating:
      /\b(alternate|cycle|repeat|oscillate|flip|switch|back and forth|again|rotation|spin|recurring)\b/i.test(lower) ||
      words.length > 80,
    isCommitting:
      /\b(commit|agree|contract|execute|confirm|finalize|approve|sign|binding|agreement|ship|publish)\b/i.test(lower),
    isConflicting:
      /\b(but|however|versus|vs\.?|against|opposite|conflict|disagree|contradict|paradox|tension|clash|blocked)\b/i.test(lower),
    requiresReview:
      /\b(check|verify|review|audit|validate|confirm|are you sure|should i|prove|test|measure|inspect)\b/i.test(lower),
    isRecursive:
      /\b(loop|recurse|memory|archive|previous|past|again and again|forever|infinite|recursive|echo|remember)\b/i.test(lower),
    isCompleting:
      /\b(finish|complete|done|end|finally|conclude|wrap up|that's it|all clear|reset|return|resolved)\b/i.test(lower),
  };
}

export function signalToActiveIndices(signal: Signal): number[] {
  return CURRENTS.filter((current) => signal[current.signalKey]).map(
    (current) => current.index,
  );
}

export function indicesToByte(indices: number[]): number {
  return indices.reduce((state, index) => state | (1 << index), 0);
}

export function byteToBinary(byte: number): string {
  return byte.toString(2).padStart(8, "0");
}
