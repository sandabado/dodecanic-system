export const NATAL_CHART_SCHEMA_VERSION = 1 as const;

export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export const NATAL_PLANET_IDS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
  "north_node",
  "south_node",
  "chiron",
  "black_moon_lilith",
] as const;

export const CHART_ANGLE_IDS = [
  "ascendant",
  "midheaven",
  "descendant",
  "imum_coeli",
] as const;

export const NATAL_ASPECT_KINDS = [
  "conjunction",
  "opposition",
  "trine",
  "square",
  "sextile",
  "quincunx",
  "semisextile",
  "semisquare",
  "sesquiquadrate",
] as const;

export const HOUSE_SYSTEMS = [
  "placidus",
  "whole_sign",
  "equal",
  "koch",
  "porphyry",
  "regiomontanus",
  "campanus",
] as const;

export type NatalChartSchemaVersion = typeof NATAL_CHART_SCHEMA_VERSION;
export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];
export type NatalPlanetId = (typeof NATAL_PLANET_IDS)[number];
export type ChartAngleId = (typeof CHART_ANGLE_IDS)[number];
export type ChartPointId = NatalPlanetId | ChartAngleId;
export type NatalAspectKind = (typeof NATAL_ASPECT_KINDS)[number];
export type HouseSystem = (typeof HOUSE_SYSTEMS)[number];
export type ZodiacMode = "tropical" | "sidereal";
export type HouseNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface ResolvedBirthPlace {
  label: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  locality?: string;
  region?: string;
  countryCode?: string;
}

/**
 * A birth input after place and civil-time resolution. All dates remain strings
 * so the versioned chart can be serialized without losing timezone context.
 */
export interface ResolvedBirthInput {
  localDate: string;
  localTime: string;
  utcDateTime: string;
  utcOffsetMinutes: number;
  place: ResolvedBirthPlace;
}

export interface EclipticPosition {
  /** Longitude in the half-open interval [0, 360). */
  longitude: number;
  sign: ZodiacSign;
  /** Degrees into `sign`, in the half-open interval [0, 30). */
  degreeInSign: number;
}

export interface NatalPlanetPosition extends EclipticPosition {
  planet: NatalPlanetId;
  latitude: number;
  longitudeSpeed: number;
  retrograde: boolean;
  house: HouseNumber;
}

export interface HouseCusp extends EclipticPosition {
  house: HouseNumber;
}

export interface ChartAngle extends EclipticPosition {
  angle: ChartAngleId;
}

export interface NatalAspect {
  from: ChartPointId;
  to: ChartPointId;
  kind: NatalAspectKind;
  /** Exact angle associated with the aspect, in degrees. */
  exactAngle: number;
  /** Actual angular separation of the two points, in degrees. */
  separation: number;
  /** Absolute distance from exactness, in degrees. */
  orb: number;
  applying: boolean | null;
}

export interface NatalChartEngineMetadata {
  providerId: string;
  engineName: string;
  engineVersion: string;
  ephemerisVersion: string | null;
  houseSystem: HouseSystem;
  zodiac: ZodiacMode;
  ayanamsha: string | null;
  generatedAt: string;
}

/**
 * Canonical chart payload stored in `natal_charts.chart_data`. Increment
 * `schemaVersion` before making a breaking change to this shape.
 */
export interface NatalChartDataV1 {
  schemaVersion: NatalChartSchemaVersion;
  input: ResolvedBirthInput;
  engine: NatalChartEngineMetadata;
  planets: NatalPlanetPosition[];
  cusps: HouseCusp[];
  angles: ChartAngle[];
  aspects: NatalAspect[];
}

export type NatalChartData = NatalChartDataV1;

export interface NatalChartOptions {
  houseSystem: HouseSystem;
  zodiac: ZodiacMode;
  ayanamsha?: string;
}

export interface NatalChartRequest {
  input: ResolvedBirthInput;
  options: NatalChartOptions;
}
