"use client";

import { useState } from "react";
import { Brand } from "@/components/Brand";
import { BIRTH_PROFILE_STORAGE_KEY, type BirthProfile } from "@/lib/birth-profile";

type BirthTextField = "birthDate" | "birthTime" | "birthPlace";

type ValidationError = {
  field: BirthTextField;
  message: string;
};

function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BirthPortal() {
  const [profile, setProfile] = useState<BirthProfile>({
    birthDate: "",
    birthTime: "",
    birthTimeKnown: true,
    birthPlace: "",
  });
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  function updateProfile(field: BirthTextField, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setValidationError((current) => current?.field === field ? null : current);
  }

  function focusField(form: HTMLFormElement, field: BirthTextField) {
    const input = form.elements.namedItem(field);
    if (input instanceof HTMLInputElement) input.focus();
  }

  function enterField(form: HTMLFormElement) {
    if (profile.birthDate > localDateValue(new Date())) {
      setValidationError({ field: "birthDate", message: "Birth date cannot be in the future." });
      focusField(form, "birthDate");
      return;
    }

    const birthPlace = profile.birthPlace.trim();
    if (!birthPlace) {
      setValidationError({ field: "birthPlace", message: "Enter a birthplace, not only spaces." });
      focusField(form, "birthPlace");
      return;
    }

    const sessionProfile = { ...profile, birthPlace };
    try {
      window.sessionStorage.setItem(BIRTH_PROFILE_STORAGE_KEY, JSON.stringify(sessionProfile));
    } catch {
      // The field remains usable when private browsing blocks session storage.
    }
    window.location.assign("/loading");
  }

  return (
    <main className="birth-portal">
      <header className="portal-header">
        <Brand subtitle="ORIGIN / LIVING FIELD" />
        <span>Ø awaits your coordinates</span>
      </header>

      <section className="portal-stage">
        <div className="portal-intro">
          <p className="eyebrow">Entry coordinates / private session</p>
          <h1>Enter the<br /><em>living field.</em></h1>
          <p>
            Give the field one origin point. These birth details travel with
            you in this browser session while you explore the dodecahedral field.
          </p>
          <div className="portal-sequence" aria-hidden="true">
            <span>Birth</span><i>→</i><span>Field</span><i>→</i><span>Witness</span>
          </div>
        </div>

        <form
          className="birth-form"
          onSubmit={(event) => {
            event.preventDefault();
            enterField(event.currentTarget);
          }}
        >
          <div className="birth-form-heading">
            <span>01 / Origin profile</span>
            <em>Date + place required</em>
          </div>

          <label htmlFor="birth-date">
            <span>Birth date</span>
            <input
              id="birth-date"
              name="birthDate"
              type="date"
              value={profile.birthDate}
              onChange={(event) => updateProfile("birthDate", event.target.value)}
              aria-invalid={validationError?.field === "birthDate" || undefined}
              aria-describedby={validationError?.field === "birthDate" ? "birth-form-error" : undefined}
              required
            />
          </label>

          <div className="birth-time-control">
            <label htmlFor="birth-time">
              <span>{profile.birthTimeKnown === false ? "Birth time" : "Exact birth time"}</span>
              <input
                id="birth-time"
                name="birthTime"
                type="time"
                value={profile.birthTime}
                onChange={(event) => updateProfile("birthTime", event.target.value)}
                disabled={profile.birthTimeKnown === false}
                required={profile.birthTimeKnown !== false}
              />
            </label>
            <button
              className="birth-time-toggle"
              type="button"
              aria-pressed={profile.birthTimeKnown === false}
              onClick={() => {
                setProfile((current) => ({
                  ...current,
                  birthTime: current.birthTimeKnown === false ? current.birthTime : "",
                  birthTimeKnown: current.birthTimeKnown === false,
                }));
                setValidationError(null);
              }}
            >
              {profile.birthTimeKnown === false ? "Use an exact time" : "I don’t know my birth time"}
            </button>
            {profile.birthTimeKnown === false && (
              <small>Future chart calculation will use transparent solar-chart mode without ASC or MC.</small>
            )}
          </div>

          <label htmlFor="birth-place">
            <span>Birthplace</span>
            <input
              id="birth-place"
              name="birthPlace"
              type="text"
              value={profile.birthPlace}
              onChange={(event) => updateProfile("birthPlace", event.target.value)}
              placeholder="City, region, country"
              autoComplete="off"
              aria-invalid={validationError?.field === "birthPlace" || undefined}
              aria-describedby={validationError?.field === "birthPlace" ? "birth-form-error" : undefined}
              required
            />
          </label>

          {validationError && (
            <small id="birth-form-error" role="alert">
              {validationError.message}
            </small>
          )}

          <button type="submit">
            <span>Enter the living field</span>
            <b aria-hidden="true">→</b>
          </button>
          <small>
            These coordinates stay in this browser session and are not committed to observer memory.
          </small>
        </form>
      </section>
    </main>
  );
}
