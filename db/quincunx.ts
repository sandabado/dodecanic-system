import { env } from "cloudflare:workers";
import type { Corner, CornerReadings, Position9State, QuincunxState, ValveState } from "@/lib/quincunx/engine";
import { HOUSE_DEFINITIONS, type HouseNumber } from "@/types/houses";

export interface StoredQuincunxReading {
  id: string;
  houseNumber: HouseNumber;
  hrvReadings: CornerReadings;
  stressLevels: CornerReadings;
  state: QuincunxState;
}

interface QuincunxRow {
  id: string;
  house_id: number;
  timestamp: string;
  hrv_physical: number;
  hrv_mental: number;
  hrv_emotional: number;
  hrv_spiritual: number;
  stress_physical: number;
  stress_mental: number;
  stress_emotional: number;
  stress_spiritual: number;
  coherence_physical: number;
  coherence_mental: number;
  coherence_emotional: number;
  coherence_spiritual: number;
  overall_coherence: number;
  valve_status: ValveState;
  position9_active: number;
  position9_bias: Corner | null;
}

let schemaReady: Promise<void> | undefined;

function getBinding(): D1Database {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function initialHouseStatements(db: D1Database, timestamp: string): D1PreparedStatement[] {
  return Object.values(HOUSE_DEFINITIONS).map((house) =>
    db
      .prepare(`INSERT OR IGNORE INTO house_states (
        house_id, house_name, valve_status, quincunx_alignment,
        coherence_score, breach_count, updated_at
      ) VALUES (?, ?, 'OPEN', ?, 0, 0, ?)`)
      .bind(house.number, house.name, house.quincunxPrimary, timestamp),
  );
}

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const db = getBinding();
    const now = new Date().toISOString();
    schemaReady = db
      .batch([
        db.prepare(`CREATE TABLE IF NOT EXISTS house_states (
          house_id INTEGER PRIMARY KEY CHECK (house_id BETWEEN 1 AND 12),
          house_name TEXT NOT NULL,
          valve_status TEXT NOT NULL DEFAULT 'OPEN' CHECK (valve_status IN ('OPEN', 'MONITOR', 'CLOSED')),
          quincunx_alignment TEXT NOT NULL,
          coherence_score REAL NOT NULL DEFAULT 0,
          last_compromised TEXT,
          breach_count INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        )`),
        db.prepare(`CREATE TABLE IF NOT EXISTS quincunx_readings (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL DEFAULT 'local',
          timestamp TEXT NOT NULL,
          hrv_physical INTEGER NOT NULL,
          hrv_mental INTEGER NOT NULL,
          hrv_emotional INTEGER NOT NULL,
          hrv_spiritual INTEGER NOT NULL,
          stress_physical INTEGER NOT NULL CHECK (stress_physical BETWEEN 0 AND 10),
          stress_mental INTEGER NOT NULL CHECK (stress_mental BETWEEN 0 AND 10),
          stress_emotional INTEGER NOT NULL CHECK (stress_emotional BETWEEN 0 AND 10),
          stress_spiritual INTEGER NOT NULL CHECK (stress_spiritual BETWEEN 0 AND 10),
          coherence_physical REAL NOT NULL,
          coherence_mental REAL NOT NULL,
          coherence_emotional REAL NOT NULL,
          coherence_spiritual REAL NOT NULL,
          overall_coherence REAL NOT NULL,
          valve_status TEXT NOT NULL CHECK (valve_status IN ('open', 'monitor', 'closed')),
          position9_active INTEGER NOT NULL DEFAULT 1,
          position9_bias TEXT,
          house_id INTEGER NOT NULL REFERENCES house_states(house_id),
          created_at TEXT NOT NULL
        )`),
        db.prepare("CREATE INDEX IF NOT EXISTS quincunx_readings_session_time_idx ON quincunx_readings (session_id, timestamp DESC)"),
        db.prepare("CREATE INDEX IF NOT EXISTS quincunx_readings_coherence_idx ON quincunx_readings (overall_coherence DESC)"),
        ...initialHouseStatements(db, now),
      ])
      .then(() => undefined)
      .catch((error: unknown) => {
        schemaReady = undefined;
        throw error;
      });
  }
  return schemaReady;
}

