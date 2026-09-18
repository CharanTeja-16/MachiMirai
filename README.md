# MachiMirai (まちミライ)
### Japan Municipal Survival Intelligence Platform for Depopulating Towns
### 自治体存続インテリジェンス・プラットフォーム

MachiMirai is an enterprise GovTech decision-support platform designed for Japan's 477+ depopulating municipalities (市町村) and prefectural planners facing demographic collapse.

---

## 🏛️ System Overview

1. **Demographic Intelligence Dashboard (P0)**:
   - Cohort-component projection model (NIPSSR standard methodology) for 101 single-year age cohorts (0 to 100+).
   - Interactive age-sex population pyramid with 2026 baseline vs 2036/2046/2056 forecasts.
   - Demographic countdown solvers for municipal population threshold alerts.
   - Neighborhood (町丁) statistics and prefectural/national benchmark comparisons.

2. **Smart Shrinkage Planner (P0)**:
   - GIS public facility inventory (schools, hospitals, clinics, community centers, water plants, bridges).
   - What-if consolidation scenario simulator with ¥-denominated annual cost savings, student travel time deltas, and 30-minute hospital coverage maintenance.
   - Compact city visualizer (maintain, consolidate, retire zones) and 10-year transition roadmap.

3. **Fiscal Sustainability Monitor (P1)**:
   - 20-year revenue vs expenditure area chart tracking tax decline vs surging elderly welfare upkeep.
   - Fiscal cliff early warning detector identifying exact year of insolvency.
   - Grant dependency tracking and peer town fiscal independence comparison (財政力指数).

4. **Akiya (Empty House) Manager (P1)**:
   - GIS map of vacant properties with structural collapse, fire, and pest hazard scoring.
   - AI repurposing recommendation engine (coworking hub, community cafe, minpaku, or demolition).
   - Budget-optimized demolition priority solver and owner outreach management.

5. **Elderly Welfare Network (P1)**:
   - Isolated elderly registry tracking health tags, mobility, and emergency contacts.
   - 24-hour IoT inactivity emergency detection to prevent solitary deaths (*kodokushi* / 孤独死).
   - Water smart meter and electricity telemetry anomaly sparklines.
   - Volunteer and welfare coordinator in-person check-in logging.

6. **Migration Attraction Toolkit (P2)**:
   - 7-point town attractiveness scorecard radar chart (nature, housing, childcare, digital, medical, jobs, transit).
   - Public investment ROI simulator quantifying families attracted, children enrolled, and 10-year local tax revenue yields.
   - Curated success case studies (Kamiyama, Sabae, Ama-cho) and digital nomad package customizer.

7. **Multi-Persona & Bilingual UI**:
   - Persona Switcher: Mayor Tanaka (南阿蘇村 村長), Officer Yamamoto (秋田県 企画官), Coordinator Suzuki (福祉課), Citizen Sato.
   - Full bilingual Japanese (日本語) and English localization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start Backend API
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API URL: `http://localhost:8000/api`
- Swagger Documentation: `http://localhost:8000/docs`

### 2. Start Frontend UI
```powershell
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173/`

### 3. Run Backend Test Suite
```powershell
cd backend
$env:PYTHONPATH="."
python -m pytest tests -v
```

### 4. Build Frontend for Production
```powershell
cd frontend
npm run build
```

---

## 📁 Repository Structure

```text
MachiMirai/
├── MachiMirai.md              # Authoritative specification document
├── README.md                  # Project documentation & quickstart
├── package.json               # Monorepo orchestration scripts
├── .gitignore                 # Dependencies & artifact filters
│
├── backend/                   # Python FastAPI Backend
│   ├── app/
│   │   ├── demographic_engine.py  # NIPSSR Cohort-Component model
│   │   ├── database.py            # SQLite / SQLAlchemy configuration
│   │   ├── models.py              # ORM entities (Muni, Facility, Akiya, Elderly, Fiscal)
│   │   ├── schemas.py             # Pydantic request/response schemas
│   │   ├── seed.py                # Japanese municipal dataset seeder
│   │   ├── main.py                # FastAPI entry point & CORS
│   │   └── routers/               # API route handlers
│   │       ├── auth.py
│   │       ├── municipalities.py
│   │       ├── demographics.py
│   │       ├── shrinkage.py
│   │       ├── fiscal.py
│   │       ├── akiya.py
│   │       ├── elderly.py
│   │       └── migration.py
│   ├── tests/                 # Unit & integration tests (pytest)
│   └── requirements.txt
│
└── frontend/                  # React 19 + TypeScript + Vite
    ├── src/
    │   ├── App.tsx            # Main application coordinator
    │   ├── api.ts             # Typed REST client
    │   ├── i18n.ts            # Japanese & English translation dictionary
    │   ├── index.css          # GovTech dark obsidian design system
    │   └── components/        # Feature modules
    │       ├── Navbar.tsx
    │       ├── Sidebar.tsx
    │       ├── DemographicDashboard.tsx
    │       ├── ShrinkagePlanner.tsx
    │       ├── FiscalMonitor.tsx
    │       ├── AkiyaManager.tsx
    │       ├── ElderlyNetwork.tsx
    │       └── MigrationToolkit.tsx
    └── package.json
```
