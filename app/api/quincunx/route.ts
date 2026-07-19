import { listQuincunxReadings, saveQuincunxReading } from "@/db/quincunx";
import { calculateQuincunxState, type Corner, type CornerReadings, type Position9State } from "@/lib/quincunx/engine";
import type { HouseNumber } from "@/types/houses";

const RESPONSE_HEADERS = { "Cache-Control": "no-store" };
const CORNERS: Corner[] = ["physical", "mental", "emotional", "spiritual"];

function validReadings(value: unknown, maximum: number): value is CornerReadings {
  if (!value || typeof value !== "object") return false;
  return CORNERS.every((corner) => {
    const reading = (value as Record<string, unknown>)[corner];
    return typeof reading === "number" && Number.isFinite(reading) && reading >= 0 && reading <= maximum;
  });
}

function validPosition9(value: unknown): value is Position9State {
  if (!value || typeof value !== "object") return false;
  const position9 = value as Record<string, unknown>;
  return typeof position9.active === "boolean" &&
    (position9.bias === null || CORNERS.includes(position9.bias as Corner));
}

export async function GET(request: Request) {
  try {
    const limit = Number(new URL(request.url).searchParams.get("limit") ?? 10);
    const readings = await listQuincunxReadings(Number.isFinite(limit) ? limit : 10);
    return Response.json({ readings: readings.map((reading) => ({ ...reading, persisted: true })) }, { headers: RESPONSE_HEADERS });
  } catch {
    return Response.json({ readings: [], persisted: false }, { headers: RESPONSE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const houseNumber = Number(body.houseNumber);
    if (!Number.isInteger(houseNumber) || houseNumber < 1 || houseNumber > 12) {
      return Response.json({ error: "House number must be between 1 and 12." }, { status: 400, headers: RESPONSE_HEADERS });
    }
    if (!validReadings(body.hrvReadings, 250) || !validReadings(body.stressLevels, 10)) {
      return Response.json({ error: "Readings are outside the accepted range." }, { status: 400, headers: RESPONSE_HEADERS });
    }
    if (!validPosition9(body.position9)) {
      return Response.json({ error: "Position 9 state is invalid." }, { status: 400, headers: RESPONSE_HEADERS });
    }

    const position9: Position9State = {
      active: body.position9.active,
      bias: body.position9.bias,
      valve: "closed",
      lastActivation: new Date().toISOString(),
    };
    const state = calculateQuincunxState(body.hrvReadings, body.stressLevels, position9);
    try {
      const reading = await saveQuincunxReading(
        houseNumber as HouseNumber,
        body.hrvReadings,
        body.stressLevels,
        state,
      );
      return Response.json({ reading: { ...reading, persisted: true } }, { status: 201, headers: RESPONSE_HEADERS });
    } catch {
      return Response.json({
        reading: {
          id: crypto.randomUUID(),
          houseNumber,
          hrvReadings: body.hrvReadings,
          stressLevels: body.stressLevels,
          state,
          persisted: false,
        },
      }, { headers: RESPONSE_HEADERS });
    }
  } catch {
    return Response.json({ error: "The Quincunx reading could not be processed." }, { status: 400, headers: RESPONSE_HEADERS });
  }
}
