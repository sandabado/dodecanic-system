export const BIRTH_PROFILE_STORAGE_KEY = "dodecanic.birth-profile";

export interface BirthProfile {
  birthDate: string;
  birthTime: string;
  birthTimeKnown?: boolean;
  birthPlace: string;
}

export function hasKnownBirthTime(profile: BirthProfile): boolean {
  return profile.birthTimeKnown !== false && Boolean(profile.birthTime.trim());
}

export function formatBirthTime(profile: BirthProfile): string {
  return hasKnownBirthTime(profile) ? profile.birthTime : "Unknown · solar chart mode";
}

export function isBirthProfile(value: unknown): value is BirthProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<BirthProfile>;
  return typeof profile.birthDate === "string"
    && typeof profile.birthTime === "string"
    && (profile.birthTimeKnown === undefined || typeof profile.birthTimeKnown === "boolean")
    && typeof profile.birthPlace === "string"
    && Boolean(
      profile.birthDate.trim()
      && profile.birthPlace.trim()
      && (profile.birthTimeKnown === false || profile.birthTime.trim()),
    );
}
