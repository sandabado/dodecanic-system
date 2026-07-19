"use client";

import { useMemo } from "react";
import { calculateWholeBodyState } from "@/lib/quincunx/whole-body";
import type { CycleResult } from "@/lib/types";
import { QuincunxPresence } from "./QuincunxPresence";

interface WholeBodyMonitorProps {
  result: CycleResult;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function WholeBodyMonitor({ result }: WholeBodyMonitorProps) {
  const body = useMemo(() => calculateWholeBodyState(result), [result]);
  const flowingEdges = body.edges.filter((edge) => edge.flow > 0).length;
  const activeFaces = body.faces.filter((face) => face.active).length;

  return (
    <section className="whole-body" aria-label="Whole-body presence model">
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
    </section>
  );
}
