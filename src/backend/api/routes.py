from fastapi import APIRouter, HTTPException
from schemas.simulation import SimulationRequest, SimulationResponse
from services import simulation_service

router = APIRouter(prefix="/api")

PRESETS: dict = {
    "normal": {
        "glucose_init": 5.0, "atp_init": 1.0, "o2_level": 1.0,
        "ki_atp": 2.0, "ki_nadh": 0.8, "hill_n": 2.0,
        "scenario": "normal", "t_end": 120.0,
    },
    "no_regulation": {
        "glucose_init": 5.0, "atp_init": 1.0, "o2_level": 1.0,
        "ki_atp": 2.0, "ki_nadh": 0.8, "hill_n": 1.0,
        "scenario": "no_regulation", "t_end": 120.0,
    },
    "partial": {
        "glucose_init": 5.0, "atp_init": 1.0, "o2_level": 1.0,
        "ki_atp": 4.0, "ki_nadh": 1.6, "hill_n": 1.5,
        "scenario": "partial", "t_end": 120.0,
    },
}


@router.post("/simulate", response_model=SimulationResponse)
async def simulate(req: SimulationRequest):
    try:
        return simulation_service.run(req)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/presets")
async def presets():
    return PRESETS
