"""
SimuCell-Allosteric — entry point.

Simulasi regulasi alosterik enzim pada jalur respirasi seluler.
Jalankan: python main.py

Output: folder output/ berisi 3 file PNG + ringkasan numerik di terminal.
"""

import sys
import numpy as np

from simulation import run_scenario, SCENARIO_LABELS, STATE_LABELS, T_EVAL
from visualizer import (
    plot_atp_vs_time,
    plot_atp_comparison,
    plot_hill_vs_mm,
    plot_feedback_loop,
    show_all,
)


SCENARIOS = ["normal", "no_regulation", "partial"]


def print_summary(results: dict):
    """Print a numerical summary table to terminal."""
    print("\n" + "=" * 70)
    print("RINGKASAN HASIL SIMULASI")
    print("=" * 70)
    header = f"{'Skenario':<42} {'ATP_max':>8} {'ATP_ss':>8} {'Glc_sisa':>9}"
    print(header)
    print("-" * 70)

    for scenario, (t, Y, _) in results.items():
        atp_max  = np.max(Y[3])
        atp_ss   = Y[3, -1]          # steady-state (last time point)
        glc_remaining = Y[0, -1]
        label = SCENARIO_LABELS[scenario][:40]
        print(f"{label:<42} {atp_max:>8.3f} {atp_ss:>8.3f} {glc_remaining:>9.3f}")

    print("-" * 70)
    print("Satuan: mM.  ATP_max=puncak, ATP_ss=t=120s, Glc_sisa=glukosa tersisa")
    print("=" * 70 + "\n")


def main():
    print("SimuCell-Allosteric: Simulasi Regulasi Alosterik Respirasi Seluler")
    print("=" * 70)

    # ── Run all scenarios ───────────────────────────────────────────────────
    results = {}
    for scenario in SCENARIOS:
        print(f"  Menjalankan skenario: {SCENARIO_LABELS[scenario]} ...", end=" ", flush=True)
        t, Y, sol = run_scenario(scenario)
        results[scenario] = (t, Y, sol)
        print("selesai.")

    # ── Print summary ───────────────────────────────────────────────────────
    print_summary(results)

    # ── Generate figures ────────────────────────────────────────────────────
    print("Membuat visualisasi...")
    plot_atp_vs_time(results)       # Fig 1a — all metabolites, all scenarios
    plot_atp_comparison(results)    # Fig 1b — ATP-only comparison (for paper)
    plot_hill_vs_mm()               # Fig 2  — Hill vs Michaelis-Menten
    plot_feedback_loop()            # Fig 3  — feedback inhibition curves

    print("\nSemua gambar tersimpan di folder output/")
    print("Jalankan dengan argumen --show untuk menampilkan grafik interaktif.\n")

    if "--show" in sys.argv:
        show_all()


if __name__ == "__main__":
    main()
