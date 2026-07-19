"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DodecahedronViewer } from "./DodecahedronViewer";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { WholeBodyMonitor } from "./quincunx/WholeBodyMonitor";
import { runDodecanicCycle } from "@/lib/dodecanic-observer";
import { CURRENTS, type CycleResult, type ValveAction } from "@/lib/types";

const SAMPLES = [
  { label: "Clean request", text: "Please explain how this observer works." },
  { label: "Conflict", text: "The plan is approved, but the other agent disagrees and wants the opposite." },
  { label: "Recursion", text: "Review the previous memory, loop through it again, and verify the result." },
  { label: "Completion", text: "Confirm the agreement, finalize it, and mark the cycle complete." },
] as const;

function valveLabel(valve: ValveAction | null) {
  if (!valve) return "AWAITING";
  return valve;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ObserverConsole() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<CycleResult | null>(null);
  const [history, setHistory] = useState<CycleResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/cycle", { cache: "no-store" })
      .then((response) => response.json() as Promise<{ history?: CycleResult[] }>)
      .then((data) => {
        if (alive && Array.isArray(data.history)) setHistory(data.history);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const runCycle = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isRunning) return;

    setIsRunning(true);
    setNotice(null);
    try {
      const response = await fetch("/api/cycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await response.json()) as { cycle?: CycleResult; error?: string };
      if (!response.ok || !data.cycle) throw new Error(data.error || "Cycle failed");

      setResult(data.cycle);
      setHistory((current) => [data.cycle!, ...current.filter((item) => item.id !== data.cycle?.id)].slice(0, 12));
      if (data.cycle.persisted === false) {
        setNotice("Analysis complete. Durable memory is temporarily unavailable.");
      }
    } catch {
      const localCycle = { ...runDodecanicCycle(text), persisted: false };
      setResult(localCycle);
      setHistory((current) => [localCycle, ...current].slice(0, 12));
      setNotice("Analysis complete in local mode. This cycle was not added to durable memory.");
    } finally {
      setIsRunning(false);
    }
  }, [inputText, isRunning]);

  const displayResult = useMemo(
    () => inputText.trim() ? runDodecanicCycle(inputText.trim()) : result,
    [inputText, result],
  );

  const activeIndices = useMemo(
    () => new Set(displayResult?.activeCurrents ?? []),
    [displayResult],
  );

  return (
    <main className="app-shell">
      <SiteHeader activeView="observer" />

      <section className="intro" id="top">
        <div>
          <p className="eyebrow">Reactive intelligence testbed</p>
          <h1>Read the currents.<br /><em>Decide the flow.</em></h1>
        </div>
        <p className="intro-copy">
          A deterministic observer for complex signals. Enter a message to sense
          its active currents, inspect their interactions, and resolve the valve.
        </p>
      </section>

      <section className="console-grid">
        <article className="panel input-panel">
          <div className="panel-heading">
            <span>01 / SIGNAL</span>
            <span>{inputText.length.toString().padStart(4, "0")} CHR</span>
          </div>
          <label className="sr-only" htmlFor="signal-input">Signal input</label>
          <textarea
            id="signal-input"
            value={inputText}
            maxLength={4000}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void runCycle();
              }
            }}
            placeholder="Enter a request, agreement, conflict, memory, or completion signal…"
          />
          <div className="sample-list" aria-label="Example signals">
            {SAMPLES.map((sample) => (
              <button type="button" key={sample.label} onClick={() => setInputText(sample.text)}>
                <span>{sample.label}</span>
                <span aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
          <button
            className="run-button"
            type="button"
            onClick={() => void runCycle()}
            disabled={!inputText.trim() || isRunning}
          >
            <span>{isRunning ? "SENSING CURRENT…" : "RUN OBSERVER CYCLE"}</span>
            <span aria-hidden="true">{isRunning ? "•••" : "→"}</span>
          </button>
          <p className="key-hint"><kbd>⌘</kbd> + <kbd>↵</kbd> to run</p>
        </article>

        <article className="panel field-panel">
          <div className="panel-heading">
            <span>02 / FIELD</span>
            <span>LIVE MAP</span>
          </div>
          <DodecahedronViewer
            activeCurrents={displayResult?.activeCurrents ?? []}
            stateByte={displayResult?.stateByte ?? 0}
            valve={displayResult?.finalValve ?? null}
          />
          <div className="current-legend">
            {CURRENTS.map((current) => (
              <div className={activeIndices.has(current.symbol) ? "is-active" : ""} key={current.symbol}>
                <span>{current.symbol}</span>
                <span>{current.name}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel result-panel" aria-live="polite">
          <div className="panel-heading">
            <span>03 / VALVE</span>
            <span>{displayResult ? `${displayResult.interactions.length} PAIRS` : "NO CYCLE"}</span>
          </div>
          <div className="valve-display" data-valve={displayResult?.finalValve ?? "IDLE"}>
            <span className="valve-orbit" aria-hidden="true" />
            <div>
              <span>Final valve</span>
              <strong>{valveLabel(displayResult?.finalValve ?? null)}</strong>
            </div>
          </div>

          {displayResult ? (
            <>
              <div className="response-block">
                <span>System response</span>
                <p>{displayResult.response}</p>
              </div>
              <div className="interaction-list">
                <div className="interaction-head">
                  <span>Pair</span><span>Lookup</span><span>Valve</span>
                </div>
                {displayResult.interactions.length ? displayResult.interactions.slice(0, 8).map((interaction, index) => (
                  <div className="interaction-row" key={`${interaction.currentA}-${interaction.currentB}-${index}`}>
                    <span>{interaction.currentA} + {interaction.currentB}</span>
                    <span>{interaction.lookupCode}</span>
                    <span data-valve={interaction.valveAction}>{interaction.valveAction}</span>
                  </div>
                )) : (
                  <p className="empty-pairs">A single current produces no pairwise interaction.</p>
                )}
                {displayResult.interactions.length > 8 && (
                  <p className="more-pairs">+ {displayResult.interactions.length - 8} additional interactions</p>
                )}
              </div>
            </>
          ) : (
            <div className="empty-result">
              <span>∴</span>
              <p>The valve is unresolved.<br />Introduce a signal to begin.</p>
            </div>
          )}
          {notice && <p className="notice">{notice}</p>}
        </article>
      </section>

      {displayResult && <WholeBodyMonitor result={displayResult} />}

      <section className="history-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Persistent observation log</p>
            <h2>Cycle memory</h2>
          </div>
          <span>{history.length.toString().padStart(2, "0")} RECORDS</span>
        </div>

        <div className="history-table">
          <div className="history-head" aria-hidden="true">
            <span>Timestamp</span><span>Signal</span><span>State</span><span>Currents</span><span>Valve</span>
          </div>
          {history.length ? history.map((cycle, index) => (
            <button
              type="button"
              className="history-row"
              key={cycle.id ?? `${cycle.createdAt}-${index}`}
              onClick={() => {
                setResult(cycle);
                setInputText(cycle.inputText);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span data-label="Timestamp">{formatTime(cycle.createdAt)}</span>
              <span data-label="Signal">{cycle.inputText}</span>
              <span data-label="State">{cycle.stateByte.toString().padStart(3, "0")}</span>
              <span data-label="Currents" className="history-currents">{cycle.activeCurrents.join(" · ")}</span>
              <span data-label="Valve" data-valve={cycle.finalValve}>{cycle.finalValve}</span>
            </button>
          )) : (
            <div className="history-empty">
              <span>NO RECORDED CYCLES</span>
              <p>Your completed observations will collect here.</p>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