function readingsFromRow(row: QuincunxRow): StoredQuincunxReading {
  const hrvReadings: CornerReadings = {
    physical: row.hrv_physical,
    mental: row.hrv_mental,
    emotional: row.hrv_emotional,
    spiritual: row.hrv_spiritual,
  };
  const stressLevels: CornerReadings = {
    physical: row.stress_physical,
    mental: row.stress_mental,
    emotional: row.stress_emotional,
    spiritual: row.stress_spiritual,
  };
  const currentByCorner = { physical: "V", mental: "∧", emotional: "W", spiritual: "∞" } as const;
  const coherenceByCorner = {
    physical: row.coherence_physical,
    mental: row.coherence_mental,
    emotional: row.coherence_emotional,
    spiritual: row.coherence_spiritual,
  };
  const statusFor = (score: number) => score >= 0.7 ? "ok" as const : score >= 0.4 ? "warning" as const : "critical" as const;
  const position9: Position9State = {
    active: Boolean(row.position9_active),
    valve: row.valve_status,
    lastActivation: row.timestamp,
    bias: row.position9_bias,
  };

  return {
    id: row.id,
    houseNumber: row.house_id as HouseNumber,
    hrvReadings,
    stressLevels,
    state: {
      corners: {
        physical: { coherence: coherenceByCorner.physical, current: currentByCorner.physical, status: statusFor(coherenceByCorner.physical) },
        mental: { coherence: coherenceByCorner.mental, current: currentByCorner.mental, status: statusFor(coherenceByCorner.mental) },
        emotional: { coherence: coherenceByCorner.emotional, current: currentByCorner.emotional, status: statusFor(coherenceByCorner.emotional) },
        spiritual: { coherence: coherenceByCorner.spiritual, current: currentByCorner.spiritual, status: statusFor(coherenceByCorner.spiritual) },
      },
      position9,
      overallCoherence: row.overall_coherence,
      timestamp: row.timestamp,
    },
  };
}

export async function saveQuincunxReading(
  houseNumber: HouseNumber,
  hrvReadings: CornerReadings,
  stressLevels: CornerReadings,
  state: QuincunxState,
): Promise<StoredQuincunxReading> {
  await ensureSchema();
  const id = crypto.randomUUID();
  const db = getBinding();
  await db.batch([
    db.prepare(`INSERT INTO quincunx_readings (
      id, session_id, timestamp, hrv_physical, hrv_mental, hrv_emotional, hrv_spiritual,
      stress_physical, stress_mental, stress_emotional, stress_spiritual,
      coherence_physical, coherence_mental, coherence_emotional, coherence_spiritual,
      overall_coherence, valve_status, position9_active, position9_bias, house_id, created_at
    ) VALUES (?, 'local', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(
        id, state.timestamp,
        hrvReadings.physical, hrvReadings.mental, hrvReadings.emotional, hrvReadings.spiritual,
        stressLevels.physical, stressLevels.mental, stressLevels.emotional, stressLevels.spiritual,
        state.corners.physical.coherence, state.corners.mental.coherence,
        state.corners.emotional.coherence, state.corners.spiritual.coherence,
        state.overallCoherence, state.position9.valve, state.position9.active ? 1 : 0,
        state.position9.bias, houseNumber, state.timestamp,
      ),
    db.prepare(`UPDATE house_states SET coherence_score = ?, valve_status = ?,
      last_compromised = CASE WHEN ? = 'closed' THEN ? ELSE last_compromised END,
      breach_count = breach_count + CASE WHEN ? = 'closed' THEN 1 ELSE 0 END,
      updated_at = ? WHERE house_id = ?`)
      .bind(
        state.overallCoherence,
        state.position9.valve.toUpperCase() === "CLOSED" ? "CLOSED" : state.position9.valve.toUpperCase(),
        state.position9.valve, state.timestamp, state.position9.valve, state.timestamp, houseNumber,
      ),
  ]);
  return { id, houseNumber, hrvReadings, stressLevels, state };
}

export async function listQuincunxReadings(limit = 10): Promise<StoredQuincunxReading[]> {
  await ensureSchema();
  const result = await getBinding()
    .prepare("SELECT * FROM quincunx_readings ORDER BY timestamp DESC LIMIT ?")
    .bind(Math.min(Math.max(limit, 1), 50))
    .all<QuincunxRow>();
  return result.results.map(readingsFromRow);
}
