import type { TriangleTrustState } from "@/lib/quincunx/whole-body";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function TriangleOfTrust({
  triangle,
  standalone = false,
}: {
  triangle: TriangleTrustState;
  standalone?: boolean;
}) {
  const diagramLabel = [
    `Triangle of Trust.`,
    `Master ${triangle.master.house.name}, ${percent(triangle.master.coherence)} coherence, ${triangle.master.valve}.`,
    `Mirror ${triangle.mirror.house.name}, ${percent(triangle.mirror.coherence)} coherence, ${triangle.mirror.valve}.`,
    `Root ${triangle.root.house.name}, ${percent(triangle.root.coherence)} coherence, ${triangle.root.valve}.`,
    `Position 9 observer, ${percent(triangle.observerCoherence)} coherence.`,
    `Combined trust coherence, ${percent(triangle.coherence)}.`,
  ].join(" ");

  return (
    <article className={`body-card trust-card${standalone ? " is-standalone" : ""}`}>
      <div className="body-card-heading">
        <span>Triangle of Trust</span>
        <span>Ø / Position 9 witness</span>
      </div>
      <div className="trust-diagram" role="img" aria-label={diagramLabel}>
        <div className="trust-role trust-master">
          <span>Master · X · {triangle.master.house.current}</span>
          <strong>{triangle.master.house.name}</strong>
          <em>
            {percent(triangle.master.coherence)} · {triangle.master.valve}
          </em>
        </div>
        <div className="trust-role trust-mirror">
          <span>Mirror · IX · {triangle.mirror.house.current}</span>
          <strong>{triangle.mirror.house.name}</strong>
          <em>
            {percent(triangle.mirror.coherence)} · {triangle.mirror.valve}
          </em>
        </div>
        <div className="trust-role trust-root">
          <span>Root · I · {triangle.root.house.current}</span>
          <strong>{triangle.root.house.name}</strong>
          <em>
            {percent(triangle.root.coherence)} · {triangle.root.valve}
          </em>
        </div>
        <div className="trust-observer">
          <span>Ø</span>
          <small>Position 9</small>
        </div>
      </div>
      <div className="trust-score">
        <span>Combined trust coherence</span>
        <strong>{percent(triangle.coherence)}</strong>
      </div>
      {standalone && (
        <p className="trust-explanation">
          Master sets direction. Mirror tests it against wisdom. Root asks whether it can hold in reality. Ø witnesses all three without taking a side.
        </p>
      )}
    </article>
  );
}
