import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "./schema";

/**
 * The application routes use the runtime-neutral repositories in this folder.
 * This legacy accessor remains typed for the isolated D1 example, but cannot be
 * called from the Vercel application without an explicitly supplied adapter.
 */
export function getDb(): DrizzleD1Database<typeof schema> {
  throw new Error(
    "No SQL adapter is configured. Use the runtime-neutral cycle and quincunx repositories instead.",
  );
}
