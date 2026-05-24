"""
ODE system definition and three simulation scenarios.

State vector: y = [Glucose, AcetylCoA, NADH, ATP]  (all in mM)

Reactions:
  R1 — Hexokinase (glycolysis):
         Glucose → (2) AcetylCoA  +  (2) ATP  [allosteric inhibition by ATP]
  R2 — Citrate synthase (Krebs cycle):
         AcetylCoA → (3) NADH     [allosteric inhibition by NADH]
  R3 — ETC + ATP synthase:
         NADH → (2.5) ATP         [thermodynamic back-pressure from ATP]
  R4 — Basal ATP consumption (cellular work):
         ATP → ADP                [first-order]
  R5 — NADH oxidation / baseline decay:
         NADH → NAD+              [first-order, represents non-ETC sinks]

Scenarios
---------
1. NORMAL       — full allosteric regulation (healthy cell)
2. NO_REGULATION— allosteric feedback disabled (Warburg-like / uncoupled)
3. PARTIAL      — weakened allosteric regulation (disease / mitochondrial stress)
"""

import numpy as np
from scipy.integrate import solve_ivp

from models.glycolysis import HexokinaseModel
from models.krebs import CitrateSynthaseModel, ATPSynthaseModel

# ── Initial conditions ────────────────────────────────────────────────────────
Y0 = {
    "Glucose": 5.0,   # mM  (physiological ~5 mM blood glucose)
    "AcCoA":   0.1,   # mM  (low initial Acetyl-CoA)
    "NADH":    0.05,  # mM  (low initial NADH)
    "ATP":     1.0,   # mM  (moderate starting ATP)
}

# ── Simulation time span ──────────────────────────────────────────────────────
T_SPAN = (0, 120)    # seconds
T_EVAL = np.linspace(0, 120, 1200)

# ── Basal consumption rates ───────────────────────────────────────────────────
K_ATP_CONS  = 0.15   # s⁻¹  — first-order ATP consumption constant
K_NADH_SINK = 0.05   # s⁻¹  — baseline NADH decay (non-ETC sinks)


# ─────────────────────────────────────────────────────────────────────────────
def build_enzymes(scenario: str):
    """
    Construct enzyme models for a given scenario.

    Parameters
    ----------
    scenario : "normal" | "no_regulation" | "partial"

    Returns
    -------
    (hk, cs, atp_syn) : enzyme model instances
    """
    scenario = scenario.lower()

    if scenario == "normal":
        hk = HexokinaseModel(
            Vmax=1.0, K_half=0.5, n=2.0,
            Ki_ATP=2.0, m_ATP=2.0,
            allosteric_active=True,
        )
        cs = CitrateSynthaseModel(
            Vmax=0.8, K_half=0.3, n=2.0,
            Ki_NADH=0.8, m_NADH=2.0,
            allosteric_active=True,
        )

    elif scenario == "no_regulation":
        # Allosteric feedback completely disabled — unregulated flux
        hk = HexokinaseModel(
            Vmax=1.0, K_half=0.5, n=1.0,   # n=1 → Michaelis-Menten-like
            Ki_ATP=2.0, m_ATP=2.0,
            allosteric_active=False,
        )
        cs = CitrateSynthaseModel(
            Vmax=0.8, K_half=0.3, n=1.0,
            Ki_NADH=0.8, m_NADH=2.0,
            allosteric_active=False,
        )

    elif scenario == "partial":
        # Weakened inhibition: Ki doubled (less sensitive), n reduced
        hk = HexokinaseModel(
            Vmax=1.0, K_half=0.5, n=1.5,
            Ki_ATP=4.0, m_ATP=1.5,          # higher Ki → weaker inhibition
            allosteric_active=True,
        )
        cs = CitrateSynthaseModel(
            Vmax=0.8, K_half=0.3, n=1.5,
            Ki_NADH=1.6, m_NADH=1.5,
            allosteric_active=True,
        )

    else:
        raise ValueError(f"Unknown scenario: '{scenario}'. "
                         "Choose 'normal', 'no_regulation', or 'partial'.")

    atp_syn = ATPSynthaseModel(
        Vmax=1.5, K_half=0.5, n=1.5,
        yield_ATP=2.5, ATP_max=8.0,
    )
    return hk, cs, atp_syn


