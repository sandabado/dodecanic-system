import {
  CHART_ANGLE_IDS,
  HOUSE_SYSTEMS,
  NATAL_ASPECT_KINDS,
  NATAL_CHART_SCHEMA_VERSION,
  NATAL_PLANET_IDS,
  ZODIAC_SIGNS,
  type ChartAngle,
  type HouseCusp,
  type NatalAspect,
  type NatalChartData,
  type NatalChartDataV1,
  type NatalChartEngineMetadata,
  type NatalChartRequest,
  type NatalPlanetPosition,
  type ResolvedBirthInput,
} from "./types";

/**
 * Boundary for a future ephemeris adapter. Implementations intentionally live
 * outside this scaffold so no engine is invoked before credentials and license
 * terms are configured.
 */
export interface NatalChartProvider {
  readonly id: string;
  getNatalChart(request: NatalChartRequest): Promise<unknown>;
}

export class NatalChartResponseError extends Error {
  readonly code = "INVALID_NATAL_CHART_RESPONSE";

  constructor(message = "The astrology provider returned an invalid natal chart payload.") {
    super(message);
    this.name = "NatalChartResponseError";
  }
}

const HOUSE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNumberInRange(value: unknown, minimum: number, maximum: number): value is number {
  return isFiniteNumber(value) && value >= minimum && value < maximum;
}

function isNumberWithin(value: unknown, minimum: number, maximum: number): value is number {
  return isFiniteNumber(value) && value >= minimum && value <= maximum;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value);
}

function isOneOf<const T extends readonly (string | number)[]>(
  value: unknown,
  options: T,
): value is T[number] {
  return options.some((option) => option === value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isLocalTime(value: unknown): value is string {
  return typeof value === "string"
    && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?$/.test(value);
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T/.test(value)
    && /(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function hasOnlyOptionalStrings(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  return keys.every((key) => value[key] === undefined || isNonEmptyString(value[key]));
}

function isResolvedBirthInput(value: unknown): value is ResolvedBirthInput {
  if (!isRecord(value) || !isRecord(value.place)) return false;

  const place = value.place;
  return isIsoDate(value.localDate)
    && isLocalTime(value.localTime)
    && isIsoDateTime(value.utcDateTime)
    && Number.isInteger(value.utcOffsetMinutes)
    && isFiniteNumber(value.utcOffsetMinutes)
    && value.utcOffsetMinutes >= -14 * 60
    && value.utcOffsetMinutes <= 14 * 60
    && isNonEmptyString(place.label)
    && isNumberWithin(place.latitude, -90, 90)
    && isNumberWithin(place.longitude, -180, 180)
    && isNonEmptyString(place.timeZone)
    && hasOnlyOptionalStrings(place, ["locality", "region", "countryCode"]);
}

function isEclipticPosition(value: Record<string, unknown>): boolean {
  return isNumberInRange(value.longitude, 0, 360)
    && isOneOf(value.sign, ZODIAC_SIGNS)
    && isNumberInRange(value.degreeInSign, 0, 30);
}

function isNatalPlanetPosition(value: unknown): value is NatalPlanetPosition {
  return isRecord(value)
    && isEclipticPosition(value)
    && isOneOf(value.planet, NATAL_PLANET_IDS)
    && isNumberWithin(value.latitude, -90, 90)
    && isFiniteNumber(value.longitudeSpeed)
    && typeof value.retrograde === "boolean"
    && isOneOf(value.house, HOUSE_NUMBERS);
}

function isHouseCusp(value: unknown): value is HouseCusp {
  return isRecord(value)
    && isEclipticPosition(value)
    && isOneOf(value.house, HOUSE_NUMBERS);
}

function isChartAngle(value: unknown): value is ChartAngle {
  return isRecord(value)
    && isEclipticPosition(value)
    && isOneOf(value.angle, CHART_ANGLE_IDS);
}

function isChartPointId(value: unknown): boolean {
  return isOneOf(value, NATAL_PLANET_IDS) || isOneOf(value, CHART_ANGLE_IDS);
}

function isNatalAspect(value: unknown): value is NatalAspect {
  return isRecord(value)
    && isChartPointId(value.from)
    && isChartPointId(value.to)
    && value.from !== value.to
    && isOneOf(value.kind, NATAL_ASPECT_KINDS)
    && isNumberWithin(value.exactAngle, 0, 180)
    && isNumberWithin(value.separation, 0, 180)
    && isNumberWithin(value.orb, 0, 30)
    && (typeof value.applying === "boolean" || value.applying === null);
}

function isEngineMetadata(value: unknown): value is NatalChartEngineMetadata {
  return isRecord(value)
    && isNonEmptyString(value.providerId)
    && isNonEmptyString(value.engineName)
    && isNonEmptyString(value.engineVersion)
    && isNullableString(value.ephemerisVersion)
    && isOneOf(value.houseSystem, HOUSE_SYSTEMS)
    && (value.zodiac === "tropical" || value.zodiac === "sidereal")
    && isNullableString(value.ayanamsha)
    && ((value.zodiac === "tropical" && value.ayanamsha === null)
      || (value.zodiac === "sidereal" && isNonEmptyString(value.ayanamsha)))
    && isIsoDateTime(value.generatedAt);
}

function hasUniqueValues<T>(values: readonly T[]): boolean {
  return new Set(values).size === values.length;
}

export function isNatalChartDataV1(value: unknown): value is NatalChartDataV1 {
  if (!isRecord(value)
    || value.schemaVersion !== NATAL_CHART_SCHEMA_VERSION
    || !isResolvedBirthInput(value.input)
    || !isEngineMetadata(value.engine)
    || !Array.isArray(value.planets)
    || !Array.isArray(value.cusps)
    || !Array.isArray(value.angles)
    || !Array.isArray(value.aspects)
  ) {
    return false;
  }

  const planets = value.planets;
  const cusps = value.cusps;
  const angles = value.angles;

  return planets.every(isNatalPlanetPosition)
    && hasUniqueValues(planets.map((planet) => planet.planet))
    && cusps.length === 12
    && cusps.every(isHouseCusp)
    && hasUniqueValues(cusps.map((cusp) => cusp.house))
    && angles.length === CHART_ANGLE_IDS.length
    && angles.every(isChartAngle)
    && hasUniqueValues(angles.map((angle) => angle.angle))
    && value.aspects.every(isNatalAspect);
}

export function isNatalChartProviderResponse(value: unknown): value is NatalChartData {
  return isNatalChartDataV1(value);
}

export function parseNatalChartProviderResponse(value: unknown): NatalChartData {
  if (!isNatalChartProviderResponse(value)) {
    throw new NatalChartResponseError();
  }
  return value;
}
