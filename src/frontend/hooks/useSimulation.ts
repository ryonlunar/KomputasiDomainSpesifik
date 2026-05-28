"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { simulate } from "../services/api";
import type { SimulationRequest, SimulationResponse } from "../types/simulation";

const DEBOUNCE_MS = 300;

export const DEFAULT_PARAMS: SimulationRequest = {
  glucose_init: 5.0,
  atp_init: 1.0,
  o2_level: 1.0,
  ki_atp: 2.0,
  ki_nadh: 0.8,
  hill_n: 2.0,
  scenario: "normal",
  t_end: 120,
};

const PRESET_OVERRIDES: Record<string, Partial<SimulationRequest>> = {
  normal:        { ki_atp: 2.0, ki_nadh: 0.8, hill_n: 2.0 },
  no_regulation: { ki_atp: 2.0, ki_nadh: 0.8, hill_n: 1.0 },
  partial:       { ki_atp: 4.0, ki_nadh: 1.6, hill_n: 1.5 },
};

type Scenario = "normal" | "no_regulation" | "partial";

export function useSimulation() {
  const [data, setData] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SimulationRequest>(DEFAULT_PARAMS);
  const [compareResults, setCompareResults] = useState<Partial<Record<Scenario, SimulationResponse>>>({});
  const [compareLoading, setCompareLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const _runDebounced = useCallback((req: SimulationRequest) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setData(await simulate(req));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const updateParams = useCallback(
    (next: SimulationRequest) => {
      setParams(next);
      _runDebounced(next);
    },
    [_runDebounced],
  );

  const compareAll = useCallback(async () => {
    setCompareLoading(true);
    const scenarios: Scenario[] = ["normal", "no_regulation", "partial"];
    const settled = await Promise.allSettled(
      scenarios.map((s) => simulate({ ...params, scenario: s, ...PRESET_OVERRIDES[s] })),
    );
    const mapped = Object.fromEntries(
      scenarios.map((s, i) => [
        s,
        settled[i].status === "fulfilled" ? (settled[i] as PromiseFulfilledResult<SimulationResponse>).value : undefined,
      ]),
    ) as Partial<Record<Scenario, SimulationResponse>>;
    setCompareResults(mapped);
    setCompareLoading(false);
  }, [params]);

  useEffect(() => { _runDebounced(DEFAULT_PARAMS); }, [_runDebounced]);

  const reset = useCallback(() => {
    setData(null);
    setCompareResults({});
    setError(null);
    setParams(DEFAULT_PARAMS);
    _runDebounced(DEFAULT_PARAMS);
  }, [_runDebounced]);

  return { data, loading, error, params, updateParams, compareResults, compareLoading, compareAll, reset };
}
