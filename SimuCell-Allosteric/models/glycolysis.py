"""
Hexokinase model — first committed step of glycolysis.

Hexokinase (HK) phosphorylates glucose to glucose-6-phosphate.
It is allosterically inhibited by its downstream product ATP
(product feedback inhibition), preventing runaway glycolysis
when cellular energy charge is high.

Stoichiometry (simplified net glycolysis):
    Glucose  →  2 Pyruvate  →  2 Acetyl-CoA
    Net yield: 2 ATP, 2 NADH (cytosolic), 2 Acetyl-CoA (enters Krebs)
"""

from .enzyme import hill_equation, feedback_inhibition


class HexokinaseModel:
    """
    Hexokinase with allosteric ATP feedback inhibition.

    State inputs  : [Glucose], [ATP]
    State outputs : rate → drives dGlucose/dt, dAcCoA/dt, dATP/dt
    """

    def __init__(
        self,
        Vmax=1.0,        # mM/s — max rate
        K_half=0.5,      # mM  — [S]_0.5 for glucose (Hill)
        n=2.0,           # Hill coefficient (cooperativity)
        Ki_ATP=2.0,      # mM  — ATP inhibition constant
        m_ATP=2.0,       # Hill coefficient for ATP inhibition
        yield_AcCoA=2.0, # mol Acetyl-CoA per mol glucose consumed
        yield_ATP=2.0,   # net ATP produced per glucose (glycolysis)
        allosteric_active=True,
    ):
        self.Vmax = Vmax
        self.K_half = K_half
        self.n = n
        self.Ki_ATP = Ki_ATP
        self.m_ATP = m_ATP
        self.yield_AcCoA = yield_AcCoA
        self.yield_ATP = yield_ATP
        self.allosteric_active = allosteric_active

    def rate(self, glucose, ATP):
        """
        Compute hexokinase reaction rate.

        Parameters
        ----------
        glucose : current glucose concentration (mM)
        ATP     : current ATP concentration (mM)

        Returns
        -------
        v_eff : effective rate (mM/s)
        """
        v = hill_equation(glucose, self.Vmax, self.K_half, self.n)
        if self.allosteric_active:
            v *= feedback_inhibition(ATP, self.Ki_ATP, self.m_ATP)
        return v
