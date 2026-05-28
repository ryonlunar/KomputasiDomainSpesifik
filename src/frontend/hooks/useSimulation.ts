"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { DEFAULT_PARAMS, PRESET_OVERRIDES, SCENARIOS } from "../config/simulation";
import { simulate } from "../services/api";
import type { SimulationRequest, SimulationResponse, SimulationScenario } from "../types/simulation";

const DEBOUNCE_MS = 300;

export function useSimulation() {
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SimulationRequest>(DEFAULT_PARAMS);
  const [compareResults, setCompareResults] = useState<Partial<Record<SimulationScenario, SimulationResponse>>>({});
  const [compareLoading, setCompareLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRequestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);

  const runDebounced = useCallback((req: SimulationRequest) => {
    if (timer.current) clearTimeout(timer.current);
    const requestId = activeRequestId.current + 1;
    activeRequestId.current = requestId;
    activeController.current?.abort();

    timer.current = setTimeout(async () => {
      const controller = new AbortController();
      activeController.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await simulate(req, controller.signal);
        if (activeRequestId.current === requestId) {
          setData(result);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (activeRequestId.current === requestId) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (activeRequestId.current === requestId) {
          setLoading(false);
          activeController.current = null;
        }
      }
    }, DEBOUNCE_MS);
  }, []);

  const updateParams = useCallback(
    (next: SimulationRequest) => {
      setParams(next);
      runDebounced(next);
    },
    [runDebounced],
  );

  const compareAll = useCallback(async () => {
    setCompareLoading(true);
    setError(null);

    try {
      const settled = await Promise.allSettled(
        SCENARIOS.map((s) => simulate({ ...params, scenario: s.id, ...PRESET_OVERRIDES[s.id] })),
      );
      const mapped = Object.fromEntries(
        SCENARIOS.map((s, i) => [
          s.id,
          settled[i].status === "fulfilled"
            ? (settled[i] as PromiseFulfilledResult<SimulationResponse>).value
            : undefined,
        ]),
      ) as Partial<Record<SimulationScenario, SimulationResponse>>;

      setCompareResults(mapped);
      if (Object.values(mapped).every((result) => result === undefined)) {
        setError("All comparison simulations failed");
      }
    } finally {
      setCompareLoading(false);
    }
  }, [params]);

  useEffect(() => {
    runDebounced(DEFAULT_PARAMS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      activeController.current?.abort();
    };
  }, [runDebounced]);

  const reset = useCallback(() => {
    setData(null);
    setCompareResults({});
    setError(null);
    setParams(DEFAULT_PARAMS);
    runDebounced(DEFAULT_PARAMS);
  }, [runDebounced]);

  return { data, loading, error, params, updateParams, compareResults, compareLoading, compareAll, reset };
}
