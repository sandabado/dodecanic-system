export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type HouseCorner = "physical" | "mental" | "emotional" | "spiritual";
export type HouseElement = "earth" | "water" | "fire" | "air" | "aether";
export type HouseCurrent = "V" | "∧" | "W" | "X" | "∆" | "◇" | "∞" | "8";

export interface HouseDefinition {
  number: HouseNumber;
  name: string;
  element: HouseElement;
  quincunxPrimary: HouseCorner;
  quincunxSecondary?: HouseCorner;
  archetype: string;
  mantra: string;
  current: HouseCurrent;
}

export const HOUSE_DEFINITIONS: Record<HouseNumber, HouseDefinition> = {
  1: { number: 1, name: "Ground", element: "earth", quincunxPrimary: "physical", archetype: "The Root", mantra: "I am anchored. I am here.", current: "V" },
  2: { number: 2, name: "Flow", element: "water", quincunxPrimary: "physical", quincunxSecondary: "emotional", archetype: "The Steward", mantra: "Resources circulate through me.", current: "W" },
  3: { number: 3, name: "Tech", element: "fire", quincunxPrimary: "mental", archetype: "The Communicator", mantra: "Systems serve the vision.", current: "X" },
  4: { number: 4, name: "Heart", element: "aether", quincunxPrimary: "emotional", archetype: "The Homekeeper", mantra: "Care is my offering.", current: "W" },
  5: { number: 5, name: "Sound", element: "air", quincunxPrimary: "spiritual", archetype: "The Creator", mantra: "I transmit the frequency.", current: "∆" },
  6: { number: 6, name: "Voice", element: "air", quincunxPrimary: "mental", quincunxSecondary: "spiritual", archetype: "The Healer", mantra: "My word carries truth.", current: "∧" },
  7: { number: 7, name: "Story", element: "aether", quincunxPrimary: "emotional", quincunxSecondary: "spiritual", archetype: "The Partner", mantra: "History shapes us forward.", current: "◇" },
  8: { number: 8, name: "Gather", element: "aether", quincunxPrimary: "emotional", archetype: "The Alchemist", mantra: "We are the ceremony.", current: "X" },
  9: { number: 9, name: "Wisdom", element: "aether", quincunxPrimary: "mental", quincunxSecondary: "spiritual", archetype: "The Scholar", mantra: "Learning transforms to wisdom.", current: "◇" },
  10: { number: 10, name: "Law", element: "aether", quincunxPrimary: "mental", archetype: "The Sovereign", mantra: "Structure protects the whole.", current: "∆" },
  11: { number: 11, name: "Future", element: "aether", quincunxPrimary: "spiritual", quincunxSecondary: "mental", archetype: "The Visionary", mantra: "The unseen calls.", current: "∞" },
  12: { number: 12, name: "Tribe", element: "aether", quincunxPrimary: "spiritual", quincunxSecondary: "emotional", archetype: "The Elder", mantra: "Legacy flows through generations.", current: "8" },
};

export function getHouseFromAscendant(ascendantDegree: number): HouseNumber {
  const normalizedDegree = ((ascendantDegree % 360) + 360) % 360;
  return (Math.floor(normalizedDegree / 30) + 1) as HouseNumber;
}
