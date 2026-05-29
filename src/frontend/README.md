# SimuCell-Allosteric — Frontend

Antarmuka web interaktif berbasis **Next.js 16 + TypeScript + Recharts** untuk eksplorasi parameter simulasi regulasi alosterik enzim. Bagian ini hanya membahas frontend; untuk konteks proyek lengkap lihat [README utama](../../README.md).

---

## Stack

- **Next.js** 16 (App Router) · **React** 19 · **TypeScript** 5
- **Tailwind CSS** v4 — styling utility-first
- **Recharts** 3 — grafik dinamika metabolit
- **Node.js** ≥ 20

---

## Struktur

```
frontend/
├── app/                       # App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/                # Komponen UI
│   ├── SimulationApp.tsx      # Komponen root
│   ├── SimulationControls.tsx # Slider parameter
│   ├── ATPChart.tsx           # Grafik metabolit
│   ├── PathwayDiagram.tsx     # Diagram jalur SVG
│   ├── EnzymeStatus.tsx       # Panel status inhibisi
│   ├── ScenarioPanel.tsx
│   ├── SingleScenarioView.tsx
│   ├── CompareScenarioView.tsx
│   ├── SummaryStats.tsx
│   ├── TabSwitcher.tsx
│   └── AppHeader.tsx
├── hooks/
│   └── useSimulation.ts       # State + fetch + debounce 300 ms
├── services/
│   └── api.ts                 # Klien fetch ke backend
├── config/
│   └── simulation.ts          # Konstanta parameter UI
├── types/
│   └── simulation.ts          # TypeScript types (mirror backend)
└── utils/
    ├── chartData.ts
    └── inhibition.ts
```

---

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Variabel Environment

| Nama | Default | Keterangan |
|------|---------|-----------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8000/api` | Base URL backend FastAPI |

Atur saat build untuk Docker:

```bash
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api -t simucell-frontend .
docker run -p 3000:3000 simucell-frontend
```

### Skrip npm

| Skrip | Deskripsi |
|-------|-----------|
| `npm run dev`   | Development server (hot reload) |
| `npm run build` | Build production |
| `npm run start` | Jalankan build production |
| `npm run lint`  | ESLint |

---

## Catatan Pengembangan

- **Debouncing 300 ms** pada perubahan slider — mencegah panggilan `/api/simulate` berlebih.
- Tipe response backend di-mirror di [`types/simulation.ts`](types/simulation.ts) agar tetap selaras dengan Pydantic schema.
- Mode pembanding (`CompareScenarioView`) menjalankan tiga request paralel untuk merender skenario *Normal*, *No Regulation*, dan *Partial* berdampingan.
