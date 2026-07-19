"use client";

import { useMemo } from "react";
import { calculateWholeBodyState } from "@/lib/quincunx/whole-body";
import type { CycleResult } from "@/lib/types";
import { QuincunxPresence } from "./QuincunxPresence";

interface WholeBodyMonitorProps {
  result: CycleResult;
  compact?: boolean;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function WholeBodyMonitor({ result, compact = false }: WholeBodyMonitorProps) {
  const body = useMemo(() => calculateWholeBodyState(result), [result]);
  const flowingEdges = body.edges.filter((edge) => edge.flow > 0).length;
  const activeFaces = body.faces.filter((face) => face.active).length;

  return (
    <section className={`whole-body${compact ? " is-compact" : ""}`} aria-label="Whole-body presence model">
      <div className="section-heading whole-body-heading">
        <div>
          <p className="eyebrow">Prompt propagation / live model</p>
          <h2>Whole-body presence</h2>
        </div>
        <div className="body-summary" data-valve={body.valve}>
          <span>System coherence</span>
          <strong>{percent(body.overallCoherence)}</strong>
          <em>{body.valve}</em>
        </div>
      </div>

      <div className="prompt-trace">
        <span>Signal under observation</span>
        <p>“{result.inputText}”</p>
        <div>
          <span>{result.activeCurrents.length} currents</span>
          <span>{activeFaces} / 12 faces</span>
          <span>{flowingEdges} / 30 edges flowing</span>
        </div>
      </div>

      <QuincunxPresence quincunx={body.quincunx} pillars={body.pillars} />

      <article className="body-card faces-card">
        <div className="body-card-heading">
          <span>12 faces / Houses</span>
          <span>One state per face</span>
        </div>
        <div className="face-grid">
          {body.faces.map((face) => (
            <div className={`face-state${face.active ? " is-active" : ""}`} data-valve={face.valve} key={face.house.number}>
              <span className="face-number">{face.house.number.toString().padStart(2, "0")}</span>
              <span className="face-current">{face.house.current}</span>
              <strong>{face.house.name}</strong>
              <small>{face.house.archetype}</small>
              <em>{percent(face.coherence)}</em>
              <span className="face-valve">{face.valve}</span>
            </div>
          ))}
        </div>
      </article>

      <article className="body-card edges-card">
        <div className="body-card-heading">
          <span>30 unique edges</span>
          <span>No duplicate pathways</span>
        </div>
        <div className="edge-grid">
          {body.edges.map((edge) => (
            <div className={`edge-state${edge.flow > 0 ? " is-flowing" : ""}`} data-valve={edge.valve} key={edge.id}>
              <span className="edge-id">E/{edge.id}</span>
              <span className="edge-houses">{edge.houseA.name} ↔ {edge.houseB.name}</span>
              <span className="edge-currents">{edge.houseA.current} + {edge.houseB.current}</span>
              <span className="edge-code">{edge.lookupCode}</span>
              <span className="edge-valve">{edge.valve}</span>
              <span className="edge-flow" aria-label={`${Math.round(edge.flow * 100)} percent flow`}>
                <i style={{ width: `${edge.flow * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
