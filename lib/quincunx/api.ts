import type { CornerReadings, Position9State, QuincunxState } from "./engine";
import type { HouseNumber } from "@/types/houses";

export interface SubmitReadingRequest {
  houseNumber: HouseNumber;
  hrvReadings: CornerReadings;
  stressLevels: CornerReadings;
  position9: Position9State;
}

export interface StoredReadingResponse {
  id: string;
  houseNumber: HouseNumber;
  hrvReadings: CornerReadings;
  stressLevels: CornerReadings;
  state: QuincunxState;
  persisted: boolean;
}

export async function submitQuincunxReading(
  request: SubmitReadingRequest,
): Promise<StoredReadingResponse> {
  const response = await fetch("/api/quincunx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data = (await response.json()) as { reading?: StoredReadingResponse; error?: string };
  if (!response.ok || !data.reading) {
    throw new Error(data.error ?? "Unable to save Quincunx reading");
  }
  return data.reading;
}

export async function getRecentReadings(limit = 10): Promise<StoredReadingResponse[]> {
  const response = await fetch(`/api/quincunx?limit=${Math.min(Math.max(limit, 1), 50)}`, {
    cache: "no-store",
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { readings?: StoredReadingResponse[] };
  return data.readings ?? [];
}
