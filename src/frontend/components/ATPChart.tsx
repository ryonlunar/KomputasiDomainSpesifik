"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { SimulationResponse } from "../types/simulation";
import { toMetaboliteChartData } from "../utils/chartData";

interface Props {
  data: SimulationResponse | null;
  loading: boolean;
}

export function ATPChart({ data, loading }: Props) {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
        {loading ? "Running simulation..." : "Adjust a slider to start simulation"}
      </div>
    );
  }

  const chartData = toMetaboliteChartData(data);

  return (
    <div className="relative h-64">
      {loading && (
        <div className="absolute inset-0 bg-zinc-900/70 flex items-center justify-center z-10 rounded">
          <span className="text-blue-400 text-sm animate-pulse">Updating...</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="t"
            stroke="#52525b"
            tick={{ fontSize: 10, fill: "#a1a1aa" }}
            label={{ value: "Waktu (s)", position: "insideBottom", offset: -12, fill: "#71717a", fontSize: 11 }}
          />
          <YAxis
            stroke="#52525b"
            tick={{ fontSize: 10, fill: "#a1a1aa" }}
            label={{ value: "mM", angle: -90, position: "insideLeft", offset: 10, fill: "#71717a", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#a1a1aa" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
          <Line type="monotone" dataKey="ATP"     stroke="#3b82f6" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="NADH"    stroke="#f59e0b" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="Glucose" stroke="#10b981" strokeWidth={1.5} dot={false} />
          <Line type="monotone" dataKey="AcCoA"   stroke="#f97316" strokeWidth={1}   dot={false} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
