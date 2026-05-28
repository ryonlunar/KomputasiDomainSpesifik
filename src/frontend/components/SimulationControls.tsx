"use client";

import type { SimulationRequest } from "../types/simulation";

interface Props {
  params: SimulationRequest;
  onChange: (p: SimulationRequest) => void;
  loading: boolean;
}

const SCENARIOS = [
  { id: "normal" as const,        label: "Normal (Sel Sehat)" },
  { id: "no_regulation" as const, label: "Tanpa Regulasi (Warburg)" },
  { id: "partial" as const,       label: "Parsial (Penyakit)" },
];

const PRESET_OVERRIDES: Record<string, Partial<SimulationRequest>> = {
  normal:        { ki_atp: 2.0, ki_nadh: 0.8, hill_n: 2.0 },
  no_regulation: { ki_atp: 2.0, ki_nadh: 0.8, hill_n: 1.0 },
  partial:       { ki_atp: 4.0, ki_nadh: 1.6, hill_n: 1.5 },
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white font-mono">{value.toFixed(2)}{unit && ` ${unit}`}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

export function SimulationControls({ params, onChange, loading }: Props) {
  const set = <K extends keyof SimulationRequest>(key: K) =>
    (val: SimulationRequest[K]) => onChange({ ...params, [key]: val });

  const selectScenario = (scenario: SimulationRequest["scenario"]) =>
    onChange({ ...params, scenario, ...PRESET_OVERRIDES[scenario] });

  return (
    <div className="p-4 space-y-6">
      <Section title="Skenario">
        {SCENARIOS.map((s) => (
          <label key={s.id} className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="radio" name="scenario" value={s.id}
              checked={params.scenario === s.id}
              onChange={() => selectScenario(s.id)}
              className="accent-blue-500 w-3.5 h-3.5"
            />
            <span className="text-sm text-zinc-300 leading-tight">{s.label}</span>
          </label>
        ))}
      </Section>

      <Section title="Kondisi Awal">
        <Slider label="Glucose₀" value={params.glucose_init} min={0.5} max={20} step={0.5} unit="mM" onChange={set("glucose_init")} />
        <Slider label="ATP₀" value={params.atp_init} min={0} max={5} step={0.1} unit="mM" onChange={set("atp_init")} />
        <Slider label="Kadar O₂" value={params.o2_level} min={0} max={1} step={0.05} unit="" onChange={set("o2_level")} />
      </Section>

      <Section title="Regulasi Alosterik">
        <Slider label="Kᵢ ATP (HK)" value={params.ki_atp} min={0.1} max={10} step={0.1} unit="mM" onChange={set("ki_atp")} />
        <Slider label="Kᵢ NADH (CS)" value={params.ki_nadh} min={0.1} max={5} step={0.1} unit="mM" onChange={set("ki_nadh")} />
        <Slider label="Hill n" value={params.hill_n} min={1} max={4} step={0.1} unit="" onChange={set("hill_n")} />
      </Section>

      <Section title="Simulasi">
        <Slider label="Durasi" value={params.t_end} min={30} max={300} step={10} unit="s" onChange={set("t_end")} />
        {loading && <p className="text-xs text-blue-400 text-center animate-pulse">Simulating…</p>}
      </Section>
    </div>
  );
}
