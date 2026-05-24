"""
Core enzyme kinetics equations.

Hill equation models cooperative/allosteric behavior.
Michaelis-Menten models classical non-cooperative kinetics.
"""

import numpy as np


def hill_equation(S, Vmax, K_half, n):
    """
    Hill equation for allosteric enzymes.

    Parameters
    ----------
    S     : substrate concentration (mM)
    Vmax  : maximum reaction rate (mM/s)
    K_half: half-saturation constant [S]_0.5 (mM)
    n     : Hill coefficient (cooperativity; n>1 = positive cooperativity)

    Returns
    -------
    v : reaction rate (mM/s)
    """
    S = np.maximum(S, 0.0)
    Sn = S ** n
    return Vmax * Sn / (K_half ** n + Sn)


def michaelis_menten(S, Vmax, Km):
    """
    Standard Michaelis-Menten kinetics (n=1 special case of Hill).

    Parameters
    ----------
    S   : substrate concentration (mM)
    Vmax: maximum reaction rate (mM/s)
    Km  : Michaelis constant (mM)

    Returns
    -------
    v : reaction rate (mM/s)
    """
    S = np.maximum(S, 0.0)
    return Vmax * S / (Km + S)


def feedback_inhibition(inhibitor, Ki, m=2):
    """
    Allosteric product-inhibition factor in [0, 1].

    Factor approaches 0 as inhibitor >> Ki (full inhibition).
    Factor approaches 1 as inhibitor << Ki (no inhibition).

    Parameters
    ----------
    inhibitor : inhibitor concentration (mM)
    Ki        : inhibition constant (mM)
    m         : Hill coefficient for inhibition curve
    """
    inhibitor = np.maximum(inhibitor, 0.0)
    Ki_m = Ki ** m
    return Ki_m / (Ki_m + inhibitor ** m)


def feedback_activation(activator, Ka, m=2):
    """
    Allosteric activation factor in [0, 1].

    Factor approaches 1 as activator >> Ka (full activation).

    Parameters
    ----------
    activator : activator concentration (mM)
    Ka        : activation constant (mM)
    m         : Hill coefficient for activation curve
    """
    activator = np.maximum(activator, 0.0)
    act_m = activator ** m
    return act_m / (Ka ** m + act_m)
