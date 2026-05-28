import numpy as np
from scipy.integrate import solve_ivp

from models.glycolysis import HexokinaseModel
from models.krebs import CitrateSynthaseModel, ATPSynthaseModel
from schemas.simulation import (
    SimulationRequest,
    SimulationResponse,
    InhibitionStatus,
    SimulationSummary,
)

_K_ATP_CONS = 0.15
_K_NADH_SINK = 0.05


def _build_enzymes(req: SimulationRequest):
    allosteric = req.scenario != "no_regulation"
    n = req.hill_n if allosteric else 1.0

    hk = HexokinaseModel(
        n=n,
        Ki_ATP=req.ki_atp,
        m_ATP=n,
        allosteric_active=allosteric,
    )
    cs = CitrateSynthaseModel(
        n=n,
        Ki_NADH=req.ki_nadh,
        m_NADH=n,
        allosteric_active=allosteric,
    )
    atp_syn = ATPSynthaseModel()
    return hk, cs, atp_syn


def _ode(t, y, hk, cs, atp_syn, o2_level):
    G, Ac, N, A = (max(v, 0.0) for v in y)
    v_hk = hk.rate(G, A)
    v_cs = cs.rate(Ac, N)
    v_etc = atp_syn.rate(N, A, o2_level)
    return [
        -v_hk,
        v_hk * hk.yield_AcCoA - v_cs,
        v_cs * cs.yield_NADH - v_etc - _K_NADH_SINK * N,
        v_hk * hk.yield_ATP + v_etc * atp_syn.yield_ATP - _K_ATP_CONS * A,
    ]


def run(req: SimulationRequest) -> SimulationResponse:
    hk, cs, atp_syn = _build_enzymes(req)
    y0 = [req.glucose_init, 0.1, 0.05, req.atp_init]
    t_eval = np.linspace(0, req.t_end, 600)

    sol = solve_ivp(
        fun=lambda t, y: _ode(t, y, hk, cs, atp_syn, req.o2_level),
        t_span=(0.0, req.t_end),
        y0=y0,
        t_eval=t_eval,
        method="RK45",
        rtol=1e-6,
        atol=1e-9,
    )

    if not sol.success:
        raise RuntimeError(f"ODE solver failed: {sol.message}")

    G, Ac, N, A = (np.maximum(row, 0.0) for row in sol.y)

    inh_hk = [hk.inhibition_level(float(a)) for a in A]
    inh_cs = [cs.inhibition_level(float(n)) for n in N]
    peak_idx = int(np.argmax(A))

    return SimulationResponse(
        t=sol.t.tolist(),
        glucose=G.tolist(),
        ac_coa=Ac.tolist(),
        nadh=N.tolist(),
        atp=A.tolist(),
        inhibition=InhibitionStatus(
            hexokinase=inh_hk,
            citrate_synthase=inh_cs,
        ),
        summary=SimulationSummary(
            atp_max=float(np.max(A)),
            atp_steady_state=float(A[-1]),
            glucose_remaining=float(G[-1]),
            time_to_peak=float(sol.t[peak_idx]),
        ),
    )
