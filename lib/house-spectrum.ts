import { HOUSE_DEFINITIONS, type HouseNumber } from "@/types/houses";

export type HouseColor = `#${string}`;

export interface HouseSpectrumDefinition {
  house: HouseNumber;
  roman: string;
  name: string;
  colorHex: HouseColor;
  colorName: string;
  wavelengthNm: number;
  lightFrequencyThz: number;
  soundFrequencyHz: number;
  harmonic: number;
  geometry: string;
  cymaticMark: string;
  mode: string;
  note: string;
}

export const HOUSE_ROMAN: Record<HouseNumber, string> = {
  1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI",
  7: "VII", 8: "VIII", 9: "IX", 10: "X", 11: "XI", 12: "XII",
};

const SPECTRUM_DATA: Record<HouseNumber, Omit<HouseSpectrumDefinition, "house" | "roman" | "name">> = {
  1: { colorHex: "#4b0082", colorName: "Deep Indigo", wavelengthNm: 450, lightFrequencyThz: 668, soundFrequencyHz: 293, harmonic: 1, geometry: "Tetrahedron", cymaticMark: "△", mode: "Dorian", note: "D" },
  2: { colorHex: "#1e3a8a", colorName: "Blue", wavelengthNm: 470, lightFrequencyThz: 638, soundFrequencyHz: 329, harmonic: 2, geometry: "Tetrahedron", cymaticMark: "△", mode: "Phrygian", note: "E" },
  3: { colorHex: "#38bdf8", colorName: "Sky Blue", wavelengthNm: 490, lightFrequencyThz: 612, soundFrequencyHz: 369, harmonic: 3, geometry: "Octahedron", cymaticMark: "⬡", mode: "Lydian", note: "F♯" },
  4: { colorHex: "#22c55e", colorName: "Green", wavelengthNm: 520, lightFrequencyThz: 577, soundFrequencyHz: 391, harmonic: 4, geometry: "Cube", cymaticMark: "✤", mode: "Mixolydian", note: "G" },
  5: { colorHex: "#10b981", colorName: "Emerald", wavelengthNm: 540, lightFrequencyThz: 555, soundFrequencyHz: 440, harmonic: 5, geometry: "Dodecahedron", cymaticMark: "◎", mode: "Aeolian", note: "A" },
  6: { colorHex: "#84cc16", colorName: "Yellow-Green", wavelengthNm: 560, lightFrequencyThz: 536, soundFrequencyHz: 494, harmonic: 6, geometry: "Icosahedron", cymaticMark: "◢", mode: "Locrian", note: "B" },
  7: { colorHex: "#fbbf24", colorName: "Gold", wavelengthNm: 580, lightFrequencyThz: 517, soundFrequencyHz: 523, harmonic: 7, geometry: "Icosahedron", cymaticMark: "♛", mode: "Ionian", note: "C♯" },
  8: { colorHex: "#fb923c", colorName: "Golden-Orange", wavelengthNm: 595, lightFrequencyThz: 504, soundFrequencyHz: 587, harmonic: 8, geometry: "Dodecahedron", cymaticMark: "♨", mode: "Dorian ♯4", note: "D" },
  9: { colorHex: "#f97316", colorName: "Orange", wavelengthNm: 610, lightFrequencyThz: 492, soundFrequencyHz: 659, harmonic: 9, geometry: "Dodecahedron", cymaticMark: "◉", mode: "Phrygian ♯3", note: "E" },
  10: { colorHex: "#ea580c", colorName: "Red-Orange", wavelengthNm: 625, lightFrequencyThz: 480, soundFrequencyHz: 784, harmonic: 10, geometry: "Dodecahedron", cymaticMark: "⬟", mode: "Lydian ♯2", note: "F♯" },
  11: { colorHex: "#dc2626", colorName: "Red", wavelengthNm: 650, lightFrequencyThz: 461, soundFrequencyHz: 880, harmonic: 11, geometry: "Dodecahedron", cymaticMark: "◉", mode: "Mixolydian ♯6", note: "G" },
  12: { colorHex: "#991b1b", colorName: "Deep Crimson", wavelengthNm: 700, lightFrequencyThz: 429, soundFrequencyHz: 1047, harmonic: 12, geometry: "Dodecahedron", cymaticMark: "Ψ", mode: "Aeolian ♯5", note: "A" },
};

const HOUSE_NUMBERS: HouseNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const HOUSE_SPECTRUM = Object.fromEntries(
  HOUSE_NUMBERS.map((house) => [house, {
    house,
    roman: HOUSE_ROMAN[house],
    name: HOUSE_DEFINITIONS[house].name,
    ...SPECTRUM_DATA[house],
  }]),
) as Record<HouseNumber, HouseSpectrumDefinition>;

export const HOUSE_SPECTRUM_ORDER = HOUSE_NUMBERS.map((house) => HOUSE_SPECTRUM[house]);

export const HOUSE_SPECTRUM_CONIC = `conic-gradient(from -15deg, ${HOUSE_SPECTRUM_ORDER
  .map((house, index) => `${house.colorHex} ${index * 30}deg ${(index + 1) * 30}deg`)
  .join(", ")})`;

export function hexToRgba(hex: HouseColor, alpha: number): string {
  const color = hex.slice(1);
  const red = Number.parseInt(color.slice(0, 2), 16);
  const green = Number.parseInt(color.slice(2, 4), 16);
  const blue = Number.parseInt(color.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function mixHouseColors(colorA: HouseColor, colorB: HouseColor): HouseColor {
  const mixChannel = (offset: number) => Math.round(
    (Number.parseInt(colorA.slice(offset, offset + 2), 16) + Number.parseInt(colorB.slice(offset, offset + 2), 16)) / 2,
  ).toString(16).padStart(2, "0");
  return `#${mixChannel(1)}${mixChannel(3)}${mixChannel(5)}`;
}
