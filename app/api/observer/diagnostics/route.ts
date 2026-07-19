import { runObserverDiagnostics } from "@/lib/observer-diagnostics";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

export async function GET() {
  const results = runObserverDiagnostics();
  const passed = results.filter((result) => result.passed).length;
  return Response.json({
    status: passed === results.length ? "pass" : "fail",
    model: "dodecanic-observer-v1",
    topology: { faces: 12, edges: 30, fieldObserver: "Ø", bodyObserver: "Position 9", pillars: 5 },
    passed,
    total: results.length,
    checkedAt: new Date().toISOString(),
    results,
  }, { headers });
}
