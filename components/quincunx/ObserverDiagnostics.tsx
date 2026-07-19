"use client";

import { useState } from "react";
import {
  DIAGNOSTIC_CASES,
  runObserverDiagnostics,
  type DiagnosticResult,
} from "@/lib/observer-diagnostics";

export function ObserverDiagnostics({ onLoadPrompt }: { onLoadPrompt: (prompt: string) => void }) {
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);
  const passed = results?.filter((result) => result.passed).length ?? 0;

  return (
    <section className="diagnostic-suite" aria-label="Observer synthetic diagnostics">
      <div className="diagnostic-heading">
        <div>
          <p className="eyebrow">04 / synthetic checks</p>
          <h2>Test the Observer</h2>
        </div>
        <button type="button" onClick={() => setResults(runObserverDiagnostics())}>
          {results ? "Run again" : "Run diagnostic suite"}
        </button>
      </div>
      <p className="diagnostic-copy">
        Known signals exercise intake, delivery, tension, recursion, return, and oscillation through the real model.
      </p>
      {results && (
        <div className="diagnostic-score" data-passing={passed === results.length}>
          <strong>{passed}/{results.length}</strong>
          <span>synthetic cycles passing</span>
        </div>
      )}
      <div className="diagnostic-grid">
        {DIAGNOSTIC_CASES.map((diagnostic) => {
          const result = results?.find((item) => item.id === diagnostic.id) ?? null;
          return (
            <article className="diagnostic-case" data-result={result ? (result.passed ? "pass" : "fail") : "ready"} key={diagnostic.id}>
              <div>
                <span>{diagnostic.id}</span>
                <em>{result ? (result.passed ? "PASS" : "FAIL") : "READY"}</em>
              </div>
              <h3>{diagnostic.label}</h3>
              <p>“{diagnostic.prompt}”</p>
              <dl>
                <div><dt>Expected</dt><dd>{diagnostic.expectedCurrents.join(" ")} / {diagnostic.expectedValve}</dd></div>
                {result && <div><dt>Observed</dt><dd>{result.actualCurrents.join(" ")} / {result.actualValve}</dd></div>}
              </dl>
              <button type="button" onClick={() => onLoadPrompt(diagnostic.prompt)}>Load into field</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
