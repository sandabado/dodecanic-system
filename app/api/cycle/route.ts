import { listCycles, saveCycle } from "@/db/cycles";
import { runDodecanicCycle } from "@/lib/dodecanic-observer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

export async function GET() {
  try {
    const history = await listCycles();
    return Response.json({ history, persisted: true }, { headers });
  } catch {
    return Response.json({ history: [], persisted: false }, { headers });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { text?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return Response.json({ error: "Enter a signal to begin." }, { status: 400, headers });
    }
    if (text.length > 4000) {
      return Response.json({ error: "Signals are limited to 4,000 characters." }, { status: 413, headers });
    }

    const cycle = runDodecanicCycle(text);
    try {
      const stored = await saveCycle(cycle);
      return Response.json({ cycle: stored }, { status: 201, headers });
    } catch {
      return Response.json({ cycle: { ...cycle, persisted: false } }, { status: 200, headers });
    }
  } catch {
    return Response.json({ error: "The signal could not be read." }, { status: 400, headers });
  }
}