# ─────────────────────────────────────────────────────────────────────────────
def ode_system(t, y, hk, cs, atp_syn):
    """
    Right-hand side of the ODE system.

    State vector y:
        y[0] = Glucose  (mM)
        y[1] = AcetylCoA (mM)
        y[2] = NADH     (mM)
        y[3] = ATP      (mM)
    """
    G, Ac, N, A = y

    # Clamp negatives (solver may overshoot near zero)
    G  = max(G,  0.0)
    Ac = max(Ac, 0.0)
    N  = max(N,  0.0)
    A  = max(A,  0.0)

    # Reaction rates
    v_hk  = hk.rate(G, A)                   # R1: glycolysis via hexokinase
    v_cs  = cs.rate(Ac, N)                  # R2: Krebs via citrate synthase
    v_atp = atp_syn.rate(N, A)              # R3: ETC + ATP synthase

    # ODEs
    dG  = -v_hk                                                    # glucose consumed
    dAc = v_hk * hk.yield_AcCoA - v_cs                            # Ac produced by glycolysis, consumed by Krebs
    dN  = v_cs * cs.yield_NADH - v_atp - K_NADH_SINK * N          # NADH from Krebs, consumed by ETC
    dA  = (v_hk * hk.yield_ATP                                     # ATP from glycolysis
           + v_atp * atp_syn.yield_ATP                             # ATP from oxidative phosphorylation
           - K_ATP_CONS * A)                                       # basal ATP consumption

    return [dG, dAc, dN, dA]


# ─────────────────────────────────────────────────────────────────────────────
def run_scenario(scenario: str, t_span=T_SPAN, t_eval=T_EVAL, y0_dict=None):
    """
    Run a simulation scenario and return time + state trajectories.

    Parameters
    ----------
    scenario : "normal" | "no_regulation" | "partial"
    t_span   : (t_start, t_end) in seconds
    t_eval   : array of time points at which to store results
    y0_dict  : optional dict to override initial conditions

    Returns
    -------
    t  : time array (s)
    Y  : state array shape (4, len(t)) — rows: Glucose, AcCoA, NADH, ATP
    sol: full OdeResult object from solve_ivp
    """
    if y0_dict is None:
        y0_dict = Y0
    y0 = [y0_dict["Glucose"], y0_dict["AcCoA"], y0_dict["NADH"], y0_dict["ATP"]]

    hk, cs, atp_syn = build_enzymes(scenario)

    sol = solve_ivp(
        fun=ode_system,
        t_span=t_span,
        y0=y0,
        t_eval=t_eval,
        args=(hk, cs, atp_syn),
        method="RK45",
        rtol=1e-6,
        atol=1e-9,
        dense_output=False,
    )

    if not sol.success:
        raise RuntimeError(f"Solver failed for scenario '{scenario}': {sol.message}")

    return sol.t, sol.y, sol


# ─────────────────────────────────────────────────────────────────────────────
SCENARIO_LABELS = {
    "normal":        "Regulasi Alosterik Normal (Sel Sehat)",
    "no_regulation": "Regulasi Alosterik Dinonaktifkan (Warburg-like)",
    "partial":       "Regulasi Alosterik Terganggu (Kondisi Penyakit)",
}

SCENARIO_COLORS = {
    "normal":        "#2196F3",   # blue
    "no_regulation": "#F44336",   # red
    "partial":       "#FF9800",   # orange
}

SCENARIO_STYLES = {
    "normal":        "-",
    "no_regulation": "--",
    "partial":       "-.",
}

STATE_LABELS = ["Glucose", "Acetyl-CoA", "NADH", "ATP"]
STATE_UNITS  = ["mM", "mM", "mM", "mM"]
