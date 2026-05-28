export interface InhibitionStatus {
  hexokinase: number[];
  citrate_synthase: number[];
}

export interface SimulationSummary {
  atp_max: number;
  atp_steady_state: number;
  glucose_remaining: number;
  time_to_peak: number;
}

export interface SimulationResponse {
  t: number[];
  glucose: number[];
  ac_coa: number[];
  nadh: number[];
  atp: number[];
  inhibition: InhibitionStatus;
  summary: SimulationSummary;
}

export interface SimulationRequest {
  glucose_init: number;
  atp_init: number;
  o2_level: number;
  ki_atp: number;
  ki_nadh: number;
  hill_n: number;
  scenario: "normal" | "no_regulation" | "partial";
  t_end: number;
}
