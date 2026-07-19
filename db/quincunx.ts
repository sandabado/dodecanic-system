import type { CornerReadings, QuincunxState } from "@/lib/quincunx/engine";
import type { HouseNumber } from "@/types/houses";

export interface StoredQuincunxReading {
  id: string;
  houseNumber: HouseNumber;
  hrvReadings: CornerReadings;
  stressLevels: CornerReadings;
  state: QuincunxState;
}

interface QuincunxStore {
  readings: StoredQuincunxReading[];
}

const MAX_READINGS = 50;

function getStore(): QuincunxStore {
  const serverGlobal = globalThis as typeof globalThis & {
    __dodecanicQuincunxStore?: QuincunxStore;
  };

  if (!serverGlobal.__dodecanicQuincunxStore) {
    serverGlobal.__dodecanicQuincunxStore = { readings: [] };
  }

  return serverGlobal.__dodecanicQuincunxStore;
}

function cloneReading(reading: StoredQuincunxReading): StoredQuincunxReading {
  return structuredClone(reading);
}

/**
 * Keeps recent readings available to local development and warm Vercel
 * functions. Long-term storage can be attached later without a D1 runtime
 * dependency leaking into these route handlers.
 */
export async function saveQuincunxReading(
  houseNumber: HouseNumber,
  hrvReadings: CornerReadings,
  stressLevels: CornerReadings,
  state: QuincunxState,
): Promise<StoredQuincunxReading> {
  const reading: StoredQuincunxReading = {
    id: crypto.randomUUID(),
    houseNumber,
    hrvReadings: structuredClone(hrvReadings),
    stressLevels: structuredClone(stressLevels),
    state: structuredClone(state),
  };
  const store = getStore();
  store.readings.unshift(reading);
  if (store.readings.length > MAX_READINGS) store.readings.length = MAX_READINGS;
  return cloneReading(reading);
}

export async function listQuincunxReadings(limit = 10): Promise<StoredQuincunxReading[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), MAX_READINGS);
  return getStore().readings.slice(0, safeLimit).map(cloneReading);
}
