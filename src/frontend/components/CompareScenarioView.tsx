"use client";

import { ScenarioPanel } from "./ScenarioPanel";
import type { SimulationResponse, SimulationScenario } from "../types/simulation";

interface Props {
  results: Partial<Record<SimulationScenario, SimulationResponse>>;
  loading: boolean;
  onCompare: () => void;
}

export function CompareScenarioView({ results, loading, onCompare }: Props) {
  return (
    <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-5">
      <ScenarioPanel results={results} loading={loading} onCompare={onCompare} />
    </section>
  );
}
