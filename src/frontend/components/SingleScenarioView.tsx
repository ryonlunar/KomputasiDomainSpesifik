"use client";

import { ATPChart } from "./ATPChart";
import { EnzymeStatus } from "./EnzymeStatus";
import { PathwayDiagram } from "./PathwayDiagram";
import { SummaryStats } from "./SummaryStats";
import type { SimulationResponse } from "../types/simulation";

interface Props {
  data: SimulationResponse | null;
  loading: boolean;
}

export function SingleScenarioView({ data, loading }: Props) {
  const lastIdx = data ? data.inhibition.hexokinase.length - 1 : 0;
  const hkInh = data?.inhibition.hexokinase[lastIdx] ?? 0;
  const csInh = data?.inhibition.citrate_synthase[lastIdx] ?? 0;

  return (
    <>
      <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
          Dinamika Metabolit vs Waktu
        </h2>
        <ATPChart data={data} loading={loading} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">
            Jalur Respirasi Seluler
          </h2>
          <PathwayDiagram hkInhibition={hkInh} csInhibition={csInh} />
        </section>

        <section className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 sm:p-5 space-y-5">
          <EnzymeStatus hkInhibition={hkInh} csInhibition={csInh} />
          {data && <SummaryStats summary={data.summary} />}
        </section>
      </div>
    </>
  );
}
