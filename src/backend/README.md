# SimuCell-Allosteric — Backend

Layanan API berbasis **FastAPI + SciPy** yang menjalankan simulasi sistem ODE untuk regulasi alosterik enzim pada jalur respirasi seluler. Bagian ini hanya membahas backend; untuk konteks proyek lengkap lihat [README utama](../../README.md).

---

## Stack

- **Python** ≥ 3.13
- **FastAPI** 0.136 — web framework & validasi Pydantic
- **SciPy** 1.17 — solver ODE (`solve_ivp`, RK45)
- **NumPy** 2.4
- **Uvicorn** — ASGI server
- **uv** — package manager (direkomendasikan)

---

## Struktur

```
backend/
├── main.py                      # Entry point Uvicorn + mount router
├── pyproject.toml               # Dependensi (uv / pip)
├── Dockerfile
├── api/
│   └── routes.py                # POST /api/simulate, GET /api/presets
├── schemas/
│   └── simulation.py            # Pydantic request/response schemas
├── services/
│   └── simulation_service.py    # Build ODE & panggil solve_ivp
└── models/
    ├── enzyme.py                # Persamaan Hill & fungsi inhibisi
    ├── glycolysis.py            # Heksokinase
    └── krebs.py                 # Sitrat Sintase
```

---

## Menjalankan

### Dengan `uv` (direkomendasikan)

```bash
uv sync
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Dengan `pip` + virtualenv

```bash
python -m venv .venv

# Windows
.venv\Scripts\Activate
# Linux / macOS
source .venv/bin/activate

pip install -e .
uvicorn main:app --reload --port 8000
```

### Dengan Docker

```bash
docker build -t simucell-backend .
docker run -p 8000:8000 simucell-backend
```

---

## Endpoint

| Method | Path | Deskripsi |
|--------|------|-----------|
| `POST` | `/api/simulate` | Menjalankan simulasi ODE |
| `GET`  | `/api/presets`  | Parameter preset 3 skenario |
| `GET`  | `/health`       | Health check (Docker) |
| `GET`  | `/docs`         | Swagger UI |
| `GET`  | `/redoc`        | ReDoc |

Detail skema request/response ada di [README utama → Dokumentasi API](../../README.md#dokumentasi-api).

---

## Catatan Pengembangan

- Solver: `scipy.solve_ivp` metode `RK45`, `rtol=1e-6`, `atol=1e-9`, 600 titik waktu.
- Validasi input dilakukan oleh Pydantic — rentang setiap field didefinisikan di [`schemas/simulation.py`](schemas/simulation.py).
- Backend bersifat *stateless* — setiap request membawa parameter simulasi lengkap.
