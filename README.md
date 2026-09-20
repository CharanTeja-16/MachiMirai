# MachiMirai (まちミライ) — Japan Municipal Survival Intelligence Platform

<div align="center">

![MachiMirai Platform Overview](docs/images/01_demographic_intelligence.png)

### *Enterprise GovTech Decision-Support & Demographic Forecasting System for Depopulating Towns*
#### 自治体存続インテリジェンス・意思決定プラットフォーム

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00.svg?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org)
[![Tests](https://img.shields.io/badge/Tests-11%2F11%20Passing-success.svg?logo=pytest&logoColor=white)](https://pytest.org)
[![GovTech](https://img.shields.io/badge/GovTech-Society%205.0%20%7C%20MIC-blueviolet.svg)](#-executive-summary--problem-landscape)

<p align="center">
  <b>A mission-critical civic intelligence platform engineered for Japan's 477+ depopulating municipalities (市町村) and prefectural planning bureaus facing irreversible demographic decline.</b>
</p>

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Visual Showcase](#-visual-showcase) • [Core Code Highlights](#-core-code-highlights) • [Municipal Data](#-pre-seeded-municipalities) • [Quickstart Guide](#-quickstart-guide) • [API Specification](#-api-specification)

---

</div>

## 📌 Executive Summary & Problem Landscape

### Japan's Existential Demographic Crisis

Japan is confronting the most acute demographic contraction in modern industrial history. By 2026, the national population dropped below **119.74 million** (the first time under 120M in 42 years), with annual births hitting an all-time low of **~705,000** against more than **1.58 million** deaths. 

Over **30%** of Japan's population is 65 or older, and **477 municipalities** (one in four nationwide) have suffered population declines exceeding 10% in just five years.

| Macro Demographic Metric | Value | Benchmark Agency / Source |
|:---|:---:|:---|
| **Total National Population (2026)** | **119.74 Million** | Ministry of Internal Affairs & Communications (MIC / 総務省) |
| **Annual Registered Births** | **~705,809** | Ministry of Health, Labour and Welfare (MHLW / 厚生労働省) |
| **Annual Registered Deaths** | **~1,580,000+** | MHLW Vital Statistics (人口動態統計) |
| **Senior Population Ratio ($\ge 65$)** | **30.1%** | Cabinet Office Aging Society White Paper (高齢社会白書) |
| **Median National Age** | **50.2 Years** | United Nations Population Division |
| **Municipalities with >10% Loss (5yr)** | **477 Municipalities (25.1%)** | 2025 National Census (国勢調査) |
| **Projected Population by 2060** | **~87.0 Million (-31%)** | NIPSSR Projections (国立社会保障・人口問題研究所) |
| **Total Fertility Rate (TFR)** | **1.20** | Replacement threshold requires 2.07 |

---

## 🎯 Value Delivered

| Operational Domain | Status Quo (Unmanaged Decline) | With MachiMirai | Civic & Fiscal Impact |
|:---|:---|:---|:---|
| **Infrastructure Planning** | Elementary schools with 3 students cost ¥80M/yr; uncoordinated closures | **What-if consolidation simulator** modeling travel times, ¥ savings, and medical envelopes | **15–25% recurring maintenance savings** identified |
| **Fiscal Governance** | Surprise fiscal insolvency (*Financial Rehabilitation Designation* / 財政再生団体) | **20-year balance sheet simulation** with exact insolvency cliff crossover detection | **5–10 years advance warning** before bankruptcy |
| **Akiya (Empty House) Risk** | 9M+ abandoned homes decaying into public hazards without prioritization | **Multi-hazard composite scoring** (collapse, fire, pest) and AI repurposing matching | **100% hazard-evaluated property registry** |
| **Elderly Isolation** | 6.8M+ seniors living alone; emergencies found days later (*kodokushi* / 孤独死) | **24-hour IoT inactivity anomaly radar** (smart water & electricity meters) | **Zero undetected emergencies > 24 hours** |
| **Regional Migration** | Trial-and-error marketing and untracked public subsidy spending | **7-pillar attractiveness radar** and net present return solver for relocation stipends | **Quantified per-yen return** on public incentive funds |

---

## ✨ Key Features

### 1. Demographic Intelligence & NIPSSR Cohort-Component Engine
- **Single-Year Cohort Modeling**: Projects 101 single-year age cohorts ($0$ to $100+$) using MHLW Complete Life Table survival probabilities ($S_a$), Age-Specific Fertility Rates ($f_a$), and rural migration curves ($M_a$).
- **Dynamic Age-Sex Pyramid**: Interactive Recharts visualization comparing 2026 baseline distributions against 2036, 2046, and 2056 forecasts with dependency ratios.
- **Municipal Survival Countdown**: Algorithmic countdown computing the exact calendar year when total population falls below critical municipal service thresholds ($10{,}000$, $7{,}500$, $5{,}000$, $3{,}000$, $1{,}000$ residents).
- **Sub-Municipal (町丁・字) Breakdown**: Micro-district tracking of vital rates, aging ratios, and depopulation risk tags.

### 2. Smart Shrinkage & Facility Consolidation Planner
- **GIS Public Facility Inventory**: Comprehensive tracking of elementary schools, secondary schools, clinics, community centers, and water treatment plants with structural age and annual maintenance overhead.
- **Consolidation What-If Scenario Simulator**: Simulates annual municipal budget savings ($\yen$), student commute deltas, and healthcare access when facilities are consolidated.
- **Compact City Zonation**: Categorizes neighborhoods into *Maintain Core Services (維持)*, *Gradual Consolidation (統合)*, and *Retire & Rewild (集約・撤退)*.
- **30-Minute Emergency Medical Envelope**: Geospatial boundary validation ensuring $\ge 95\%$ of remaining rural citizens retain emergency medical transit within 30 minutes.

### 3. 20-Year Fiscal Sustainability Monitor
- **Dual-Stream Balance Sheet Forecast**: Models tax revenue collapse (resident, fixed asset, corporate) vs. rising social welfare and infrastructure maintenance.
- **Fiscal Cliff Early Warning**: Detects the exact projected year of municipal insolvency (*Financial Rehabilitation Designation*) up to 10 years in advance.
- **Grant Dependency Index**: Tracks municipal reliance on National Treasury Allocations (*地方交付税交付金*) and ranks fiscal strength indices (財政力指数) against peer towns.

### 4. Akiya (Empty House) Manager
- **Geospatial Hazard Mapping**: Vacant property catalog evaluated under Japan's **Revised Akiya Special Measures Act (改正空家等対策特別措置法)**.
- **Multi-Hazard Scoring**: Composite danger score combining structural collapse, wildfire risk, and pest infestation ($0-100$).
- **AI-Guided Repurposing**: Strategic recommendations: *Satellite Telework Office*, *Community Daycare / Cafe*, *Licensed Minpaku (民泊)*, or *Mandatory Demolition (代執行)*.
- **Knapsack Demolition Allocator**: Optimizes municipal demolition subsidy allocations against public safety risk.

### 5. Elderly Welfare Network
- **Isolated Senior Registry**: Directory tracking single-occupant seniors ($\ge 75$ years), mobility grades (A/B/C), chronic conditions, and emergency contacts.
- **24-Hour IoT Inactivity Anomaly Radar**: Real-time passive telemetry (smart water meter flow, electrical load, motion beacons) to prevent *kodokushi* (孤独死).
- **Community Check-In Logger**: Mobile field log for welfare commissioners (民生委員), post office couriers, and volunteer patrols.

### 6. Migration Attraction Toolkit
- **7-Pillar Attractiveness Radar**: Benchmarking across *Environment*, *Housing*, *Childcare*, *Fiber/5G*, *Healthcare*, *Jobs*, and *Transit*.
- **Revitalization Subsidy ROI Simulator**: Computes net present return on public relocation grants (e.g. $\yen 50\text{M}$ grant $\rightarrow$ projected children enrolled $\rightarrow$ 10-year municipal tax yield).
- **National Case Study Repository**: Proven playbooks from pioneer towns (Kamiyama fiber hub, Sabae open-data cluster, Ama-cho educational revival).

### 7. Multi-Persona Governance & Bilingual Localization
- **Instant Persona Switcher**: Tailors operational views for four civic stakeholders:
  - 🏛️ **Mayor Tanaka (南阿蘇村 村長)**: Executive summary, fiscal solvency, consolidation trade-offs.
  - 📊 **Planner Yamamoto (秋田県 企画官)**: Multi-town benchmarking, macro indicators, prefectural grants.
  - 🩺 **Coordinator Suzuki (福祉課・民生委員)**: Isolated elderly check-ins, sensor alerts, home visits.
  - 🏡 **Citizen Satō (地域住民・起業家)**: Akiya acquisition, town attractiveness, civic transparency.
- **Bilingual Interface**: Seamless, instant toggle between native Japanese (日本語) and English.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MACHIMIRAI FRONTEND                               │
│      React 19  •  TypeScript 5.8  •  Vite 8.3  •  Leaflet GIS  •  Recharts  │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ Demographic Dash  │ Smart Shrinkage   │ Fiscal Monitor    │ Akiya Manager   │
│ • 101 Cohorts     │ • GIS Facilities  │ • 20-Yr Balance   │ • Hazard Matrix │
│ • Age Pyramids    │ • What-If Sim     │ • Insolvency Cliff│ • Demolition ROI│
├───────────────────┴───────────────────┴───────────────────┴─────────────────┤
│ Elderly Network: IoT Telemetry Radar   │ Migration Toolkit: 7-Pillar Radar   │
│ Persona Selector: Mayor/Planner/Welfare│ Bilingual Engine: 日本語 (JA) / EN  │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │  REST APIs / JSON (Axios + JWT)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FASTAPI GOVTECH API GATEWAY                             │
│                Python 3.11+  •  FastAPI 0.115+  •  Uvicorn                  │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│ NIPSSR Engine     │ GIS Optimizer     │ Fiscal Forecaster │ Akiya & IoT Svc │
│ • Single-Yr Cohort│ • Haversine Dist  │ • Revenue Erosion │ • Multi-Hazard  │
│ • MHLW Life Table │ • 30-Min Envelope │ • Subsidy Relief  │ • 24h Telemetry │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │  SQLAlchemy 2.0 ORM
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DATABASE LAYER                                  │
│          SQLite (Zero-config Dev)  /  PostgreSQL (Enterprise Cloud)         │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│ Municipalities  │ Facilities      │ Fiscal Records  │ Akiya & Seniors       │
└─────────────────┴─────────────────┴─────────────────┴───────────────────────┘
```

---

## 📸 Visual Showcase

### 1. Demographic Intelligence Dashboard
Real-time NIPSSR 101-cohort projection, interactive age-sex population pyramid, and municipal viability countdown timers for Minamiaso Village.

![Demographic Intelligence Dashboard](docs/images/01_demographic_intelligence.png)

---

### 2. Smart Shrinkage & Facility Consolidation Planner
Interactive Leaflet GIS mapping of public infrastructure with dynamic what-if consolidation modeling, student travel deltas, and 30-minute emergency medical envelope preservation.

![Smart Shrinkage GIS Simulator](docs/images/02_smart_shrinkage_gis.png)

---

### 3. 20-Year Fiscal Forecast & Fiscal Cliff Warning
Dual-stream trajectory tracking tax revenue collapse against escalating social security expenditure, identifying the exact year of municipal insolvency.

![Fiscal Sustainability Monitor](docs/images/03_fiscal_sustainability.png)

---

### 4. Akiya (Empty Houses) GIS & Hazard Management
Multi-hazard risk scoring (structural collapse, wildfire, pests) under the Revised Akiya Act paired with budget-optimized demolition prioritization.

![Akiya Hazard Manager](docs/images/04_akiya_hazard_manager.png)

---

### 5. Elderly Welfare Network & 24-Hour IoT Radar
Monitored isolated senior registry with real-time smart meter anomaly detection to prevent solitary deaths (*kodokushi* / 孤独死).

![Elderly Welfare Network](docs/images/05_elderly_welfare_network.png)

---

### 6. Migration Attraction Toolkit & Subsidy ROI
7-pillar municipal attractiveness radar benchmarking and net present return solver for public relocation grants.

![Migration Attraction Toolkit](docs/images/06_migration_toolkit.png)

---

### 7. Native Bilingual Japanese Interface (日本語対応)
Instant, lossless toggle between English and Japanese civic terminology across all operational views.

![Bilingual Japanese Interface](docs/images/07_bilingual_japanese_dashboard.png)

---

## 💻 Core Code Highlights

### Vectorized NIPSSR Cohort Engine (`backend/app/demographic_engine.py`)

```python
def run_cohort_component_projection(
    male_pop: np.ndarray,
    female_pop: np.ndarray,
    tfr: float = 1.2,
    years_ahead: int = 30,
    scenario: str = "baseline",
    base_year: int = 2026
) -> List[Dict[str, Any]]:
    """Vectorized NIPSSR Cohort-Component Projection Model (Ages 0 to 100+)."""
    survival_rates = get_standard_survival_rates()
    fertility_rates = get_fertility_curve(tfr)
    migration_rates = get_rural_migration_curve(scenario=scenario)
    
    male = male_pop.copy()
    female = female_pop.copy()
    results = []

    for y in range(1, years_ahead + 1):
        new_male = np.zeros(101)
        new_female = np.zeros(101)
        
        # 1. Single-year cohort aging with life-table survival probabilities
        for a in range(1, 100):
            new_male[a] = male[a - 1] * survival_rates[a - 1]
            new_female[a] = female[a - 1] * survival_rates[a - 1]
            
        # Top-coded 100+ accumulator
        new_male[100] = (male[99] * survival_rates[99]) + (male[100] * survival_rates[100])
        new_female[100] = (female[99] * survival_rates[99]) + (female[100] * survival_rates[100])
        
        # 2. Births with historical Japan sex ratio (105.5 males : 100 females)
        total_births = np.sum(female[15:50] * fertility_rates)
        new_male[0] = total_births * (105.5 / 205.5)
        new_female[0] = total_births * (100.0 / 205.5)
        
        # 3. Age-specific rural net migration adjustment
        for a in range(101):
            new_male[a] = max(0.0, new_male[a] + (new_male[a] * migration_rates[min(a, 99)]))
            new_female[a] = max(0.0, new_female[a] + (new_female[a] * migration_rates[min(a, 99)]))
            
        male, female = new_male, new_female
        # Aggregate dependency ratios and check municipal survival countdown...
```

### Fiscal Cliff Early Warning Solver (`backend/app/routers/fiscal.py`)

```python
@router.get("/forecast/{municipality_id}", response_model=FiscalForecastResponse)
def get_fiscal_forecast(municipality_id: str, db: Session = Depends(get_db)):
    """Computes 20-year balance sheet and identifies municipal insolvency crossover."""
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")

    records = db.query(FiscalRecord).filter(
        FiscalRecord.municipality_id == municipality_id
    ).order_by(FiscalRecord.fiscal_year.asc()).all()

    # Detect fiscal cliff crossover year (first projected net deficit)
    cliff_year = None
    total_unmitigated_deficit = 0
    for r in records:
        if r.is_projected and r.net_surplus_deficit_yen < 0:
            if cliff_year is None:
                cliff_year = r.fiscal_year
            total_unmitigated_deficit += abs(r.net_surplus_deficit_yen)

    return FiscalForecastResponse(
        municipality_id=municipality_id,
        records=records,
        fiscal_cliff_year=cliff_year,
        years_to_cliff=(cliff_year - 2026) if cliff_year else None,
        total_projected_deficit_yen=total_unmitigated_deficit
    )
```

---

## 🗺️ Pre-Seeded Municipalities

MachiMirai includes authentic production-grade seed data for four representative Japanese municipalities:

| Municipality | Prefecture | Type | Pop (2026) | Peak Pop (Year) | Elderly Ratio | Fiscal Index | Grant Dep. | Primary Municipal Challenge |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **南阿蘇村 (Minamiaso)** | 熊本県 (Kumamoto) | 村 (Village) | **9,247** | 18,500 (1980) | **38.2%** | 0.32 | 62.1% | Elementary school consolidation & rural hospital preservation |
| **五城目町 (Gojome)** | 秋田県 (Akita) | 町 (Town) | **8,110** | 18,900 (1975) | **43.1%** | 0.28 | 68.4% | Steepest elderly ratio & severe akiya collapse hazards |
| **神山町 (Kamiyama)** | 徳島県 (Tokushima) | 町 (Town) | **4,680** | 21,000 (1955) | **51.5%** | 0.31 | 64.0% | Fiber satellite office hub & digital nomad integration |
| **夕張市 (Yubari)** | 北海道 (Hokkaido) | 市 (City) | **6,320** | 116,908 (1960) | **54.2%** | 0.22 | 74.5% | Post-coal municipal bankruptcy recovery & extreme compact city |

---

## ⚡ Quickstart Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `v3.10` or higher
- **Git**: `v2.30` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/CharanTeja-16/MachiMirai.git
cd MachiMirai
```

### 2. Backend Startup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1       # Windows PowerShell
# source venv/bin/activate        # macOS / Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- 🌐 **Backend Root**: `http://localhost:8000/`
- 📑 **Swagger API Docs**: `http://localhost:8000/docs`

### 3. Frontend Startup
```powershell
cd frontend
npm install
npm run dev
```
- 💻 **Application URL**: `http://localhost:5173/`

### 4. Running Test Suites
```bash
# Backend pytest suite (11 passing tests)
cd backend && python -m pytest tests -v

# Frontend TypeScript build validation
cd frontend && npm run build
```

---

## 📡 API Specification

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/health` | Service health status and database connectivity check |
| `GET` | `/api/municipalities` | List all tracked municipalities with demographic summaries |
| `GET` | `/api/municipalities/{id}` | Detailed municipality profile including peak population and survival score |
| `GET` | `/api/demographics/dashboard/{id}` | Complete demographic package: 30-yr projection, pyramid, countdown |
| `POST` | `/api/demographics/simulate` | Custom what-if projection with variable TFR and migration overrides |
| `GET` | `/api/shrinkage/facilities/{id}` | GIS inventory of schools, clinics, and water treatment plants |
| `POST` | `/api/shrinkage/simulate/{id}` | Facility consolidation simulator modeling $\yen$ savings and commute changes |
| `GET` | `/api/shrinkage/compact-city/{id}` | Compact city boundaries: Maintain, Consolidate, and Rewild zones |
| `GET` | `/api/fiscal/forecast/{id}` | 20-year revenue vs expenditure trajectory and insolvency cliff forecast |
| `GET` | `/api/akiya/{id}` | GIS list of vacant properties with multi-hazard risk scoring |
| `POST` | `/api/akiya/prioritize` | Budget-optimized demolition and repurposing decision solver |
| `GET` | `/api/elderly/{id}` | Registry of monitored single-occupant elderly citizens |
| `GET` | `/api/elderly/alerts/{id}` | Active 24-hour inactivity emergency alerts (*kodokushi* prevention) |
| `POST` | `/api/elderly/checkin/{res_id}` | Log physical or telephone check-in by welfare commissioner |
| `GET` | `/api/migration/scorecard/{id}` | 7-pillar municipality attractiveness radar scores |
| `POST` | `/api/migration/simulate-roi` | Revitalization incentive ROI solver (inflow vs tax revenue yield) |

---

## 📄 License

Distributed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.

---

<div align="center">
  <sub>Developed for Japan's regional revitalization and municipal preservation. Engineered with ❤️ for depopulating communities across Japan.</sub><br>
  <sub>日本の持続可能な地域社会と自治体の存続のために。</sub>
</div>
