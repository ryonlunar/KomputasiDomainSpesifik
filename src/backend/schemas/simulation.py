from typing import Literal
from pydantic import BaseModel, Field


class SimulationRequest(BaseModel):
    glucose_init: float = Field(5.0, ge=0.1, le=20.0)
    atp_init: float = Field(1.0, ge=0.0, le=5.0)
    o2_level: float = Field(1.0, ge=0.0, le=1.0)
    ki_atp: float = Field(2.0, ge=0.1, le=10.0)
    ki_nadh: float = Field(0.8, ge=0.1, le=5.0)
    hill_n: float = Field(2.0, ge=1.0, le=4.0)
    scenario: Literal["normal", "no_regulation", "partial"] = "normal"
    t_end: float = Field(120.0, ge=10.0, le=300.0)


class InhibitionStatus(BaseModel):
    hexokinase: list[float]
    citrate_synthase: list[float]


class SimulationSummary(BaseModel):
    atp_max: float
    atp_steady_state: float
    glucose_remaining: float
    time_to_peak: float


class SimulationResponse(BaseModel):
    t: list[float]
    glucose: list[float]
    ac_coa: list[float]
    nadh: list[float]
    atp: list[float]
    inhibition: InhibitionStatus
    summary: SimulationSummary
