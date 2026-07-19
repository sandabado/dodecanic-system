import { env } from "cloudflare:workers";
import type { CycleResult, Interaction, Signal, ValveAction } from "@/lib/types";

type CycleRow = {
  id: string;
  input_text: string;
  input_signal: string;
  state_byte: number;
  active_currents: string;
  interactions: string;
  final_valve: ValveAction;
  response: string;
  created_at: string;
};

let schemaReady: Promise<void> | undefined;

function getBinding() {
  const binding = env.DB;
  if (!binding) throw new Error("D1 binding DB is unavailable");
  return binding;
}

function ensureSchema() {
  if (!schemaReady) {
    const db = getBinding();
    schemaReady = db
      .batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS cycles (
          id TEXT PRIMARY KEY,
          input_text TEXT NOT NULL,
          input_signal TEXT NOT NULL,
          state_byte INTEGER NOT NULL,
          active_currents TEXT NOT NULL,
          interactions TEXT NOT NULL,
          final_valve TEXT NOT NULL CHECK (final_valve IN ('OPEN', 'MONITOR', 'CLOSE')),
          response TEXT NOT NULL,
          created_at TEXT NOT NULL
        )`),
        db.prepare("CREATE INDEX IF NOT EXISTS cycles_created_at_idx ON cycles (created_at DESC)"),
      ])
      .then(() => undefined)
      .catch((error: unknown) => {
        schemaReady = undefined;
        throw error;
      });
  }
  return schemaReady;
}

function fromRow(row: CycleRow): CycleResult {
  return {
    id: row.id,
    inputText: row.input_text,
    inputSignal: JSON.parse(row.input_signal) as Signal,
    stateByte: row.state_byte,
    activeCurrents: JSON.parse(row.active_currents) as string[],
    interactions: JSON.parse(row.interactions) as Interaction[],
    finalValve: row.final_valve,
    response: row.response,
    createdAt: row.created_at,
    persisted: true,
  };
}

export async function saveCycle(cycle: CycleResult): Promise<CycleResult> {
  await ensureSchema();
  const db = getBinding();
  const id = crypto.randomUUID();
  await db
    .prepare(`INSERT INTO cycles (
      id, input_text, input_signal, state_byte, active_currents,
      interactions, final_valve, response, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      id,
      cycle.inputText,
      JSON.stringify(cycle.inputSignal),
      cycle.stateByte,
      JSON.stringify(cycle.activeCurrents),
      JSON.stringify(cycle.interactions),
      cycle.finalValve,
      cycle.response,
      cycle.createdAt,
    )
    .run();

  return { ...cycle, id, persisted: true };
}

export async function listCycles(limit = 12): Promise<CycleResult[]> {
  await ensureSchema();
  const result = await getBinding()
    .prepare("SELECT * FROM cycles ORDER BY created_at DESC LIMIT ?")
    .bind(Math.min(Math.max(limit, 1), 50))
    .all<CycleRow>();
  return result.results.map(fromRow);
}
