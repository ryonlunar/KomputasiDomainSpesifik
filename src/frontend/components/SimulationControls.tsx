"use client";

import { applyScenarioPreset, SCENARIOS, SLIDER_GROUPS } from "../config/simulation";
import type { SimulationRequest } from "../types/simulation";

interface Props {
  params: SimulationRequest;
  onChange: (p: SimulationRequest) => void;
  loading: boolean;
}

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
    onChange(applyScenarioPreset(params, scenario));

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

      {SLIDER_GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          {group.sliders.map((slider) => (
            <Slider
              key={slider.key}
              label={slider.label}
              value={Number(params[slider.key])}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              unit={slider.unit}
              onChange={set(slider.key)}
            />
          ))}
          {group.title === "Simulasi" && loading && (
            <p className="text-xs text-blue-400 text-center animate-pulse">Simulating...</p>
          )}
        </Section>
      ))}
    </div>
  );
}
