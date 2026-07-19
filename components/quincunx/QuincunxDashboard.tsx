"use client";

import { useMemo, useState } from "react";
import { LivingDodecahedron } from "@/components/dodecahedron/LivingDodecahedron";
import { useObserverTelemetry } from "@/hooks/useObserverTelemetry";
import { runDodecanicCycle } from "@/lib/dodecanic-observer";
import type { CycleResult } from "@/lib/types";
import { ObserverDiagnostics } from "./ObserverDiagnostics";
import { WholeBodyMonitor } from "./WholeBodyMonitor";

const INITIAL_PROMPT = "Review the previous plan, but verify every conflict before we finalize the agreement.";

export function QuincunxDashboard() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [savedResult, setSavedResult] = useState<CycleResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [replayIndex, setReplayIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState("Live analysis updates with every character.");
  const liveResult = useMemo(
    () => runDodecanicCycle(prompt.trim() || "Observe the empty field."),
    [prompt],
  );
  const telemetry = useObserverTelemetry(liveResult);
  const snapshot = replayIndex === null
    ? telemetry.live
    : telemetry.history[replayIndex] ?? telemetry.live;

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

  return (
    <>
      <section className="quincunx-lab-grid">
        <article className="panel quincunx-prompt-panel">
          <div className="panel-heading">
            <span>01 / PROMPT</span>
            <span>REAL-TIME INPUT</span>
          </div>
          <label htmlFor="whole-body-prompt">Test the whole body</label>
          <textarea
            id="whole-body-prompt"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setReplayIndex(null);
            }}
            maxLength={4000}
          />
          <p>{notice}</p>
          <button className="run-button" type="button" onClick={() => void commitCycle()} disabled={!prompt.trim() || isSaving}>
            <span>{isSaving ? "COMMITTING…" : "COMMIT WHOLE-BODY CYCLE"}</span>
            <span aria-hidden="true">→</span>
          </button>
          {savedResult && <small>Last committed state: {savedResult.stateByte.toString().padStart(3, "0")}</small>}
        </article>

        <article className="panel field-panel quincunx-field-panel living-field-panel">
          <div className="panel-heading">
            <span>02 / LIVING FIELD</span>
            <span>CLICK ANY FACE OR EDGE</span>
          </div>
          <LivingDodecahedron
            snapshot={snapshot}
            community={telemetry.community}
            connection={telemetry.connection}
          />
        </article>
      </section>

      <section className="telemetry-replay" aria-label="Observer memory replay">
        <div className="telemetry-replay-heading">
          <div>
            <p className="eyebrow">03 / historical playback</p>
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
          <span>{new Date(snapshot.result.createdAt).toLocaleString()}</span>
          <p>“{snapshot.result.inputText}”</p>
        </div>
        <div className="telemetry-summary" aria-label="Observed community cycle summary">
          <span><strong>{telemetry.community.observedCycles}</strong> observed</span>
          <span><strong>{telemetry.community.openCycles}</strong> open</span>
          <span><strong>{telemetry.community.monitorCycles}</strong> monitor</span>
          <span><strong>{telemetry.community.closedCycles}</strong> close</span>
        </div>
      </section>

      <ObserverDiagnostics
        onLoadPrompt={(diagnosticPrompt) => {
          setPrompt(diagnosticPrompt);
          setReplayIndex(null);
          setNotice("Synthetic signal loaded. The live body reflects it now.");
        }}
      />

      <WholeBodyMonitor result={snapshot.result} compact />
      <p className="model-boundary">
        Observer readings describe patterns in submitted language. They are reflective system telemetry—not medical, psychological, or biometric diagnoses.
      </p>
    </>
  );
}
