"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createObserverSnapshot,
  type CommunityTelemetry,
  type ObserverSnapshot,
  type ObserverTelemetryPayload,
} from "@/lib/observer-telemetry";
import type { CycleResult } from "@/lib/types";

const EMPTY_COMMUNITY: CommunityTelemetry = {
  observedCycles: 0,
  averageCoherence: 0,
  openCycles: 0,
  monitorCycles: 0,
  closedCycles: 0,
  latestAt: null,
};

export function useObserverTelemetry(liveResult: CycleResult) {
  const live = useMemo(() => createObserverSnapshot(liveResult), [liveResult]);
  const [history, setHistory] = useState<ObserverSnapshot[]>([]);
  const [community, setCommunity] = useState<CommunityTelemetry>(EMPTY_COMMUNITY);
  const [connection, setConnection] = useState<"connecting" | "live" | "local">("connecting");

  const refetch = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/observer/telemetry?limit=50", {
        cache: "no-store",
        signal,
      });
      if (!response.ok) throw new Error("Telemetry unavailable");
      const payload = (await response.json()) as ObserverTelemetryPayload;
      setHistory(payload.history);
      setCommunity(payload.community);
      setConnection(payload.persisted ? "live" : "local");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setConnection("local");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const initialRefresh = window.setTimeout(() => void refetch(controller.signal), 0);
    const timer = window.setInterval(() => void refetch(), 12_000);
    return () => {
      controller.abort();
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
    };
  }, [refetch]);

  return { live, history, community, connection, refetch };
}
