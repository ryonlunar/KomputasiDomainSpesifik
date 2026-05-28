import numpy as np


def hill_equation(S: float, Vmax: float, K_half: float, n: float) -> float:
    S = max(S, 0.0)
    Sn = S ** n
    return Vmax * Sn / (K_half ** n + Sn)


def feedback_inhibition(inhibitor: float, Ki: float, m: float) -> float:
    """Returns factor in [0, 1]. 1 = no inhibition, 0 = full inhibition."""
    inhibitor = max(inhibitor, 0.0)
    Ki_m = Ki ** m
    return Ki_m / (Ki_m + inhibitor ** m)
