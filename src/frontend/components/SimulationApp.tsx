"use client";

import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { CompareScenarioView } from "./CompareScenarioView";
import { SimulationControls } from "./SimulationControls";
import { SingleScenarioView } from "./SingleScenarioView";
import { TabSwitcher, type SimulationTab } from "./TabSwitcher";
import { useSimulation } from "../hooks/useSimulation";

export function SimulationApp() {
  const [tab, setTab] = useState<SimulationTab>("single");
  const {
    data, loading, error,
    params, updateParams,
    compareResults, compareLoading, compareAll,
    reset,
  } = useSimulation();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col font-sans scrollbar-overlay">
      <AppHeader onReset={reset} />

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <aside className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-800 bg-zinc-900/50 lg:sticky lg:top-0 lg:self-start lg:h-screen scrollbar-overlay">
          <SimulationControls params={params} onChange={updateParams} loading={loading} />
        </aside>

        <main className="flex-1 p-4 sm:p-6 space-y-5 min-w-0">
          <TabSwitcher activeTab={tab} onChange={setTab} />

          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          {tab === "single" ? (
            <SingleScenarioView data={data} loading={loading} />
          ) : (
            <CompareScenarioView results={compareResults} loading={compareLoading} onCompare={compareAll} />
          )}
        </main>
      </div>
    </div>
  );
}
