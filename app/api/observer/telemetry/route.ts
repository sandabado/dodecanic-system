import { getObserverMemorySummary, listCycles } from "@/db/cycles";
import {
  createObserverSnapshot,
  summarizeObserverHistory,
  type ObserverTelemetryPayload,
} from "@/lib/observer-telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const limitParam = new URL(request.url).searchParams.get("limit");
  const requestedLimit = Number(limitParam ?? 24);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 50)
    : 24;

  try {
    const cycles = await listCycles(limit);
    const payload: ObserverTelemetryPayload = {
      history: cycles.map((cycle) => createObserverSnapshot(cycle, "memory")),
      community: summarizeObserverHistory(cycles),
      memory: await getObserverMemorySummary(cycles.length),
      persisted: false,
    };
    return Response.json(payload, { headers });
  } catch {
    const payload: ObserverTelemetryPayload = {
      history: [],
      community: summarizeObserverHistory([]),
      memory: {
        shortTermCapacity: 50,
        shortTermSamples: 0,
        longTermPatterns: 0,
        reinforcedPatterns: 0,
        fadedPatterns: 0,
        topPatterns: [],
      },
      persisted: false,
    };
    return Response.json(payload, { headers });
  }
}
