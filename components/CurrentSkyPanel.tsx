"use client";

import { useEffect, useState } from "react";
import type { BirthProfile } from "@/lib/birth-profile";

function formatUtc(iso: string): string {
  if (!iso) return "Synchronizing…";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function formatLocal(iso: string): string {
  if (!iso) return "Synchronizing…";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(new Date(iso));
}

export function CurrentSkyPanel({ profile }: { profile: BirthProfile | null }) {
  const [nowIso, setNowIso] = useState("");

  useEffect(() => {
    const update = () => setNowIso(new Date().toISOString());
    const firstTick = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1_000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <section className="current-sky" aria-label="Current sky comparison layer">
      <header>
        <div>
          <p className="eyebrow">Moving layer / exact moment</p>
          <h2>The sky now</h2>
        </div>
        <span className="current-sky-status" data-state="pending">Engine pending</span>
      </header>

      <div className="current-time-grid">
        <div>
          <span>Current UTC</span>
          <strong>{formatUtc(nowIso)}</strong>
          <small>{nowIso || "Waiting for browser clock"}</small>
        </div>
        <div>
          <span>Your local clock</span>
          <strong>{formatLocal(nowIso)}</strong>
          <small>{Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone"}</small>
        </div>
      </div>

      <div className="chart-layer-flow" aria-label="Chart intelligence layers">
        <article data-ready={Boolean(profile)}>
          <span>01 / Fixed</span>
          <h3>Natal blueprint</h3>
          <p>{profile
            ? `${profile.birthDate} · ${profile.birthTime} · ${profile.birthPlace}`
            : "Birth date, exact time, and place are required."}</p>
        </article>
        <i aria-hidden="true">×</i>
        <article data-ready={Boolean(nowIso)}>
          <span>02 / Moving</span>
          <h3>Current sky</h3>
          <p>{nowIso ? `${nowIso} · planetary calculation pending` : "Synchronizing the exact current moment."}</p>
        </article>
        <i aria-hidden="true">→</i>
        <article>
          <span>03 / Reading</span>
          <h3>Dodecanic activation</h3>
          <p>Transit-to-natal aspects will activate Houses, colors, currents, and interpretation.</p>
        </article>
      </div>

      <p className="model-boundary">
        The clock is live. Planetary positions remain uncalculated until the licensed Swiss Ephemeris adapter and place/time resolver are connected.
      </p>
    </section>
  );
}
