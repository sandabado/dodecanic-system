import { byteToBinary } from "@/lib/dodecanic-observer";
import type { Corner, QuincunxState } from "@/lib/quincunx/engine";
import { CURRENTS, type ValveAction } from "@/lib/types";

type Props = {
  activeCurrents: string[];
  stateByte: number;
  valve: ValveAction | null;
  bodyState?: QuincunxState;
};

const BODY_CORNER_BY_CURRENT: Partial<Record<string, Corner>> = {
  V: "physical",
  "∧": "mental",
  W: "emotional",
  "∞": "spiritual",
};

function bodyValve(state: QuincunxState): ValveAction {
  if (state.position9.valve === "closed") return "CLOSE";
  if (state.position9.valve === "monitor") return "MONITOR";
  return "OPEN";
}

export function DodecahedronViewer({ activeCurrents, stateByte, valve, bodyState }: Props) {
  const resolvedValve = bodyState ? bodyValve(bodyState) : valve;
  return (
    <div
      className={`field-wrap${bodyState ? " is-quincunx" : ""}`}
      aria-label={bodyState ? "Quincunx body within the eight-current creation field" : "Eight-current state field"}
    >
      <div className="field-grid" aria-hidden="true" />
      {bodyState && <div className="quincunx-body" aria-hidden="true" />}
      <div className="field-core" data-valve={resolvedValve ?? "IDLE"}>
        <span className="field-kicker">{bodyState ? "Position 9" : "State byte"}</span>
        <strong>{bodyState ? `${Math.round(bodyState.overallCoherence * 100)}%` : byteToBinary(stateByte)}</strong>
        <span className="field-decimal">
          {bodyState
            ? `${bodyState.position9.active ? "IMPARTIAL" : "INACTIVE"} / ${bodyState.position9.valve}`
            : `${stateByte.toString().padStart(3, "0")} / 255`}
        </span>
      </div>
      {CURRENTS.map((current) => {
        const active = activeCurrents.includes(current.symbol);
        const corner = BODY_CORNER_BY_CURRENT[current.symbol];
        const cornerState = corner && bodyState ? bodyState.corners[corner] : null;
        return (
          <div
            className={`current-node current-${current.index}${active ? " is-active" : ""}`}
            key={current.symbol}
            title={cornerState
              ? `${corner} body corner — ${Math.round(cornerState.coherence * 100)}% coherent`
              : `${current.name} — ${current.opcode}`}
          >
            <span>{current.symbol}</span>
            <small>{cornerState ? `${corner} ${Math.round(cornerState.coherence * 100)}%` : current.opcode}</small>
          </div>
        );
      })}
    </div>
  );
}
