import type { SimulationRequest, SimulationScenario, SimulationSummary } from "../types/simulation";

type NumericSimulationKey = Exclude<keyof SimulationRequest, "scenario">;

export const DEFAULT_PARAMS: SimulationRequest = {
  glucose_init: 5.0,
  atp_init: 1.0,
  o2_level: 1.0,
  ki_atp: 2.0,
  ki_nadh: 0.8,
  hill_n: 2.0,
  scenario: "normal",
  t_end: 120,
};

export const SCENARIOS: Array<{
  id: SimulationScenario;
  label: string;
  color: string;
}> = [
  { id: "normal", label: "Normal (Sel Sehat)", color: "#3b82f6" },
  { id: "no_regulation", label: "Tanpa Regulasi (Warburg)", color: "#ef4444" },
  { id: "partial", label: "Parsial (Penyakit)", color: "#f97316" },
];

export const PRESET_OVERRIDES: Record<SimulationScenario, Partial<SimulationRequest>> = {
  normal: { ki_atp: 2.0, ki_nadh: 0.8, hill_n: 2.0 },
  no_regulation: { ki_atp: 2.0, ki_nadh: 0.8, hill_n: 1.0 },
  partial: { ki_atp: 4.0, ki_nadh: 1.6, hill_n: 1.5 },
};

export const SLIDER_GROUPS: Array<{
  title: string;
  sliders: Array<{
    key: NumericSimulationKey;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }>;
}> = [
  {
    title: "Kondisi Awal",
    sliders: [
      { key: "glucose_init", label: "Glucose0", min: 0.5, max: 20, step: 0.5, unit: "mM" },
      { key: "atp_init", label: "ATP0", min: 0, max: 5, step: 0.1, unit: "mM" },
      { key: "o2_level", label: "Kadar O2", min: 0, max: 1, step: 0.05, unit: "" },
    ],
  },
  {
    title: "Regulasi Alosterik",
    sliders: [
      { key: "ki_atp", label: "Ki ATP (HK)", min: 0.1, max: 10, step: 0.1, unit: "mM" },
      { key: "ki_nadh", label: "Ki NADH (CS)", min: 0.1, max: 5, step: 0.1, unit: "mM" },
      { key: "hill_n", label: "Hill n", min: 1, max: 4, step: 0.1, unit: "" },
    ],
  },
  {
    title: "Simulasi",
    sliders: [
      { key: "t_end", label: "Durasi", min: 30, max: 300, step: 10, unit: "s" },
    ],
  },
];

export function applyScenarioPreset(
  params: SimulationRequest,
  scenario: SimulationScenario,
): SimulationRequest {
  return { ...params, scenario, ...PRESET_OVERRIDES[scenario] };
}

export function formatSingleSummary(summary: SimulationSummary): Array<[string, string]> {
  return [
    ["ATP Maksimum", `${summary.atp_max.toFixed(2)} mM`],
    ["ATP Steady-State", `${summary.atp_steady_state.toFixed(2)} mM`],
    ["Waktu ke Puncak", `${summary.time_to_peak.toFixed(1)} s`],
    ["Glukosa Tersisa", `${summary.glucose_remaining.toFixed(3)} mM`],
  ];
}

export function formatComparisonSummary(summary: SimulationSummary): Array<[string, string]> {
  return [
    ["ATP max", `${summary.atp_max.toFixed(2)} mM`],
    ["Puncak pada", `${summary.time_to_peak.toFixed(1)} s`],
    ["ATP akhir", `${summary.atp_steady_state.toFixed(2)} mM`],
  ];
}
