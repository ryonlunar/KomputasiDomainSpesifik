import type { SimulationRequest, SimulationResponse } from "../types/simulation";

const BASE = "http://localhost:8000/api";

export async function simulate(req: SimulationRequest): Promise<SimulationResponse> {
  const res = await fetch(`${BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Simulation failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<SimulationResponse>;
}

export async function getPresets(): Promise<Record<string, SimulationRequest>> {
  const res = await fetch(`${BASE}/presets`);
  if (!res.ok) throw new Error("Failed to load presets");
  return res.json();
}
