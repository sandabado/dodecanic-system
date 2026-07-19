import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const cycles = sqliteTable(
  "cycles",
  {
    id: text("id").primaryKey(),
    inputText: text("input_text").notNull(),
    inputSignal: text("input_signal").notNull(),
    stateByte: integer("state_byte").notNull(),
    activeCurrents: text("active_currents").notNull(),
    interactions: text("interactions").notNull(),
    finalValve: text("final_valve").notNull(),
    response: text("response").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("cycles_created_at_idx").on(table.createdAt)],
);

export const houseStates = sqliteTable("house_states", {
  houseId: integer("house_id").primaryKey(),
  houseName: text("house_name").notNull(),
  valveStatus: text("valve_status").notNull().default("OPEN"),
  quincunxAlignment: text("quincunx_alignment").notNull(),
  coherenceScore: real("coherence_score").notNull().default(0),
  lastCompromised: text("last_compromised"),
  breachCount: integer("breach_count").notNull().default(0),
  updatedAt: text("updated_at").notNull(),
});

export const quincunxReadings = sqliteTable(
  "quincunx_readings",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id").notNull().default("local"),
    timestamp: text("timestamp").notNull(),
    hrvPhysical: integer("hrv_physical").notNull(),
    hrvMental: integer("hrv_mental").notNull(),
    hrvEmotional: integer("hrv_emotional").notNull(),
    hrvSpiritual: integer("hrv_spiritual").notNull(),
    stressPhysical: integer("stress_physical").notNull(),
    stressMental: integer("stress_mental").notNull(),
    stressEmotional: integer("stress_emotional").notNull(),
    stressSpiritual: integer("stress_spiritual").notNull(),
    coherencePhysical: real("coherence_physical").notNull(),
    coherenceMental: real("coherence_mental").notNull(),
    coherenceEmotional: real("coherence_emotional").notNull(),
    coherenceSpiritual: real("coherence_spiritual").notNull(),
    overallCoherence: real("overall_coherence").notNull(),
    valveStatus: text("valve_status").notNull(),
    position9Active: integer("position9_active", { mode: "boolean" }).notNull().default(true),
    position9Bias: text("position9_bias"),
    houseId: integer("house_id").notNull().references(() => houseStates.houseId),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("quincunx_readings_session_time_idx").on(table.sessionId, table.timestamp),
    index("quincunx_readings_coherence_idx").on(table.overallCoherence),
  ],
);

export const decisionLogs = sqliteTable("decision_logs", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().default("local"),
  houseId: integer("house_id").notNull().references(() => houseStates.houseId),
  timestamp: text("timestamp").notNull(),
  masterRole: text("master_role"),
  mirrorRole: text("mirror_role"),
  rootRole: text("root_role"),
  position9Witness: text("position9_witness"),
  intentStatement: text("intent_statement").notNull(),
  challengesRaised: text("challenges_raised").notNull().default("[]"),
  finalDecision: text("final_decision").notNull(),
  decisionOutcome: text("decision_outcome").notNull(),
  preDecisionCoherence: real("pre_decision_coherence"),
  postDecisionCoherence: real("post_decision_coherence"),
  createdAt: text("created_at").notNull(),
});

export const currentInteractions = sqliteTable(
  "current_interactions",
  {
    id: text("id").primaryKey(),
    timestamp: text("timestamp").notNull(),
    houseA: integer("house_a").notNull(),
    houseB: integer("house_b").notNull(),
    edgeProtocol: text("edge_protocol").notNull(),
    currentA: text("current_a").notNull(),
    currentB: text("current_b").notNull(),
    interactionType: text("interaction_type").notNull(),
    valveAction: text("valve_action"),
    observerNote: text("observer_note"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("current_interactions_edge_idx").on(table.houseA, table.houseB)],
);

export const edgeStates = sqliteTable(
  "edge_states",
  {
    id: text("id").primaryKey(),
    houseA: integer("house_a").notNull().references(() => houseStates.houseId),
    houseB: integer("house_b").notNull().references(() => houseStates.houseId),
    currentType: text("current_type"),
    valveStatus: text("valve_status").notNull().default("OPEN"),
    lastIncident: text("last_incident"),
    incidentCount: integer("incident_count").notNull().default(0),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("edge_states_houses_idx").on(table.houseA, table.houseB)],
);

export const signalPatterns = sqliteTable("signal_patterns", {
  id: text("id").primaryKey(),
  textPattern: text("text_pattern").notNull(),
  expectedCurrents: text("expected_currents").notNull().default("[]"),
  confidenceScore: real("confidence_score"),
  breachCount: integer("breach_count").notNull().default(0),
  lastSeen: text("last_seen"),
  createdAt: text("created_at").notNull(),
});

export const immuneAlerts = sqliteTable(
  "immune_alerts",
  {
    id: text("id").primaryKey(),
    compromisedHouse: integer("compromised_house").notNull().references(() => houseStates.houseId),
    severity: text("severity").notNull(),
    safeHouses: text("safe_houses").notNull().default("[]"),
    monitoringHouses: text("monitoring_houses").notNull().default("[]"),
    acknowledged: integer("acknowledged", { mode: "boolean" }).notNull().default(false),
    acknowledgedBy: text("acknowledged_by"),
    acknowledgedAt: text("acknowledged_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("immune_alerts_severity_idx").on(table.severity, table.acknowledged)],
);
