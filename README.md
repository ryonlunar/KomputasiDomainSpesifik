<div align="center">

# SimuCell-Allosteric

### Simulasi Regulasi Alosterik Enzim pada Jalur Respirasi Seluler sebagai Mekanisme Kontrol Dinamis Produksi ATP

**IF3211 Komputasi Domain Spesifik — Biologi Komputasional**
Institut Teknologi Bandung · Mei 2026

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://www.python.org/)
[![SciPy](https://img.shields.io/badge/SciPy-1.17-8CAAE6?logo=scipy)](https://scipy.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)

</div>

---

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tim Pengembang](#tim-pengembang)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Model Matematika](#model-matematika)
- [Skenario Biologis](#skenario-biologis)
- [Struktur Direktori](#struktur-direktori)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Cara Menjalankan](#cara-menjalankan)
- [Dokumentasi API](#dokumentasi-api)
- [Hasil Simulasi](#hasil-simulasi)
- [Referensi](#referensi)

---

## Tentang Proyek

**SimuCell-Allosteric** adalah platform simulasi berbasis web yang memodelkan **regulasi alosterik enzim** pada jalur respirasi seluler — glikolisis, siklus Krebs, dan fosforilasi oksidatif — sebagai mekanisme kontrol dinamis produksi ATP. Proyek ini menjawab pertanyaan: *seberapa besar pengaruh kontrol umpan balik alosterik terhadap efisiensi metabolisme sel, dan apa yang terjadi ketika kontrol tersebut hilang seperti pada sel kanker (efek Warburg)?*

Sistem ini mengintegrasikan model **persamaan diferensial biasa (ODE)** berbasis kinetika Hill ke dalam antarmuka web interaktif, sehingga pengguna dapat mengeksplorasi parameter kinetik enzim secara *real-time* dan langsung melihat dampaknya terhadap dinamika konsentrasi metabolit.

### Motivasi

- ATP adalah molekul energi universal sel; produksinya harus seimbang dengan konsumsi secara *real-time*.
- Regulasi alosterik adalah mekanisme umpan balik di mana produk akhir (ATP, NADH) menghambat enzim awal jalur — menjaga homeostasis metabolik.
- Ketika regulasi ini terganggu (contoh: sel kanker), sel kehilangan kendali dan mengonsumsi glukosa berlebihan tanpa efisiensi.
- Dinamika sistem ODE nonlinier ini sulit diprediksi secara intuitif — simulasi numerik diperlukan untuk pemahaman kuantitatif.

---

## Fitur Utama

- **Simulasi ODE *real-time*** — Solver Runge-Kutta (RK45) via SciPy dengan toleransi `rtol=1e-6`, `atol=1e-9`.
- **Tiga skenario biologis** — Sel sehat (Normal), sel kanker (Warburg / *No Regulation*), dan enzim bermutasi (Parsial).
- **Eksplorasi parameter interaktif** — Slider untuk Vmax, K½, Ki, koefisien Hill, glukosa awal, dan durasi simulasi.
- **Visualisasi multi-modal** — Grafik dinamika metabolit (Recharts), diagram jalur SVG, panel status enzim, dan ringkasan statistik.
- **Mode pembanding** — Tampilan berdampingan tiga skenario untuk analisis komparatif.
- **Debouncing input** — Debounce 300 ms mencegah pemanggilan API berlebih saat slider digeser.
- **Containerized deployment** — Berjalan dengan satu perintah `docker compose up`.

---

## Tim Pengembang

| NIM | Nama | Tanggung Jawab |
|-----|------|----------------|
| 13523011 | Muhammad Ra'if Alkautsar | Skenario Biologis · Arsitektur Sistem |
| 13523028 | Muhammad Aditya Ramdeni | Tinjauan Pustaka · Model Matematika · Parameter |
| 13523045 | Nadhif Radityo Nugroho | Hasil Simulasi · Analisis · Kesimpulan |
| 13523052 | Adhimas Aryo Bimo | Latar Belakang · Rumusan Masalah · Tujuan |

---

## Arsitektur Sistem

Arsitektur dua-tier dengan pemisahan yang jelas antara komputasi numerik (backend Python) dan visualisasi (frontend Next.js).

```
┌──────────────────────────────────┐         ┌──────────────────────────────────┐
│   FRONTEND (Next.js 16 + TS)     │         │   BACKEND (FastAPI + Python)     │
│                                  │         │                                  │
│  • Slider parameter kinetik      │  POST   │  api/routes.py                   │
│  • Grafik metabolit (Recharts)   │ ──────► │  schemas/simulation.py           │
│  • Diagram jalur SVG             │         │  services/simulation_service.py  │
│  • Panel status enzim            │ ◄────── │  models/ (HK · CS · ATPSynthase) │
│  • Tab pembanding 3 skenario     │  JSON   │  scipy.solve_ivp (RK45)          │
└──────────────────────────────────┘         └──────────────────────────────────┘
            :3000                                       :8000
```

**Alur eksekusi:**

1. Pengguna menggeser slider → debounce 300 ms.
2. Frontend mengirim `POST /api/simulate` dengan payload JSON (parameter + skenario).
3. FastAPI memvalidasi input via Pydantic schema.
4. `simulation_service.py` membangun model ODE dan memanggil `scipy.solve_ivp`.
5. 600 titik waktu dikembalikan sebagai array JSON.
6. Recharts merender grafik; komponen SVG memperbarui warna diagram jalur.

---

## Model Matematika

### Persamaan Hill (kinetika kooperatif)

$$
v = \frac{V_{\max} \cdot [S]^n}{K_{\frac{1}{2}}^n + [S]^n}
$$

- $n = 1$ — Michaelis-Menten (tanpa kooperativitas)
- $n = 2$ — respons sigmoid tajam (kooperatif, *switch-like*)
- $n > 2$ — semakin ultrasensitif

### Fungsi Inhibisi Umpan Balik

$$
f = \frac{K_i^m}{K_i^m + [I]^m}, \quad f \in [0, 1]
$$

Laju aktual enzim: $v_{\text{aktual}} = v \cdot f$.

### Sistem ODE (4 variabel state)

$$
\begin{aligned}
\frac{dG}{dt}  &= -v_{\text{HK}} \\
\frac{dAc}{dt} &= 2 \cdot v_{\text{HK}} - v_{\text{CS}} \\
\frac{dN}{dt}  &= 3 \cdot v_{\text{CS}} - v_{\text{ETC}} - 0.05 \cdot N \\
\frac{dA}{dt}  &= 2 \cdot v_{\text{HK}} + 2.5 \cdot v_{\text{ETC}} - 0.15 \cdot A
\end{aligned}
$$

| Variabel | Keterangan | Satuan |
|----------|-----------|--------|
| $G$ | Glukosa | mM |
| $Ac$ | Asetil-KoA | mM |
| $N$ | NADH | mM |
| $A$ | ATP | mM |

**Solver:** `scipy.solve_ivp` · metode RK45 · `rtol=1e-6`, `atol=1e-9` · 600 titik waktu.

### Parameter Kinetik

Sumber: BRENDA Enzyme Database (Chang et al., 2021), OpenStax Biology 2e, Cornish-Bowden (2015).

| Enzim | $V_{\max}$ (mM/s) | $K_{\frac{1}{2}}$ (mM) | $K_i$ (mM) | $n$ (Hill) |
|-------|------------------|------------------------|-----------|-----------|
| Heksokinase (HK) | 1.0 | 0.5 | $K_{i,\text{ATP}}$ = 2.0 | 2.0 |
| Sitrat Sintase (CS) | 0.8 | 0.3 | $K_{i,\text{NADH}}$ = 0.8 | 2.0 |
| ATP Sintase | 1.5 | 0.5 | $A_{\max}$ = 8.0 | 1.5 |

### Kondisi Awal Simulasi

| Variabel | Nilai |
|----------|-------|
| Glukosa ($G_0$) | 5.0 mM |
| Asetil-KoA ($Ac_0$) | 0.1 mM |
| NADH ($N_0$) | 0.05 mM |
| ATP ($A_0$) | 1.0 mM |
| Durasi simulasi | 120 detik |

---

## Skenario Biologis

| Parameter | Normal (Sehat) | No Regulation (Warburg) | Partial (Penyakit) |
|-----------|----------------|-------------------------|--------------------|
| Koefisien Hill $n$ | 2.0 | 1.0 | 1.5 |
| Inhibisi aktif | Ya | Tidak | Ya (lemah) |
| $K_{i,\text{ATP}}$ (mM) | 2.0 | — | 4.0 |
| $K_{i,\text{NADH}}$ (mM) | 0.8 | — | 1.6 |
| Representasi | Sel tubuh normal | Sel kanker (efek Warburg) | Mitokondriopati / mutasi |

- **Normal** — regulasi alosterik aktif penuh; baseline sel sehat dengan kontrol metabolisme utuh.
- **No Regulation** — inhibisi dinonaktifkan ($f = 1$ selalu); mereplikasi sel kanker yang kehilangan kontrol alosterik (efek Warburg, 1956).
- **Partial** — regulasi masih ada tetapi ambang sensitivitas dua kali lebih tinggi; merepresentasikan enzim bermutasi pada penyakit mitokondria.

---

## Struktur Direktori

```
KomputasiDomainSpesifik/
├── docker-compose.yml          # Orkestrasi multi-container
├── README.md
└── src/
    ├── backend/                # FastAPI + SciPy
    │   ├── Dockerfile
    │   ├── pyproject.toml
    │   ├── main.py             # Entry point Uvicorn
    │   ├── api/routes.py       # Endpoint /api/simulate, /api/presets
    │   ├── models/             # Definisi enzim & jalur metabolik
    │   │   ├── enzyme.py       # Persamaan Hill & inhibisi
    │   │   ├── glycolysis.py   # Heksokinase
    │   │   └── krebs.py        # Sitrat Sintase
    │   ├── schemas/            # Pydantic schemas (request/response)
    │   └── services/           # Logika ODE & solver
    │
    └── frontend/               # Next.js 16 + Recharts
        ├── Dockerfile
        ├── package.json
        ├── app/                # App Router (layout, page, globals)
        ├── components/         # SimulationApp, ATPChart, dll.
        ├── config/             # Konstanta simulasi
        ├── hooks/              # useSimulation
        ├── services/api.ts     # Klien fetch ke backend
        ├── types/              # TypeScript types
        └── utils/              # chartData, inhibition helpers
```

---

## Persyaratan Sistem

**Untuk menjalankan dengan Docker (direkomendasikan):**
- Docker Engine ≥ 24.0
- Docker Compose ≥ 2.20

**Untuk menjalankan secara manual (development):**
- Python ≥ 3.13 dengan [`uv`](https://docs.astral.sh/uv/) atau pip
- Node.js ≥ 20 dengan npm / pnpm / yarn

---

## Cara Menjalankan

### 1. Docker Compose (one-command setup)

```bash
docker compose up --build
```

Akses layanan:

| Layanan | URL |
|---------|-----|
| Frontend (UI simulasi) | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Health check | http://localhost:8000/health |
| Dokumentasi API (Swagger) | http://localhost:8000/docs |

Hentikan dengan `Ctrl+C`, lalu `docker compose down` untuk membersihkan container.

### 2. Manual — Backend

```bash
cd src/backend

# Dengan uv (direkomendasikan)
uv sync
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Atau dengan pip
python -m venv .venv
.venv\Scripts\Activate         # Windows
source .venv/bin/activate      # Linux / macOS
pip install -e .
uvicorn main:app --reload --port 8000
```

### 3. Manual — Frontend

```bash
cd src/frontend
npm install
npm run dev
```

Buka http://localhost:3000.

> Pastikan variabel `NEXT_PUBLIC_API_BASE_URL` mengarah ke backend (default: `http://localhost:8000/api`).

---

## Dokumentasi API

### `POST /api/simulate`

Menjalankan simulasi ODE dengan parameter yang diberikan.

**Request body:**

```json
{
  "glucose_init": 5.0,
  "atp_init": 1.0,
  "o2_level": 1.0,
  "ki_atp": 2.0,
  "ki_nadh": 0.8,
  "hill_n": 2.0,
  "scenario": "normal",
  "t_end": 120.0
}
```

**Response:**

```json
{
  "t": [0.0, 0.2, 0.4, "..."],
  "glucose": ["..."],
  "ac_coa": ["..."],
  "nadh": ["..."],
  "atp": ["..."],
  "inhibition": {
    "hexokinase": ["..."],
    "citrate_synthase": ["..."]
  },
  "summary": {
    "atp_max": 6.178,
    "atp_steady_state": 0.012,
    "glucose_remaining": 0.0062,
    "time_to_peak": 18.2
  }
}
```

**Batasan parameter (Pydantic validation):**

| Field | Min | Max | Default |
|-------|-----|-----|---------|
| `glucose_init` | 0.1 | 20.0 | 5.0 |
| `atp_init` | 0.0 | 5.0 | 1.0 |
| `o2_level` | 0.0 | 1.0 | 1.0 |
| `ki_atp` | 0.1 | 10.0 | 2.0 |
| `ki_nadh` | 0.1 | 5.0 | 0.8 |
| `hill_n` | 1.0 | 4.0 | 2.0 |
| `t_end` | 10.0 | 300.0 | 120.0 |
| `scenario` | `normal` \| `no_regulation` \| `partial` | | `normal` |

### `GET /api/presets`

Mengembalikan parameter preset untuk ketiga skenario (`normal`, `no_regulation`, `partial`).

### `GET /health`

Health check endpoint untuk Docker.

---

## Hasil Simulasi

| Skenario | ATP Puncak (mM) | Waktu ke Puncak (s) | Glukosa Sisa (mM) |
|----------|----------------|---------------------|-------------------|
| Normal (sel sehat) | **6.178** | 18.2 | 0.0062 |
| No Regulation (Warburg) | **8.095** | 5.2 | 0.0000 |
| Partial (penyakit) | **6.883** | 8.8 | 0.0001 |

**Temuan utama:**

1. **Kooperativitas ($n=2$) menciptakan respons ultrasensitif** — gradien Hill yang tajam memungkinkan kontrol metabolisme yang tegas, bukan proporsional lemah. Konsisten dengan teori ultrasensitivitas Goldbeter & Koshland (1981).
2. **Regulasi alosterik menghemat substrat** — sel normal menyisakan glukosa, sel Warburg menghabiskannya total — mereproduksi observasi efek Warburg (1956).
3. **Pola *boom-bust* tanpa regulasi** — Warburg mencapai puncak ATP tertinggi paling cepat lalu runtuh; sistem tanpa umpan balik tidak dapat mempertahankan keseimbangan.

**Pola dinamika temporal:**

- **ATP** — naik cepat menuju puncak, lalu turun ke ~0 saat glukosa habis.
- **NADH** — puncak lebih awal dari ATP; turun saat kapasitas reduktif terkuras.
- **Glukosa** — turun monoton; skenario Normal paling lambat.
- **Asetil-KoA** — naik dari glikolisis, lalu turun saat dikonsumsi siklus Krebs.

**Keterbatasan model:**

- Model *batch* tertutup — tidak ada aliran glukosa masuk seperti kondisi *in vivo*.
- Stoikiometri disederhanakan (koefisien 2.5 untuk ATP Sintase adalah aproksimasi).
- Tidak mencakup jalur pentosa fosfat, siklus glioksilat, atau regulasi transkripsi.

---

## Referensi

- Berg, J. M., Tymoczko, J. L., & Stryer, L. *Biochemistry* (W. H. Freeman).
- Chang, A., et al. (2021). *BRENDA, the ELIXIR core data resource in 2021*. Nucleic Acids Research, 49(D1).
- Cornish-Bowden, A. (2015). *One hundred years of Michaelis-Menten kinetics*. Perspectives in Science, 4.
- Fell, D. A. (1992). *Metabolic control analysis: a survey of its theoretical and experimental development*. Biochemical Journal, 286.
- Goldbeter, A., & Koshland, D. E. (1981). *An amplified sensitivity arising from covalent modification in biological systems*. PNAS, 78(11).
- Heinrich, R., & Rapoport, T. A. (1974). *A linear steady-state treatment of enzymatic chains*. European Journal of Biochemistry, 42(1).
- OpenStax. *Biology 2e* (2022).
- Warburg, O. (1956). *On the origin of cancer cells*. Science, 123(3191).

---

<div align="center">

**Repository:** https://github.com/ryonlunar/KomputasiDomainSpesifik

Dibuat untuk memenuhi tugas besar **IF3211 Komputasi Domain Spesifik**
Program Studi Teknik Informatika · Institut Teknologi Bandung · 2026

</div>
