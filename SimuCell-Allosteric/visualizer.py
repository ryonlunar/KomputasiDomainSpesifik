"""
Visualization module — all Matplotlib plotting functions.

Generates three figures:
  Fig 1 — ATP concentration vs time for all three scenarios
  Fig 2 — Hill equation vs Michaelis-Menten kinetics comparison
  Fig 3 — Hexokinase activity vs [ATP] showing allosteric feedback loop
"""

import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

from models.enzyme import hill_equation, michaelis_menten, feedback_inhibition
from simulation import SCENARIO_LABELS, SCENARIO_COLORS, SCENARIO_STYLES, STATE_LABELS

OUTPUT_DIR = "output"


def _ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────────────────────
# Figure 1 — ATP yield vs time (all 3 scenarios + all metabolites)
# ─────────────────────────────────────────────────────────────────────────────

def plot_atp_vs_time(results: dict, save: bool = True):
    """
    Plot ATP concentration over time for all simulation scenarios.

    Parameters
    ----------
    results : dict mapping scenario name → (t, Y, sol)
              Y rows: [Glucose, AcCoA, NADH, ATP]
    save    : if True, save figure to output/fig1_atp_vs_time.png
    """
    _ensure_output_dir()

    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    fig.suptitle(
        "Dinamika Konsentrasi Metabolit — Tiga Skenario Regulasi Alosterik",
        fontsize=14, fontweight="bold", y=1.01,
    )

    state_indices = [0, 1, 2, 3]
    state_names   = ["Glucose", "Acetyl-CoA", "NADH", "ATP"]
    axes_flat = axes.flatten()

    for ax, idx, name in zip(axes_flat, state_indices, state_names):
        for scenario, (t, Y, _) in results.items():
            ax.plot(
                t, Y[idx],
                label=SCENARIO_LABELS[scenario],
                color=SCENARIO_COLORS[scenario],
                linestyle=SCENARIO_STYLES[scenario],
                linewidth=2.0,
            )
        ax.set_xlabel("Waktu (s)", fontsize=11)
        ax.set_ylabel("Konsentrasi (mM)", fontsize=11)
        ax.set_title(name, fontsize=12, fontweight="bold")
        ax.legend(fontsize=8, loc="best")
        ax.grid(True, alpha=0.3)
        ax.set_xlim(left=0)
        ax.set_ylim(bottom=0)

    plt.tight_layout()

    if save:
        path = os.path.join(OUTPUT_DIR, "fig1_atp_vs_time.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"[saved] {path}")

    return fig


def plot_atp_comparison(results: dict, save: bool = True):
    """
    Single-panel ATP-only comparison across scenarios (for the paper figure).
    """
    _ensure_output_dir()

    fig, ax = plt.subplots(figsize=(9, 5))

    for scenario, (t, Y, _) in results.items():
        ax.plot(
            t, Y[3],                            # index 3 = ATP
            label=SCENARIO_LABELS[scenario],
            color=SCENARIO_COLORS[scenario],
            linestyle=SCENARIO_STYLES[scenario],
            linewidth=2.5,
        )

    ax.set_xlabel("Waktu (s)", fontsize=13)
    ax.set_ylabel("[ATP] (mM)", fontsize=13)
    ax.set_title(
        "Produksi ATP: Perbandingan Tiga Skenario Regulasi Alosterik",
        fontsize=13, fontweight="bold",
    )
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)
    ax.set_xlim(left=0)
    ax.set_ylim(bottom=0)

    plt.tight_layout()

    if save:
        path = os.path.join(OUTPUT_DIR, "fig1b_atp_comparison.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"[saved] {path}")

    return fig


# ─────────────────────────────────────────────────────────────────────────────
# Figure 2 — Hill equation vs Michaelis-Menten
# ─────────────────────────────────────────────────────────────────────────────

def plot_hill_vs_mm(save: bool = True):
    """
    Compare Hill equation (n=1, 2, 4) against Michaelis-Menten.

    Shows how cooperativity (n>1) produces a sigmoidal switch-like response,
    which is the hallmark of allosteric regulation.
    """
    _ensure_output_dir()

    S = np.linspace(0, 4.0, 500)
    Vmax   = 1.0
    K_half = 1.0   # mM (same for fair comparison)
    Km     = 1.0

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Left panel: rate vs substrate
    ax = axes[0]
    ax.plot(S, michaelis_menten(S, Vmax, Km),
            label="Michaelis-Menten (n=1)", color="#9E9E9E",
            linewidth=2, linestyle="--")
    for n, color in zip([1.5, 2, 4], ["#4CAF50", "#2196F3", "#9C27B0"]):
        ax.plot(S, hill_equation(S, Vmax, K_half, n),
                label=f"Hill (n={n})", color=color, linewidth=2)

    ax.axvline(K_half, color="black", linestyle=":", alpha=0.5, label=f"$K_{{0.5}}$ = {K_half} mM")
    ax.axhline(Vmax / 2, color="black", linestyle=":", alpha=0.5, label=f"$V_{{max}}/2$")
    ax.set_xlabel("[S] (mM)", fontsize=12)
    ax.set_ylabel("v / $V_{max}$", fontsize=12)
    ax.set_title("Kurva Laju Reaksi: Hill vs Michaelis-Menten", fontsize=12, fontweight="bold")
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)

    # Right panel: Hill plot (log[S/(K-S)] vs log[S]) — linearization
    ax2 = axes[1]
    for n, color in zip([1.0, 2.0, 4.0], ["#9E9E9E", "#2196F3", "#9C27B0"]):
        y = hill_equation(S[1:], Vmax, K_half, n)
        # Hill plot: log(v/(Vmax-v)) vs log(S)
        ratio = y / (Vmax - y + 1e-12)
        valid = (ratio > 0) & (S[1:] > 0)
        ax2.plot(
            np.log10(S[1:][valid]),
            np.log10(ratio[valid]),
            label=f"n={n}", color=color, linewidth=2,
        )
    ax2.set_xlabel("log[S] (mM)", fontsize=12)
    ax2.set_ylabel("log(v / ($V_{max}$ − v))", fontsize=12)
    ax2.set_title("Hill Plot (Linearisasi)", fontsize=12, fontweight="bold")
    ax2.legend(fontsize=10)
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim(-1.5, 0.8)
    ax2.set_ylim(-3, 3)

    plt.tight_layout()

    if save:
        path = os.path.join(OUTPUT_DIR, "fig2_hill_vs_mm.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"[saved] {path}")

    return fig


# ─────────────────────────────────────────────────────────────────────────────
# Figure 3 — Hexokinase activity vs [ATP] (feedback loop visualization)
# ─────────────────────────────────────────────────────────────────────────────

def plot_feedback_loop(save: bool = True):
    """
    Visualize the allosteric feedback loop:
      - Hexokinase rate as a function of [ATP] (at fixed [Glucose])
      - Shows difference between no regulation, partial, and full allosteric inhibition
    """
    _ensure_output_dir()

    from models.glycolysis import HexokinaseModel

    ATP_range = np.linspace(0, 8.0, 500)
    glucose   = 5.0   # mM fixed

    scenarios = {
        "normal":        HexokinaseModel(Ki_ATP=2.0, m_ATP=2.0, allosteric_active=True),
        "partial":       HexokinaseModel(Ki_ATP=4.0, m_ATP=1.5, allosteric_active=True),
        "no_regulation": HexokinaseModel(allosteric_active=False),
    }

    fig, axes = plt.subplots(1, 2, figsize=(12, 5))

    # Left: HK rate vs [ATP]
    ax = axes[0]
    for name, hk in scenarios.items():
        rates = [hk.rate(glucose, atp) for atp in ATP_range]
        ax.plot(
            ATP_range, rates,
            label=SCENARIO_LABELS[name],
            color=SCENARIO_COLORS[name],
            linestyle=SCENARIO_STYLES[name],
            linewidth=2.5,
        )

    ax.set_xlabel("[ATP] (mM)", fontsize=12)
    ax.set_ylabel("Laju Heksokinase (mM/s)", fontsize=12)
    ax.set_title("Umpan Balik Alosterik:\nAktivitas Heksokinase vs [ATP]",
                 fontsize=12, fontweight="bold")
    ax.legend(fontsize=9)
    ax.grid(True, alpha=0.3)
    ax.set_xlim(left=0)
    ax.set_ylim(bottom=0)

    # Right: inhibition factor alone vs [ATP]
    ax2 = axes[1]
    Ki_vals = {"Normal (Ki=2 mM)": (2.0, 2.0), "Parsial (Ki=4 mM)": (4.0, 1.5)}
    colors  = ["#2196F3", "#FF9800"]
    for (label, (Ki, m)), color in zip(Ki_vals.items(), colors):
        inh = feedback_inhibition(ATP_range, Ki, m)
        ax2.plot(ATP_range, inh, label=label, color=color, linewidth=2.5)

    ax2.axhline(0.5, color="gray", linestyle=":", linewidth=1.2, label="50% inhibisi")
    ax2.set_xlabel("[ATP] (mM)", fontsize=12)
    ax2.set_ylabel("Faktor Inhibisi", fontsize=12)
    ax2.set_title("Kurva Inhibisi Alosterik\n(Faktor Penghambatan vs [ATP])",
                  fontsize=12, fontweight="bold")
    ax2.legend(fontsize=10)
    ax2.grid(True, alpha=0.3)
    ax2.set_xlim(left=0)
    ax2.set_ylim(0, 1.05)

    plt.tight_layout()

    if save:
        path = os.path.join(OUTPUT_DIR, "fig3_feedback_loop.png")
        fig.savefig(path, dpi=150, bbox_inches="tight")
        print(f"[saved] {path}")

    return fig


# ─────────────────────────────────────────────────────────────────────────────
# Utility
# ─────────────────────────────────────────────────────────────────────────────

def show_all():
    plt.show()
