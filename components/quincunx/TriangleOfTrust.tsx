import type { CSSProperties } from "react";
import { DataProvenanceBadge } from "@/components/DataProvenanceBadge";
import { DATA_PROVENANCE } from "@/lib/data-provenance";
import type { TriangleTrustState } from "@/lib/quincunx/whole-body";
import { modelTriangleEscapement } from "@/lib/triangle-escapement";
import type { CycleResult } from "@/lib/types";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function TriangleOfTrust({
  triangle,
  result,
}: {
  triangle: TriangleTrustState;
  result: CycleResult;
}) {
  const escapement = modelTriangleEscapement(triangle, result);
  const diagramLabel = [
    `Triangle escapement, read-only modeled instrument.`,
    `Gate ${escapement.gate}.`,
    `Master impulse ${percent(triangle.master.coherence)}.`,
    `Mirror restoring feedback ${percent(triangle.mirror.coherence)}.`,
    `Triangle root timing gate ${percent(triangle.root.coherence)}.`,
    `Position 9 system observer witnesses the model.`,
  ].join(" ");
  const clockStyle = {
    "--clock-energy": `${Math.round(escapement.inputPressure * 100)}%`,
    "--clock-swing": `${Math.max(4, Math.round(8 + escapement.roleSpread * 38))}deg`,
  } as CSSProperties;

  return (
    <article className="body-card trust-card is-standalone" data-gate={escapement.gate}>
      <div className="body-card-heading">
        <span>Triangle of Trust / social escapement</span>
        <DataProvenanceBadge compact status={DATA_PROVENANCE.triangleReadOnly} />
      </div>

      <div className="escapement-layout">
        <div className="escapement-clock" style={clockStyle} role="img" aria-label={diagramLabel}>
          <div className="escapement-status">
            <span>{escapement.gate === "OPEN" ? "Escapement engaged" : escapement.gate === "HOLD" ? "Impulse held" : "Gate locked"}</span>
            <strong>{escapement.gate}</strong>
          </div>
          <div className="escapement-spring" aria-hidden="true"><i /></div>
          <div className="escapement-wheel" aria-hidden="true"><i>✣</i></div>
          <div className="escapement-pendulum" aria-hidden="true"><i /><b>Ø</b></div>
          <span className="clock-role clock-master">MASTER <b>Impulse</b></span>
          <span className="clock-role clock-mirror">MIRROR <b>Restore</b></span>
          <span className="clock-role clock-root">root <b>Gate</b></span>
          <small>POSITION 9 / SYSTEM WITNESS</small>
        </div>

        <div className="escapement-readout">
          <div className="escapement-roles">
            <div><span>Master · X · {triangle.master.house.current}</span><strong>{triangle.master.house.name}</strong><em>{percent(triangle.master.coherence)} · {triangle.master.valve}</em></div>
            <div><span>Mirror · IX · {triangle.mirror.house.current}</span><strong>{triangle.mirror.house.name}</strong><em>{percent(triangle.mirror.coherence)} · {triangle.mirror.valve}</em></div>
            <div><span>root · I · {triangle.root.house.current}</span><strong>{triangle.root.house.name}</strong><em>{percent(triangle.root.coherence)} · {triangle.root.valve}</em></div>
          </div>
          <div className="escapement-equation">
            <span>One-tick stability model</span>
            <strong>Δα = H + k(α* − α) − L</strong>
            <small>Input + restoring force − alignment loss</small>
          </div>
          <dl className="escapement-metrics">
            <div><dt>α / coherence</dt><dd>{escapement.coherence.toFixed(3)}</dd></div>
            <div><dt>H / impulse</dt><dd>{escapement.impulse.toFixed(3)}</dd></div>
            <div><dt>k(α*−α)</dt><dd>{escapement.restoringForce.toFixed(3)}</dd></div>
            <div><dt>L / alignment loss</dt><dd>{escapement.alignmentLoss.toFixed(3)}</dd></div>
            <div><dt>Modeled Δα</dt><dd>{escapement.modeledDelta.toFixed(3)}</dd></div>
            <div><dt>Trust efficiency</dt><dd>{percent(escapement.trustEfficiency)}</dd></div>
          </dl>
        </div>
      </div>

      <div className="escapement-decision">
        <span>Tick {escapement.tick}</span>
        <p>{escapement.reason}</p>
      </div>
      <p className="trust-explanation">
        Master sets direction. Mirror tests deviation. The Triangle root controls timing. Position 9 is the system witness; the human retains authority to accept or reject its reflection. This instrument does not authorize actions or claim physical prediction.
      </p>
    </article>
  );
}
