"""
Krebs cycle and electron transport chain / ATP synthase models.

Citrate Synthase (CS) — first and rate-limiting step of the Krebs (TCA) cycle.
    Acetyl-CoA + OAA → Citrate
    Allosterically inhibited by NADH (product of the cycle).
    Per turn of Krebs: 3 NADH, 1 FADH2, 1 GTP produced.

ATP Synthase (Complex V) — terminal step of oxidative phosphorylation.
    NADH (+ FADH2) drives the electron transport chain, generating
    a proton gradient (ΔμH+) that powers ATP synthesis from ADP + Pi.
    Simplified: ATP production rate is proportional to [NADH] available
    and inversely proportional to back-pressure from high [ATP].
"""

from .enzyme import hill_equation, feedback_inhibition


class CitrateSynthaseModel:
    """
    Citrate synthase with allosteric NADH feedback inhibition.

    State inputs  : [AcetylCoA], [NADH]
    State outputs : rate → drives dAcCoA/dt, dNADH/dt
    """

    def __init__(
        self,
        Vmax=0.8,         # mM/s
        K_half=0.3,       # mM  — [S]_0.5 for Acetyl-CoA
        n=2.0,            # Hill coefficient
        Ki_NADH=0.8,      # mM  — NADH inhibition constant
        m_NADH=2.0,       # Hill coefficient for NADH inhibition
        yield_NADH=3.0,   # NADH produced per Acetyl-CoA (per Krebs turn)
        allosteric_active=True,
    ):
        self.Vmax = Vmax
        self.K_half = K_half
        self.n = n
        self.Ki_NADH = Ki_NADH
        self.m_NADH = m_NADH
        self.yield_NADH = yield_NADH
        self.allosteric_active = allosteric_active

    def rate(self, AcCoA, NADH):
        """
        Compute citrate synthase reaction rate.

        Parameters
        ----------
        AcCoA : current Acetyl-CoA concentration (mM)
        NADH  : current NADH concentration (mM)

        Returns
        -------
        v_eff : effective rate (mM/s)
        """
        v = hill_equation(AcCoA, self.Vmax, self.K_half, self.n)
        if self.allosteric_active:
            v *= feedback_inhibition(NADH, self.Ki_NADH, self.m_NADH)
        return v


class ATPSynthaseModel:
    """
    ATP synthase (Complex V) — converts NADH-driven proton gradient to ATP.

    Simplified model:
      - Rate driven by [NADH] via Hill kinetics (representing ETC flux)
      - Thermodynamic back-pressure: rate suppressed when [ATP] is high
        (high ATP → low ADP → ATP synthase slows, consistent with
        Mitchell's chemiosmotic theory)
    """

    def __init__(
        self,
        Vmax=1.5,       # mM/s
        K_half=0.5,     # mM  — [S]_0.5 for NADH (ETC saturation)
        n=1.5,          # Hill coefficient (mild cooperativity)
        yield_ATP=2.5,  # ATP produced per NADH oxidised
        ATP_max=8.0,    # mM  — physiological ATP ceiling (back-pressure ref)
    ):
        self.Vmax = Vmax
        self.K_half = K_half
        self.n = n
        self.yield_ATP = yield_ATP
        self.ATP_max = ATP_max

    def rate(self, NADH, ATP):
        """
        Compute ATP synthase / ETC reaction rate.

        Parameters
        ----------
        NADH : current NADH concentration (mM)
        ATP  : current ATP concentration (mM) — provides back-pressure

        Returns
        -------
        v_eff : effective ETC / ATP-synthase rate (mM/s)
        """
        v_etc = hill_equation(NADH, self.Vmax, self.K_half, self.n)
        # Thermodynamic back-pressure: less ADP available when ATP is high
        atp_backpressure = max(0.0, 1.0 - ATP / self.ATP_max)
        return v_etc * atp_backpressure
