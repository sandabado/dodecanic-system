"use client";

import { useEffect, useMemo, useState } from "react";
import { LivingDodecahedron } from "@/components/dodecahedron/LivingDodecahedron";
import { HouseSpectrum } from "@/components/houses/HouseSpectrum";
import { SiteHeader } from "@/components/SiteHeader";
import { useObserverTelemetry } from "@/hooks/useObserverTelemetry";
import { BIRTH_PROFILE_STORAGE_KEY, isBirthProfile, type BirthProfile } from "@/lib/birth-profile";
import { runDodecanicCycle } from "@/lib/dodecanic-observer";
import { DIAGNOSTIC_CASES } from "@/lib/observer-diagnostics";
import { calculateTemporalBalance } from "@/lib/observer-temporal";
import type { CycleResult } from "@/lib/types";
import { NatalProfilePanel } from "./NatalProfilePanel";
import { ObserverDiagnostics } from "./ObserverDiagnostics";
import { TemporalObserver } from "./TemporalObserver";
import { TriangleOfTrust } from "./TriangleOfTrust";
import { WholeBodyMonitor } from "./WholeBodyMonitor";

const INITIAL_PROMPT = "Review the previous plan, but verify every conflict before we finalize the agreement.";

type FieldShelf = "profile" | "memory" | "time" | "diagnostics" | "trust" | "body" | "spectrum";

const SHELF_TITLES: Record<FieldShelf, string> = {
  profile: "Your natal profile",
  memory: "Observer memory",
  time: "Past · Present · Future",
  diagnostics: "Synthetic diagnostics",
  trust: "Triangle of Trust",
  body: "Whole-body presence",
  spectrum: "Twelve-House spectrum",
};

function formatMemoryTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function QuincunxDashboard() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [savedResult, setSavedResult] = useState<CycleResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const [activeShelf, setActiveShelf] = useState<FieldShelf | null>(null);
  const [birthProfile, setBirthProfile] = useState<BirthProfile | null>(null);
  const [notice, setNotice] = useState("Live analysis updates with every character.");
  const liveResult = useMemo(
    () => runDodecanicCycle(prompt.trim() || "Observe the empty field."),
    [prompt],
  );
  const telemetry = useObserverTelemetry(liveResult);
  const snapshot = replayIndex === null
    ? telemetry.live
    : telemetry.history[replayIndex] ?? telemetry.live;
  const temporal = useMemo(
    () => calculateTemporalBalance(snapshot.result, telemetry.history.map((item) => item.result)),
    [snapshot.result, telemetry.history],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.sessionStorage.getItem(BIRTH_PROFILE_STORAGE_KEY);
        if (!stored) return;
        const parsed: unknown = JSON.parse(stored);
        if (isBirthProfile(parsed)) setBirthProfile(parsed);
      } catch {
        // A birth profile is optional after the field has loaded.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  function updatePrompt(nextPrompt: string) {
    setPrompt(nextPrompt);
    setSavedResult(null);
    setReplayIndex(null);
    setNotice("Live analysis updates with every character.");
  }

  async function commitCycle() {
    if (!prompt.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt.trim() }),
      });
      const data = (await response.json()) as { cycle?: CycleResult };
      if (!response.ok || !data.cycle) throw new Error("Unable to save");
      setSavedResult(data.cycle);
      setReplayIndex(null);
      await telemetry.refetch();
      setNotice(data.cycle.persisted === false
        ? "Cycle tested, but durable memory is unavailable."
        : "Whole-body cycle committed to observer memory.");
    } catch {
      setNotice("Live test is active; this cycle was not added to durable memory.");
    } finally {
      setIsSaving(false);
    }
  }

  const promptStatus = replayIndex !== null
    ? `REPLAYING MEMORY ${replayIndex + 1}`
    : isSaving
      ? "COMMITTING TO MEMORY"
      : savedResult
        ? `STATE ${savedResult.stateByte.toString().padStart(3, "0")} COMMITTED`
        : notice;
  const activeFaces = snapshot.body.faces.filter((face) => face.active).length;
  const flowingEdges = snapshot.body.edges.filter((edge) => edge.flow > 0).length;

  return (
    <main className="app-shell field-site">
      <SiteHeader
        activeView="quincunx"
        utility={(
          <form
            className="nav-prompt"
            aria-label="Living field prompt"
            onSubmit={(event) => {
              event.preventDefault();
              void commitCycle();
            }}
          >
            <div className="nav-prompt-meta">
              <label htmlFor="whole-body-prompt">Live prompt</label>
              <span aria-live="polite">{promptStatus}</span>
            </div>
            <div className="nav-prompt-row">
              <input
                id="whole-body-prompt"
                value={prompt}
                onChange={(event) => updatePrompt(event.target.value)}
                maxLength={4000}
                autoComplete="off"
              />
              <button type="submit" disabled={!prompt.trim() || isSaving}>
                <span>{isSaving ? "Saving" : "Commit"}</span>
                <b aria-hidden="true">↵</b>
              </button>
            </div>
          </form>
        )}
      />

      <section className="field-viewport" aria-label="Living dodecahedral field">
        <div className="field-identity" role="status" aria-live="polite" aria-atomic="true">
          <span>{birthProfile ? "You / natal anchor / current session" : "You / profile pending"}</span>
          <strong>{birthProfile
            ? `${birthProfile.birthDate} · ${birthProfile.birthTime} · ${birthProfile.birthPlace}`
            : "The Dodecahedron is the field of creation. Add birth coordinates to place yourself inside it."}</strong>
        </div>
        <LivingDodecahedron
          snapshot={snapshot}
          community={telemetry.community}
          connection={telemetry.connection}
          profile={birthProfile}
        />

        <nav className="field-shelf-rail" aria-label="Living field information shelves">
          <button
            className="profile-shelf-trigger"
            type="button"
            data-active={activeShelf === "profile"}
            data-profile={birthProfile ? "ready" : "pending"}
            aria-expanded={activeShelf === "profile"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "profile" ? null : "profile")}
          >
            <span>00 / You</span>
            <strong>YOU</strong>
            <small>{birthProfile ? birthProfile.birthPlace : "add birth profile"}</small>
          </button>
          <button
            type="button"
            data-active={activeShelf === "memory"}
            aria-expanded={activeShelf === "memory"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "memory" ? null : "memory")}
          >
            <span>01 / Memory</span>
            <strong>{telemetry.community.observedCycles}</strong>
            <small>{replayIndex === null ? "live field" : `memory ${replayIndex + 1}`}</small>
          </button>
          <button
            type="button"
            data-active={activeShelf === "time"}
            aria-expanded={activeShelf === "time"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "time" ? null : "time")}
          >
            <span>02 / Time</span>
            <strong>{Math.round(temporal.alignment * 100)}%</strong>
            <small>{temporal.direction}</small>
          </button>
          <button
            type="button"
            data-active={activeShelf === "diagnostics"}
            aria-expanded={activeShelf === "diagnostics"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "diagnostics" ? null : "diagnostics")}
          >
            <span>03 / Diagnostics</span>
            <strong>{DIAGNOSTIC_CASES.length}</strong>
            <small>synthetic probes</small>
          </button>
          <button
            type="button"
            data-active={activeShelf === "trust"}
            aria-expanded={activeShelf === "trust"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "trust" ? null : "trust")}
          >
            <span>04 / Trust</span>
            <strong>{Math.round(snapshot.body.triangle.coherence * 100)}%</strong>
            <small>I Root · IX Mirror · X Master</small>
          </button>
          <button
            type="button"
            data-active={activeShelf === "body"}
            aria-expanded={activeShelf === "body"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "body" ? null : "body")}
          >
            <span>05 / Presence</span>
            <strong>{Math.round(snapshot.body.overallCoherence * 100)}%</strong>
            <small>{activeFaces}/12 faces · {flowingEdges}/30 edges</small>
          </button>
          <button
            className="spectrum-shelf-trigger"
            type="button"
            data-active={activeShelf === "spectrum"}
            aria-expanded={activeShelf === "spectrum"}
            aria-controls="field-shelf-drawer"
            onClick={() => setActiveShelf((current) => current === "spectrum" ? null : "spectrum")}
          >
            <span>06 / Spectrum</span>
            <strong>XII</strong>
            <small>color · light · sound</small>
          </button>
        </nav>

        {activeShelf && (
          <aside id="field-shelf-drawer" className="field-shelf-drawer" aria-label={SHELF_TITLES[activeShelf]}>
            <header>
              <div>
                <span>Open shelf</span>
                <strong>{SHELF_TITLES[activeShelf]}</strong>
              </div>
              <button type="button" onClick={() => setActiveShelf(null)} aria-label={`Close ${SHELF_TITLES[activeShelf]}`}>
                Close ×
              </button>
            </header>
            <div className="field-shelf-content">
              {activeShelf === "profile" && (
                <NatalProfilePanel
                  profile={birthProfile}
                  onEditProfile={() => window.location.assign("/")}
                />
              )}
              {activeShelf === "memory" && (
                <section className="telemetry-replay" aria-label="Observer memory replay">
                  <div className="telemetry-replay-heading">
                    <div>
                      <p className="eyebrow">Historical playback</p>
                      <h2>Replay the body</h2>
                    </div>
                    <button
                      type="button"
                      className={replayIndex === null ? "is-active" : ""}
                      onClick={() => setReplayIndex(null)}
                    >
                      ● Live prompt
                    </button>
                  </div>
                  <div className="timeline-control">
                    <span>Newest</span>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(telemetry.history.length - 1, 0)}
                      value={replayIndex ?? 0}
                      disabled={telemetry.history.length === 0}
                      aria-label="Replay a stored observer cycle"
                      onChange={(event) => setReplayIndex(Number(event.target.value))}
                    />
                    <span>Oldest</span>
                  </div>
                  <div className="replay-readout">
                    <strong>{replayIndex === null ? "Now / unsaved live field" : `Memory ${replayIndex + 1} of ${telemetry.history.length}`}</strong>
                    <span>{snapshot.source === "live" ? "Updates with every character" : `${formatMemoryTime(snapshot.result.createdAt)} UTC`}</span>
                    <p>“{snapshot.result.inputText}”</p>
                  </div>
                  <div className="telemetry-summary" aria-label="Observed community cycle summary">
                    <span><strong>{telemetry.community.observedCycles}</strong> observed</span>
                    <span><strong>{telemetry.community.openCycles}</strong> open</span>
                    <span><strong>{telemetry.community.monitorCycles}</strong> monitor</span>
                    <span><strong>{telemetry.community.closedCycles}</strong> close</span>
                  </div>
                </section>
              )}
              {activeShelf === "time" && <TemporalObserver result={snapshot.result} history={telemetry.history} />}
              {activeShelf === "diagnostics" && (
                <ObserverDiagnostics
                  onLoadPrompt={(diagnosticPrompt) => {
                    updatePrompt(diagnosticPrompt);
                    setNotice("Synthetic signal loaded. The live body reflects it now.");
                    setActiveShelf(null);
                  }}
                />
              )}
              {activeShelf === "trust" && (
                <section className="trust-shelf" aria-label="Triangle of Trust model">
                  <TriangleOfTrust triangle={snapshot.body.triangle} standalone />
                </section>
              )}
              {activeShelf === "body" && (
                <>
                  <WholeBodyMonitor result={snapshot.result} compact />
                  <p className="model-boundary">
                    Observer readings describe patterns in submitted language. They are reflective system telemetry—not medical, psychological, or biometric diagnoses.
                  </p>
                </>
              )}
              {activeShelf === "spectrum" && <HouseSpectrum />}
            </div>
          </aside>
        )}
      </section>
    </main>
  );
}
