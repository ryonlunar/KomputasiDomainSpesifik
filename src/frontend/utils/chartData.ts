import type { SimulationResponse } from "../types/simulation";

export interface MultiMetabolitePoint {
  t: number;
  ATP: number;
  NADH: number;
  Glucose: number;
  AcCoA: number;
}

export interface AtpPoint {
  t: number;
  ATP: number;
}

function sampleIndexes(length: number, maxPoints: number): number[] {
  if (length <= 0) return [];
  const step = Math.max(1, Math.ceil(length / maxPoints));
  return Array.from({ length }, (_, i) => i).filter((i) => i % step === 0);
}

function rounded(value: number | undefined, precision: number): number {
  return parseFloat((value ?? 0).toFixed(precision));
}

export function toMetaboliteChartData(
  data: SimulationResponse,
  maxPoints = 150,
): MultiMetabolitePoint[] {
  return sampleIndexes(data.t.length, maxPoints).map((idx) => ({
    t: rounded(data.t[idx], 1),
    ATP: rounded(data.atp[idx], 3),
    NADH: rounded(data.nadh[idx], 3),
    Glucose: rounded(data.glucose[idx], 3),
    AcCoA: rounded(data.ac_coa[idx], 3),
  }));
}

export function toAtpChartData(data: SimulationResponse, maxPoints = 80): AtpPoint[] {
  return sampleIndexes(data.t.length, maxPoints).map((idx) => ({
    t: rounded(data.t[idx], 1),
    ATP: rounded(data.atp[idx], 3),
  }));
}
