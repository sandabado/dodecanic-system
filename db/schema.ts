import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
