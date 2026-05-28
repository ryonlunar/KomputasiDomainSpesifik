from models.enzyme import hill_equation, feedback_inhibition


class HexokinaseModel:
    def __init__(
        self,
        Vmax: float = 1.0,
        K_half: float = 0.5,
        n: float = 2.0,
        Ki_ATP: float = 2.0,
        m_ATP: float = 2.0,
        yield_AcCoA: float = 2.0,
        yield_ATP: float = 2.0,
        allosteric_active: bool = True,
    ):
        self.Vmax = Vmax
        self.K_half = K_half
        self.n = n
        self.Ki_ATP = Ki_ATP
        self.m_ATP = m_ATP
        self.yield_AcCoA = yield_AcCoA
        self.yield_ATP = yield_ATP
        self.allosteric_active = allosteric_active

    def rate(self, glucose: float, ATP: float) -> float:
        v = hill_equation(glucose, self.Vmax, self.K_half, self.n)
        if self.allosteric_active:
            v *= feedback_inhibition(ATP, self.Ki_ATP, self.m_ATP)
        return v

    def inhibition_level(self, ATP: float) -> float:
        """0 = fully active, 1 = fully inhibited."""
        if not self.allosteric_active:
            return 0.0
        return 1.0 - feedback_inhibition(ATP, self.Ki_ATP, self.m_ATP)
