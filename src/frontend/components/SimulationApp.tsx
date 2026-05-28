"use client";

import { useState } from "react";
import { SimulationControls } from "./SimulationControls";
import { ATPChart } from "./ATPChart";
import { PathwayDiagram } from "./PathwayDiagram";
import { EnzymeStatus } from "./EnzymeStatus";
import { ScenarioPanel } from "./ScenarioPanel";
import { useSimulation } from "../hooks/useSimulation";

type Tab = "single" | "compare";

export function SimulationApp() {
  const [tab, setTab] = useState<Tab>("single");
  const {
    data, loading, error,
    params, updateParams,
    compareResults, compareLoading, compareAll,
    reset,
  } = useSimulation();

  const lastIdx = data ? data.inhibition.hexokinase.length - 1 : 0;
  const hkInh  = data?.inhibition.hexokinase[lastIdx]       ?? 0;
  const csInh  = data?.inhibition.citrate_synthase[lastIdx] ?? 0;

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col font-sans scrollbar-overlay">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-base font-bold tracking-tight">
            SimuCell<span className="text-blue-400">-Allosteric</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Simulasi Regulasi Alosterik Enzim — Respirasi Seluler &amp; Produksi ATP
          </p>
        </div>
        <button
          onClick={reset}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Reset
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar — sticky, scrolls independently if needed */}
        <aside className="w-72 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/50 sticky top-0 self-start h-screen scrollbar-overlay">
          <SimulationControls params={params} onChange={updateParams} loading={loading} />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 space-y-5">
          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 w-fit">
            {(["single", "compare"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  tab === t ? "bg-blue-600 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                {t === "single" ? "Single Scenario" : "Compare All"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-2.5 rounded-lg text-sm">
              ⚠ {error}
            </div>
          )}

          {tab === "single" ? (
            <>
              {/* ATP chart */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                  Dinamika Metabolit vs Waktu
                </h2>
                <ATPChart data={data} loading={loading} />
              </div>

              {/* Pathway + Status */}
              <div className="grid grid-cols-2 gap-5">
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
                  <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
                    Jalur Respirasi Seluler
                  </h2>
                  <PathwayDiagram hkInhibition={hkInh} csInhibition={csInh} />
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-5">
                  <EnzymeStatus hkInhibition={hkInh} csInhibition={csInh} />

                  {data && (
                    <div className="pt-4 border-t border-zinc-800 space-y-2">
                      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                        Ringkasan
                      </h3>
                      {(
                        [
                          ["ATP Maksimum",    `${data.summary.atp_max.toFixed(2)} mM`],
                          ["ATP Steady-State", `${data.summary.atp_steady_state.toFixed(2)} mM`],
                          ["Waktu ke Puncak",  `${data.summary.time_to_peak.toFixed(1)} s`],
                          ["Glukosa Tersisa",  `${data.summary.glucose_remaining.toFixed(3)} mM`],
                        ] as [string, string][]
                      ).map(([label, value]) => (
                        <div key={label} className="flex justify-between text-xs">
                          <span className="text-zinc-500">{label}</span>
                          <span className="text-white font-mono">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <ScenarioPanel results={compareResults} loading={compareLoading} onCompare={compareAll} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
