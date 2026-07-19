export const BIRTH_PROFILE_STORAGE_KEY = "dodecanic.birth-profile";

export interface BirthProfile {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

export function isBirthProfile(value: unknown): value is BirthProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<BirthProfile>;
  return typeof profile.birthDate === "string"
    && typeof profile.birthTime === "string"
    && typeof profile.birthPlace === "string"
    && Boolean(profile.birthDate.trim() && profile.birthTime.trim() && profile.birthPlace.trim());
}
