/* eslint-disable @next/next/no-html-link-for-pages -- native anchors intentionally perform full-page field navigation */
"use client";

import { useState } from "react";
import { BIRTH_PROFILE_STORAGE_KEY, type BirthProfile } from "@/lib/birth-profile";

type ValidationError = {
  field: keyof BirthProfile;
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
    birthPlace: "",
  });
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  function updateProfile(field: keyof BirthProfile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
    setValidationError((current) => current?.field === field ? null : current);
  }

  function focusField(form: HTMLFormElement, field: keyof BirthProfile) {
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
    window.location.assign("/quincunx");
  }

  return (
    <main className="birth-portal">
      <header className="portal-header">
        <a className="brand" href="/" aria-label="Dodecanic AI birth portal">
          <span className="brand-mark" aria-hidden="true">XIII</span>
          <span>
            <strong>DODECANIC</strong>
            <small>BIRTH PORTAL / LIVING FIELD</small>
          </span>
        </a>
        <span>Ø awaits your coordinates</span>
      </header>

      <section className="portal-stage">
        <div className="portal-intro">
          <p className="eyebrow">Entry coordinates / private session</p>
          <h1>Enter the<br /><em>living field.</em></h1>
          <p>
            Give the observer one origin point. These birth details travel with
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
            <em>Fields required to save</em>
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

          <label htmlFor="birth-time">
            <span>Exact birth time</span>
            <input
              id="birth-time"
              name="birthTime"
              type="time"
              value={profile.birthTime}
              onChange={(event) => updateProfile("birthTime", event.target.value)}
              required
            />
          </label>

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
