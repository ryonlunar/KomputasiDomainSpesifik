"use client";

import { formatSingleSummary } from "../config/simulation";
import type { SimulationSummary } from "../types/simulation";

interface Props {
  summary: SimulationSummary;
}

export function SummaryStats({ summary }: Props) {
  return (
    <div className="pt-4 border-t border-zinc-800 space-y-2">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
        Ringkasan
      </h3>
      {formatSingleSummary(summary).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-3 text-xs">
          <span className="text-zinc-500">{label}</span>
          <span className="text-white font-mono text-right">{value}</span>
        </div>
      ))}
    </div>
  );
}
