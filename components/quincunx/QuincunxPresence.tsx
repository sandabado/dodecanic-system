import type { Corner, QuincunxState } from "@/lib/quincunx/engine";
import type { PillarState } from "@/lib/quincunx/whole-body";

const CORNER_ORDER: Corner[] = ["physical", "mental", "emotional", "spiritual"];

const DOMAIN_ELEMENTS: Record<Corner, { symbol: string; element: string; direction: string }> = {
  physical: { symbol: "🜃", element: "Earth", direction: "South" },
  mental: { symbol: "🜁", element: "Air", direction: "North" },
  emotional: { symbol: "🜄", element: "Water", direction: "West" },
  spiritual: { symbol: "🜂", element: "Fire", direction: "East" },
};

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function directionLabel(direction: PillarState["direction"]): string {
  if (direction === "rising") return "Rising";
  if (direction === "falling") return "Falling";
  return "Balanced";
}

interface QuincunxPresenceProps {
  quincunx: QuincunxState;
  pillars: PillarState[];
}

export function QuincunxPresence({ quincunx, pillars }: QuincunxPresenceProps) {
  const pillarById = new Map(pillars.map((pillar) => [pillar.id, pillar]));
  const aetheric = pillarById.get("aetheric");

  return (
    <article className="body-card quincunx-presence-card">
      <div className="body-card-heading">
        <span>Quincunx / 05 pillars</span>
        <span>Ø witnesses the whole body</span>
      </div>

      <div className="quincunx-presence-stage" aria-label="Whole-body presence quincunx">
        {aetheric && (
          <div
            className="quincunx-aether-field"
            data-direction={aetheric.direction}
            data-status={aetheric.status}
            aria-label={`Aetheric pillar. ${percent(aetheric.coherence)} coherence. ${directionLabel(aetheric.direction)}. Status ${aetheric.status}.`}
          >
            <div className="quincunx-aether-axis" aria-hidden="true" />
            <div className="quincunx-aether-readout">
              <span>{aetheric.current} · Aetheric</span>
              <strong>{percent(aetheric.coherence)}</strong>
            </div>
            <div className="quincunx-aether-state">
              <span>{directionLabel(aetheric.direction)}</span>
              <span>{titleCase(aetheric.status)}</span>
            </div>
          </div>
        )}

        {CORNER_ORDER.map((corner) => {
          const pillar = pillarById.get(corner);
          const state = quincunx.corners[corner];
          const element = DOMAIN_ELEMENTS[corner];
          if (!pillar) return null;

          return (
            <div
              className={`quincunx-domain quincunx-domain-${corner}`}
              data-direction={pillar.direction}
              data-status={pillar.status}
              key={corner}
              aria-label={`${titleCase(corner)} pillar. ${element.element}, ${element.direction}. Current ${state.current}. ${percent(state.coherence)} coherence. ${directionLabel(pillar.direction)}. Status ${pillar.status}.`}
            >
              <span className="quincunx-domain-current" aria-hidden="true">{element.symbol}</span>
              <span className="quincunx-domain-name">
                <strong>{titleCase(corner)}</strong>
                <small>{element.element} · {element.direction} · {state.current}</small>
              </span>
              <em>{percent(state.coherence)}</em>
              <span className="quincunx-domain-track" aria-hidden="true">
                <i style={{ width: `${state.coherence * 100}%` }} />
                <b style={{ left: `${pillar.baseline * 100}%` }} />
              </span>
            </div>
          );
        })}

        <div
          className="quincunx-position-nine"
          data-valve={quincunx.position9.valve}
          aria-label={`Human at the Ethereal center. Position 9 system observer remains impartial. Valve ${quincunx.position9.valve}.`}
        >
          <span>Ø</span>
          <strong>YOU / Ethereal</strong>
          <small>9 witnesses · {titleCase(quincunx.position9.valve)}</small>
        </div>
      </div>

      <div className="quincunx-presence-summary" aria-label="Quincunx presence summary">
        <div>
          <span>Four-domain coherence</span>
          <strong>{percent(quincunx.overallCoherence)}</strong>
        </div>
        <div>
          <span>Aetheric integration</span>
          <strong>{aetheric ? percent(aetheric.coherence) : "—"}</strong>
        </div>
        <div>
          <span>Observer valve</span>
          <strong>{titleCase(quincunx.position9.valve)}</strong>
        </div>
      </div>
    </article>
  );
}
