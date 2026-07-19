"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Brand } from "@/components/Brand";
import { HOUSE_SPECTRUM_ORDER } from "@/lib/house-spectrum";
import { BIRTH_PROFILE_STORAGE_KEY, formatBirthTime, isBirthProfile, type BirthProfile } from "@/lib/birth-profile";

const STAGES = [
  "Receiving your origin coordinates",
  "Opening the twelve-House spectrum",
  "Placing YOU at the Ethereal center",
] as const;

type OrbitStyle = CSSProperties & {
  "--house-angle": string;
  "--house-color": string;
};

export function BirthLoading() {
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.sessionStorage.getItem(BIRTH_PROFILE_STORAGE_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : null;
        if (!isBirthProfile(parsed)) {
          window.location.replace("/");
          return;
        }
        setProfile(parsed);
      } catch {
        window.location.replace("/");
      }
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stageOne = window.setTimeout(() => setStage(1), reduceMotion ? 180 : 900);
    const stageTwo = window.setTimeout(() => setStage(2), reduceMotion ? 360 : 1800);
    const enterField = window.setTimeout(() => window.location.replace("/quincunx"), reduceMotion ? 650 : 2900);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(stageOne);
      window.clearTimeout(stageTwo);
      window.clearTimeout(enterField);
    };
  }, []);

  return (
    <main className="birth-loading" aria-labelledby="birth-loading-title">
      <header className="loading-header">
        <Brand subtitle="ORIGIN SEQUENCE" />
        <span>Private session / Ø</span>
      </header>

      <section className="loading-stage">
        <div className="loading-machine" aria-hidden="true">
          <div className="loading-orbit">
            {HOUSE_SPECTRUM_ORDER.map((house, index) => (
              <i
                key={house.house}
                style={{
                  "--house-angle": `${index * 30}deg`,
                  "--house-color": house.colorHex,
                } as OrbitStyle}
              >
                {house.roman}
              </i>
            ))}
            <div className="loading-center">
              <span>YOU</span>
              <strong>Ø</strong>
              <small>origin locked</small>
            </div>
          </div>
        </div>

        <div className="loading-copy">
          <p className="eyebrow">Entry sequence / {String(stage + 1).padStart(2, "0")} of 03</p>
          <h1 id="birth-loading-title">Entering the<br /><em>living field.</em></h1>
          <p className="loading-status" role="status" aria-live="polite">{STAGES[stage]}</p>

          <div className="loading-progress" aria-label={`${Math.round(((stage + 1) / STAGES.length) * 100)} percent complete`}>
            <span style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }} />
          </div>

          <dl className="loading-coordinates">
            <div><dt>Date</dt><dd>{profile?.birthDate || "Receiving…"}</dd></div>
            <div><dt>Time</dt><dd>{profile ? formatBirthTime(profile) : "Receiving…"}</dd></div>
            <div><dt>Place</dt><dd>{profile?.birthPlace || "Receiving…"}</dd></div>
          </dl>

          <p className="loading-boundary">
            This sequence places your submitted origin inside the visual field. Verified natal placements appear only after the licensed astrology engine is connected.
          </p>
        </div>
      </section>
    </main>
  );
}
