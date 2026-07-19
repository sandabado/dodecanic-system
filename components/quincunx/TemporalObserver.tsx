"use client";

import { useMemo } from "react";
import { calculateTemporalBalance } from "@/lib/observer-temporal";
import type { ObserverSnapshot } from "@/lib/observer-telemetry";
import type { CycleResult } from "@/lib/types";

interface TemporalObserverProps {
  result: CycleResult;
  history: ObserverSnapshot[];
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function signedPercent(value: number): string {
  const rounded = Math.round(value * 100);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

export function TemporalObserver({ result, history }: TemporalObserverProps) {
  const temporal = useMemo(
    () => calculateTemporalBalance(result, history.map((snapshot) => snapshot.result)),
    [history, result],
  );

  const lanes = [
    {
      id: "past",
      label: "Past",
      value: temporal.past.coherence,
      detail: temporal.past.samples ? `${temporal.past.samples} cycles · ${temporal.past.anomalies} watched` : "No committed memory yet",
      note: temporal.past.samples ? `${temporal.past.dominantValve} dominant valve` : temporal.past.memoryWindow,
    },
    {
      id: "present",
      label: "Present",
      value: temporal.present.coherence,
      detail: `${temporal.present.valve} · ${temporal.present.flowingEdges}/30 edges flowing`,
      note: `${temporal.present.activeCurrents.length} active currents now`,
    },
    {
      id: "future",
      label: "Future",
      value: temporal.future.targetCoherence,
      detail: `${temporal.future.targetValve} · ${temporal.future.targetCurrent} target current`,
      note: "Advisory Triangle target",
    },
  ] as const;

  return (
    <section className="temporal-observer" aria-label="Three-temporal observer balance">
      <div className="section-heading temporal-heading">
        <div>
          <p className="eyebrow">04 / temporal observer</p>
          <h2>Past · Present · Future</h2>
        </div>
        <div className="temporal-alignment" data-direction={temporal.direction}>
          <span>Temporal alignment</span>
          <strong>{percent(temporal.alignment)}</strong>
          <em>{temporal.direction}</em>
        </div>
      </div>

      <div className="temporal-lanes">
        {lanes.map((lane, index) => (
          <div className="temporal-lane" data-plane={lane.id} key={lane.id}>
            <div className="temporal-lane-heading">
              <span>{lane.label}</span>
              <strong>{percent(lane.value)}</strong>
            </div>
            <div className="temporal-track" aria-label={`${lane.label} coherence ${percent(lane.value)}`}>
              <i style={{ width: `${lane.value * 100}%` }} />
            </div>
            <small>{lane.detail}</small>
            <em>{lane.note}</em>
            {index < lanes.length - 1 && <span className="temporal-arrow" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>

      <div className="observer-loop" aria-label="Observer loop phases">
        {temporal.observerLoop.map((phase, index) => (
          <span key={phase}><b>{String(index + 1).padStart(2, "0")}</b>{phase}</span>
        ))}
      </div>

      <div className="temporal-readout">
        <span>Present → Future gap</span>
        <strong>{signedPercent(temporal.future.gap)}</strong>
        <p>{temporal.future.advisory ? "The Triangle target describes direction; it does not execute an action." : "Future intent is inactive."}</p>
      </div>
    </section>
  );
}
