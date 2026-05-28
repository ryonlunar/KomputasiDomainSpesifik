"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { formatComparisonSummary, SCENARIOS } from "../config/simulation";
import type { SimulationResponse, SimulationScenario } from "../types/simulation";
import { toAtpChartData } from "../utils/chartData";

interface Props {
  results: Partial<Record<SimulationScenario, SimulationResponse>>;
  loading: boolean;
  onCompare: () => void;
}

function MiniChart({ data, color }: { data: SimulationResponse; color: string }) {
  const chartData = toAtpChartData(data);

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
        <h2 className="text-sm font-semibold text-zinc-300">Perbandingan 3 Skenario - [ATP] vs Waktu</h2>
        <button
          onClick={onCompare}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs rounded-lg transition-colors font-medium cursor-pointer"
        >
          {loading ? "Simulating..." : "Run All Scenarios"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => {
          const data = results[scenario.id];
          return (
            <div
              key={scenario.id}
              className="bg-zinc-800/60 rounded-xl p-3 space-y-3 border border-zinc-700/50"
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: scenario.color }} />
                <span className="text-xs font-medium text-zinc-200 leading-tight">{scenario.label}</span>
              </div>

              <div className="h-36">
                {data ? (
                  <MiniChart data={data} color={scenario.color} />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-600">
                    {loading ? "Running..." : "No data - click Run All"}
                  </div>
                )}
              </div>

              {data && (
                <div className="space-y-1 border-t border-zinc-700 pt-2">
                  {formatComparisonSummary(data.summary).map(([k, v]) => (
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
