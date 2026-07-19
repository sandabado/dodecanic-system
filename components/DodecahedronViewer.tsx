import { byteToBinary } from "@/lib/dodecanic-observer";
import { CURRENTS, type ValveAction } from "@/lib/types";

type Props = {
  activeCurrents: string[];
  stateByte: number;
  valve: ValveAction | null;
};

export function DodecahedronViewer({ activeCurrents, stateByte, valve }: Props) {
  return (
    <div className="field-wrap" aria-label="Eight-current state field">
      <div className="field-grid" aria-hidden="true" />
      <div className="field-core" data-valve={valve ?? "IDLE"}>
        <span className="field-kicker">State byte</span>
        <strong>{byteToBinary(stateByte)}</strong>
        <span className="field-decimal">{stateByte.toString().padStart(3, "0")} / 255</span>
      </div>
      {CURRENTS.map((current) => {
        const active = activeCurrents.includes(current.symbol);
        return (
          <div
            className={`current-node current-${current.index}${active ? " is-active" : ""}`}
            key={current.symbol}
            title={`${current.name} — ${current.opcode}`}
          >
            <span>{current.symbol}</span>
            <small>{current.opcode}</small>
          </div>
        );
      })}
    </div>
  );
}
