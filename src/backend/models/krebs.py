from models.enzyme import hill_equation, feedback_inhibition


class CitrateSynthaseModel:
    def __init__(
        self,
        Vmax: float = 0.8,
        K_half: float = 0.3,
        n: float = 2.0,
        Ki_NADH: float = 0.8,
        m_NADH: float = 2.0,
        yield_NADH: float = 3.0,
        allosteric_active: bool = True,
    ):
        self.Vmax = Vmax
        self.K_half = K_half
        self.n = n
        self.Ki_NADH = Ki_NADH
        self.m_NADH = m_NADH
        self.yield_NADH = yield_NADH
        self.allosteric_active = allosteric_active

    def rate(self, AcCoA: float, NADH: float) -> float:
        v = hill_equation(AcCoA, self.Vmax, self.K_half, self.n)
        if self.allosteric_active:
            v *= feedback_inhibition(NADH, self.Ki_NADH, self.m_NADH)
        return v

    def inhibition_level(self, NADH: float) -> float:
        if not self.allosteric_active:
            return 0.0
        return 1.0 - feedback_inhibition(NADH, self.Ki_NADH, self.m_NADH)


class ATPSynthaseModel:
    def __init__(
        self,
        Vmax: float = 1.5,
        K_half: float = 0.5,
        n: float = 1.5,
        yield_ATP: float = 2.5,
        ATP_max: float = 8.0,
    ):
        self.Vmax = Vmax
        self.K_half = K_half
        self.n = n
        self.yield_ATP = yield_ATP
        self.ATP_max = ATP_max

    def rate(self, NADH: float, ATP: float, o2_level: float = 1.0) -> float:
        v = hill_equation(NADH, self.Vmax, self.K_half, self.n)
        backpressure = max(0.0, 1.0 - ATP / self.ATP_max)
        return v * backpressure * o2_level
