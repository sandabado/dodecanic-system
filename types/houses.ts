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
  humanMeaning: string;
  activatesWhen: string;
  imbalance: string;
  reflection: string;
  question: string;
  mantra: string;
  current: HouseCurrent;
}

export const HOUSE_DEFINITIONS: Record<HouseNumber, HouseDefinition> = {
  1: { number: 1, name: "Ground", element: "earth", quincunxPrimary: "physical", archetype: "The Root", humanMeaning: "Your physical foundation, resources, and the body you inhabit.", activatesWhen: "You attend to your body, space, or material needs.", imbalance: "Neglect of the physical self, disembodiment, or material instability.", reflection: "You are here. Your feet touch the earth.", question: "What supports you right now?", mantra: "I am anchored. I am here.", current: "V" },
  2: { number: 2, name: "Flow", element: "water", quincunxPrimary: "physical", quincunxSecondary: "emotional", archetype: "The Steward", humanMeaning: "How energy moves through your life: resources, sensation, and circulation.", activatesWhen: "You notice what flows in and what flows out.", imbalance: "Hoarding, depletion, or an inability to receive.", reflection: "What moves through you does not stop. It circulates.", question: "What are you holding that needs to flow?", mantra: "Resources circulate through me.", current: "W" },
  3: { number: 3, name: "Tech", element: "fire", quincunxPrimary: "mental", archetype: "The Communicator", humanMeaning: "The instruments and systems you use to think, build, and communicate.", activatesWhen: "You engage a tool, learn a system, or build something.", imbalance: "Over-engineering, disconnection from purpose, or tools used as avoidance.", reflection: "Your hands extend your mind. Use them well.", question: "What are you building, and for whom?", mantra: "Systems serve the vision.", current: "X" },
  4: { number: 4, name: "Heart", element: "aether", quincunxPrimary: "emotional", archetype: "The Homekeeper", humanMeaning: "Your private interior: home, ancestry, and what you protect.", activatesWhen: "You return to the familiar or tend to what is vulnerable.", imbalance: "Withdrawal, emotional flooding, or guarding what needs to breathe.", reflection: "What you protect shapes what you become.", question: "Where do you feel safe enough to be seen?", mantra: "Care is my offering.", current: "W" },
  5: { number: 5, name: "Sound", element: "air", quincunxPrimary: "spiritual", archetype: "The Creator", humanMeaning: "The frequency you emit through creative expression and essence.", activatesWhen: "You create without permission or transmit what is yours alone.", imbalance: "Silence, performance, or creation divorced from authenticity.", reflection: "You are a note in a larger chord. Sing it truly.", question: "What is yours to give that no one else can?", mantra: "I transmit the frequency.", current: "∆" },
  6: { number: 6, name: "Voice", element: "air", quincunxPrimary: "mental", quincunxSecondary: "spiritual", archetype: "The Healer", humanMeaning: "The articulation of truth and how it reaches another person.", activatesWhen: "You speak what is true, even when it is uncomfortable.", imbalance: "Speaking to be liked, withholding, or words without substance.", reflection: "Your voice carries further than your intention.", question: "What needs to be said that you have not said?", mantra: "My word carries truth.", current: "∧" },
  7: { number: 7, name: "Story", element: "aether", quincunxPrimary: "emotional", quincunxSecondary: "spiritual", archetype: "The Partner", humanMeaning: "The narrative you inhabit through partnership and reflection.", activatesWhen: "You meet another person and they change your shape.", imbalance: "Losing yourself in another or refusing to be changed at all.", reflection: "You are shaped by what you choose to stand beside.", question: "Who mirrors you, and what do they show?", mantra: "History shapes us forward.", current: "◇" },
  8: { number: 8, name: "Gather", element: "aether", quincunxPrimary: "emotional", archetype: "The Alchemist", humanMeaning: "The alchemy of assembly, when individuals become a field.", activatesWhen: "You gather with intention and the group changes what is possible.", imbalance: "Loneliness or proximity without intimacy.", reflection: "Together, you become different—not merely more of the same.", question: "What forms when you are in the room?", mantra: "We are the ceremony.", current: "X" },
  9: { number: 9, name: "Wisdom", element: "aether", quincunxPrimary: "mental", quincunxSecondary: "spiritual", archetype: "The Scholar", humanMeaning: "The distillation of experience into something teachable.", activatesWhen: "You integrate what you have lived and make it transferable.", imbalance: "Accumulating knowledge without embodiment.", reflection: "What you have survived is not yours alone.", question: "What has your life taught you that another person needs?", mantra: "Learning transforms to wisdom.", current: "◇" },
  10: { number: 10, name: "Law", element: "aether", quincunxPrimary: "mental", archetype: "The Sovereign", humanMeaning: "The structures you consent to: boundaries, authority, and sovereignty.", activatesWhen: "You set a boundary, make a commitment, or claim authority.", imbalance: "Rigidity or refusal to govern your own life.", reflection: "You are the authority on your own experience.", question: "What rule have you accepted that you did not write?", mantra: "Structure protects the whole.", current: "∆" },
  11: { number: 11, name: "Future", element: "aether", quincunxPrimary: "spiritual", quincunxSecondary: "mental", archetype: "The Visionary", humanMeaning: "What you see coming: vision, anticipation, and the horizon ahead.", activatesWhen: "You imagine what does not yet exist and begin moving toward it.", imbalance: "Nostalgia or chasing futures that are not yours.", reflection: "You are pulled by what is not yet here. Walk toward it.", question: "What future is asking you to build it?", mantra: "The unseen calls.", current: "∞" },
  12: { number: 12, name: "Tribe", element: "aether", quincunxPrimary: "spiritual", quincunxSecondary: "emotional", archetype: "The Elder", humanMeaning: "Your inheritance and legacy: the lineage before and after you.", activatesWhen: "You act on behalf of someone who comes after you.", imbalance: "Living only for yourself or carrying burdens that are not yours.", reflection: "You belong to something older and younger than yourself.", question: "What will you leave that you will never see?", mantra: "Legacy flows through generations.", current: "8" },
};

export function getHouseFromAscendant(ascendantDegree: number): HouseNumber {
  const normalizedDegree = ((ascendantDegree % 360) + 360) % 360;
  return (Math.floor(normalizedDegree / 30) + 1) as HouseNumber;
}
