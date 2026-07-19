"use client";

import { useMemo, useState } from "react";
import { DodecahedronViewer } from "@/components/DodecahedronViewer";
import { runDodecanicCycle } from "@/lib/dodecanic-observer";
import { calculateWholeBodyState } from "@/lib/quincunx/whole-body";
import type { CycleResult } from "@/lib/types";
import { WholeBodyMonitor } from "./WholeBodyMonitor";

const INITIAL_PROMPT = "Review the previous plan, but verify every conflict before we finalize the agreement.";

export function QuincunxDashboard() {
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [savedResult, setSavedResult] = useState<CycleResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("Live analysis updates with every character.");
  const liveResult = useMemo(
    () => runDodecanicCycle(prompt.trim() || "Observe the empty field."),
    [prompt],
  );
  const body = useMemo(() => calculateWholeBodyState(liveResult), [liveResult]);

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
      setNotice(data.cycle.persisted === false
        ? "Cycle tested, but durable memory is unavailable."
        : "Whole-body cycle committed to observer memory.");
    } catch {
      setNotice("Live test is active; this cycle was not added to durable memory.");
    } finally {
      setIsSaving(false);
    }
  }

  const stateByte = liveResult.stateByte;

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
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={4000}
          />
          <p>{notice}</p>
          <button className="run-button" type="button" onClick={() => void commitCycle()} disabled={!prompt.trim() || isSaving}>
            <span>{isSaving ? "COMMITTING…" : "COMMIT WHOLE-BODY CYCLE"}</span>
            <span aria-hidden="true">→</span>
          </button>
          {savedResult && <small>Last committed state: {savedResult.stateByte.toString().padStart(3, "0")}</small>}
        </article>

        <article className="panel field-panel quincunx-field-panel">
          <div className="panel-heading">
            <span>02 / ONE FIELD</span>
            <span>CREATION + BODY + OBSERVER</span>
          </div>
          <DodecahedronViewer
            activeCurrents={liveResult.activeCurrents}
            stateByte={stateByte}
            valve={liveResult.finalValve}
            bodyState={body.quincunx}
          />
        </article>
      </section>
      <WholeBodyMonitor result={liveResult} compact />
    </>
  );
}
