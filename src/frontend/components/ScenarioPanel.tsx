"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { SimulationResponse } from "../types/simulation";

type Scenario = "normal" | "no_regulation" | "partial";

interface Props {
  results: Partial<Record<Scenario, SimulationResponse>>;
  loading: boolean;
  onCompare: () => void;
}

const META: Record<Scenario, { label: string; color: string }> = {
  normal:        { label: "Normal (Sel Sehat)",       color: "#3b82f6" },
  no_regulation: { label: "Tanpa Regulasi (Warburg)", color: "#ef4444" },
  partial:       { label: "Parsial (Penyakit)",        color: "#f97316" },
};

const SCENARIOS: Scenario[] = ["normal", "no_regulation", "partial"];

function MiniChart({ data, color }: { data: SimulationResponse; color: string }) {
  const step = Math.ceil(data.t.length / 80);
  const chartData = data.t
    .filter((_, i) => i % step === 0)
    .map((t, i) => ({
      t: parseFloat(t.toFixed(1)),
      ATP: parseFloat((data.atp[i * step] ?? 0).toFixed(3)),
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 16, left: 0 }}>
        <CartesianGrid strokeDasharray="2 2" stroke="#27272a" />
        <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#71717a" }} />
        <YAxis tick={{ fontSize: 8, fill: "#71717a" }} width={28} />
        <Tooltip
          contentStyle={{ backgroundColor: "#18181b", border: "none", fontSize: 10 }}
          labelStyle={{ color: "#a1a1aa" }}
        />
        <Line type="monotone" dataKey="ATP" stroke={color} dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ScenarioPanel({ results, loading, onCompare }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">Perbandingan 3 Skenario — [ATP] vs Waktu</h2>
        <button
          onClick={onCompare}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs rounded-lg transition-colors font-medium cursor-pointer"
        >
          {loading ? "Simulating…" : "Run All Scenarios"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => {
          const { label, color } = META[scenario];
          const data = results[scenario];
          return (
            <div
              key={scenario}
              className="bg-zinc-800/60 rounded-xl p-3 space-y-3 border border-zinc-700/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-zinc-200 leading-tight">{label}</span>
              </div>

              <div className="h-36">
                {data ? (
                  <MiniChart data={data} color={color} />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                    {loading ? "Running…" : "No data — click Run All"}
                  </div>
                )}
              </div>

              {data && (
                <div className="space-y-1 border-t border-zinc-700 pt-2">
                  {(
                    [
                      ["ATP max",     `${data.summary.atp_max.toFixed(2)} mM`],
                      ["Puncak pada", `${data.summary.time_to_peak.toFixed(1)} s`],
                      ["ATP akhir",   `${data.summary.atp_steady_state.toFixed(2)} mM`],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-zinc-500">{k}</span>
                      <span className="text-white font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
