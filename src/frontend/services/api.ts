import type { SimulationRequest, SimulationResponse } from "../types/simulation";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export async function simulate(
  req: SimulationRequest,
  signal?: AbortSignal,
): Promise<SimulationResponse> {
  const res = await fetch(`${BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Simulation failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<SimulationResponse>;
}
