# Project 18: MachiMirai (まちミライ) — Japan Municipal Survival Intelligence Platform for Depopulating Towns

## 🎯 Project Overview

| Field | Details |
|:---|:---|
| **Project Name** | MachiMirai (まちミライ — "Town Future") |
| **Domain** | GovTech / Civic Tech / Demographic Intelligence |
| **Problem Space** | Municipal Depopulation Management, Smart Shrinkage & Service Optimization |
| **Target Users** | Japanese Municipal Governments (市町村), Prefectural Planners, MIC (Ministry of Internal Affairs), Regional Revitalization Teams |
| **Market Size** | Japan GovTech: ¥2.3T ($15B, 2026); Digital Garden City: ¥1.2T national investment |
| **Complexity Level** | High — demographic modeling, geospatial planning, multi-stakeholder |
| **Estimated Build Time** | 2 weeks |

---

## 📌 The Real-World Problem

### Industry Context — Japan's Existential Crisis

Japan is facing the most severe demographic collapse of any major economy in modern history. This isn't a future problem — it's happening NOW:

| Statistic | Value | Source |
|:---|:---|:---|
| National population (Jan 2026) | **119.74 million** (below 120M for first time in 42 years) | MIC |
| Births in 2025 | **705,809** (record low) | MHLW |
| Deaths in H1 2026 | **778,000+** (exceeding births by massive margin) | MHLW |
| Population aged 65+ | **30%+** (world's oldest society) | Cabinet Office |
| Median age | **50.2 years** (2nd oldest globally) | UN |
| Municipalities with >10% decline (5yr) | **477** (25% of all municipalities) | 2025 Census |
| Projected population 2060 | **~87 million** (31% decline from peak) | NIPSSR |
| Total Fertility Rate (TFR) | **1.2** (needs 2.1 for replacement) | MHLW |

### What "Depopulation" Actually Looks Like

This isn't abstract — it's visceral:

- **Schools closing** — Entire elementary schools shut down because there are 3 students left
- **Hospitals disappearing** — Rural hospitals close; nearest medical care is 2 hours away
- **Infrastructure crumbling** — Roads, bridges, water systems built for 50,000 people now serve 8,000 — maintenance is financially impossible
- **Public transport vanishing** — Bus routes cancelled; elderly trapped without mobility
- **Tax revenue collapsing** — Fewer taxpayers but same infrastructure costs → municipal bankruptcy risk
- **Empty houses multiplying** — 9+ million "akiya" (abandoned houses) nationwide → safety and fire hazards
- **Knowledge extinction** — Last farmer, last craftsman, last doctor leaves → institutional knowledge lost forever

### The Pain Points for Municipal Governments

| Pain Point | Impact | Scale |
|:---|:---|:---|
| **No predictive planning tools** | Mayors plan for next year, not next decade; no population projections per neighborhood | 477+ declining municipalities |
| **Service delivery imbalance** | Maintaining 100% infrastructure for 50% population → massive waste | ¥5-10T annual excess infrastructure cost |
| **Fiscal cliff blindness** | Tax revenue declining but expenditure fixed; no early warning of insolvency | 40%+ of small towns face fiscal stress |
| **Scattered data silos** | Population data, infrastructure data, health data, education data in separate ministries | Zero integrated view |
| **No "smart shrinkage" playbook** | Municipalities know they must shrink but have no decision-support tools | Emotional/political resistance to shrinkage |
| **Akiya (empty house) crisis** | 9M+ abandoned properties; fire hazard, property value depression | Growing by 300K+/year |
| **Elderly isolation** | 6.8M+ elderly living alone; health emergencies discovered days later | Leading cause of "kodokushi" (lonely deaths) |
| **Migration strategy gap** | Towns want to attract young families but can't quantify what to offer or where to invest | Trial-and-error with public funds |

### Government Response

| Initiative | What It Does | Gap |
|:---|:---|:---|
| **Regional Revitalization 2.0** | National strategy for managing population decline | Policy framework, not a tool |
| **Digital Garden City Nation** | Digital infrastructure for rural revitalization | Infrastructure, not analytics |
| **Government Cloud** | Standardized municipal IT systems | Backend modernization, not decision-support |
| **Project PLATEAU** | 3D digital twin of Japanese cities | Visualization, not demographic intelligence |
| **Society 5.0** | AI/IoT integration vision | Vision, not operational platform |

---

## 🎯 Goals & Objectives

### Primary Goal
Build a **Municipal Survival Intelligence Platform** that gives depopulating Japanese towns a data-driven decision-support system — projecting population changes at the neighborhood level, modeling infrastructure consolidation scenarios, tracking fiscal sustainability, managing the akiya crisis, monitoring elderly welfare, and providing evidence-based "smart shrinkage" playbooks.

### SMART Objectives

| Objective | Metric | Target |
|:---|:---|:---|
| Population forecasting | Neighborhood-level projections (10/20/30 year) | > 90% accuracy (vs. NIPSSR models) |
| Infrastructure optimization | Cost reduction from consolidation modeling | 15-25% infrastructure savings identified |
| Fiscal early warning | Years of advance warning for fiscal stress | 5+ years ahead |
| Akiya management | Empty houses mapped and tracked | 100% coverage per municipality |
| Elderly welfare | Isolated elderly monitored | Zero undetected emergencies > 24 hours |
| Migration strategy | Measurable ROI of attraction investment | Per-yen impact quantified |

---

## 📋 Product Requirements Document (PRD)

### 1. Executive Summary

MachiMirai is a "Municipal Survival Dashboard" for Japan's 477+ depopulating towns. It provides: (1) **Demographic Intelligence** — neighborhood-level population projections integrating birth/death/migration data; (2) **Smart Shrinkage Planner** — infrastructure consolidation scenario modeling (schools, hospitals, roads, water); (3) **Fiscal Sustainability Monitor** — tax revenue forecasting and expenditure optimization; (4) **Akiya (Empty House) Manager** — mapping, risk assessment, and repurposing of abandoned properties; (5) **Elderly Welfare Network** — isolation risk detection and community support coordination; and (6) **Migration Attraction Toolkit** — data-backed strategies to attract young families.

### 2. User Personas

#### Persona 1: Mayor Tanaka — Mayor of Minamiaso Town (Pop: 9,200, declining 2.5%/year)
- **Context:** Beautiful town near Mt. Aso in Kumamoto; population halved since 1980; two elementary schools merged last year; hospital may close next year
- **Pain:** "I know we're shrinking, but I don't know HOW FAST each neighborhood is declining, which services to consolidate first, or whether our budget can survive 10 more years"
- **Goal:** "Give me a 10-year survival plan showing exactly which facilities to consolidate, when, and how to maintain quality of life for remaining residents"

#### Persona 2: Yamamoto-san — Prefectural Regional Planning Officer (Akita Prefecture)
- **Context:** Akita has Japan's highest elderly ratio (38%+) and fastest decline; manages 25 municipalities
- **Pain:** "Every town sends me different data formats; I can't compare them or identify which towns need urgent intervention"
- **Goal:** "I want one dashboard comparing all 25 municipalities on demographic health, fiscal sustainability, and service coverage — with early warning alerts"

#### Persona 3: Suzuki-san — Community Welfare Coordinator
- **Context:** Manages elderly welfare for a rural town; 2,400 residents over 75; 600 living alone
- **Pain:** "Last month, an 82-year-old woman was found deceased 4 days after she collapsed. No one checked on her."
- **Goal:** "I want a system that monitors our isolated elderly and alerts me if someone hasn't been seen or active for 24+ hours"

### 3. Feature Requirements

#### 3.1 Demographic Intelligence Dashboard (P0)

| Feature | Description | Acceptance Criteria |
|:---|:---|:---|
| Population pyramid | Interactive age-sex pyramid for any municipality, trackable over time | Compare current vs. 10/20/30 year projection |
| Neighborhood-level forecast | Project population at chōchō (町丁) level using cohort-component model | 10/20/30 year horizons |
| Birth/Death/Migration tracker | Real-time tracking of vital statistics + in/out-migration | Monthly updates with trend analysis |
| Demographic countdown | "At current rate, your population drops below X by [year]" | Threshold alerts configurable |
| Age cohort tracker | Track specific cohorts: children (0-14), working (15-64), elderly (65+) | Per-neighborhood breakdown |
| Comparison mode | Compare your municipality against peers, prefecture average, national average | Benchmarking dashboards |

#### 3.2 Smart Shrinkage Planner (P0)

| Feature | Description | Acceptance Criteria |
|:---|:---|:---|
| Infrastructure inventory | Map all public facilities: schools, hospitals, roads, water, community centers | GIS-based with capacity data |
| Consolidation simulator | "What if we merge School A and School B?" → model cost savings, student travel time, building reuse | Scenario comparison with KPIs |
| Compact city visualizer | Show which neighborhoods to maintain services in vs. which to gradually retire | Population density × infrastructure map |
| Service coverage analyzer | Calculate: "With this consolidation, 95% of residents are within 30 min of a hospital" | Accessibility heatmap |
| Cost-benefit engine | For each consolidation scenario: annual savings vs. one-time costs vs. impact on residents | ¥ quantified trade-offs |
| Timeline planner | Sequence consolidation decisions: which to do first, which to defer | 10-year action roadmap |

#### 3.3 Fiscal Sustainability Monitor (P1)

| Feature | Description | Acceptance Criteria |
|:---|:---|:---|
| Revenue forecasting | Project tax revenue based on population + aging trends | 10/20 year projection |
| Expenditure modeling | Project costs: infrastructure, welfare, healthcare, education, pensions | Per-category trend |
| Fiscal cliff detector | "Your expenditure exceeds revenue by FY [year] without intervention" | 5+ year early warning |
| Grant dependency tracker | % of budget from national transfers vs. local revenue | Sustainability risk indicator |
| Peer comparison | How does your fiscal health compare to similar-sized towns? | Ranked benchmarking |

#### 3.4 Akiya (Empty House) Manager (P1)

| Feature | Description | Acceptance Criteria |
|:---|:---|:---|
| Akiya map | GIS map of all identified empty/abandoned properties | Photo, condition, ownership data |
| Risk assessment | Score each akiya: fire hazard, structural collapse, pest risk | Color-coded risk levels |
| Repurposing suggestions | AI-suggested reuse: community space, remote work hub, guest house, demolition | Based on location + condition |
| Owner outreach tracker | Track communication with absent owners | Status: contacted / negotiating / resolved |
| Demolition prioritizer | Rank akiya for demolition by risk × cost × neighborhood impact | Budget-optimized priority list |

#### 3.5 Elderly Welfare Network (P1)

| Feature | Description | Acceptance Criteria |
|:---|:---|:---|
| Isolated elderly registry | Track all elderly living alone with health conditions, emergency contacts | Updated by welfare coordinators |
| Activity monitor | Passive monitoring: utility usage (water, electricity), IoT sensors | Alert if no activity for 24+ hours |
| Community check-in system | Volunteer/neighbor check-in schedule with confirmation tracking | Missed check-ins escalated |
| Emergency alert | Auto-alert to welfare coordinator and family if anomaly detected | < 30 minute response SLA |
| Health trend tracker | Track hospitalizations, falls, ambulance calls per elderly resident | Predictive risk scoring |

#### 3.6 Migration Attraction Toolkit (P2)

| Feature | Description | Acceptance Criteria |
|:---|:---|:---|
| Town attractiveness scorecard | Score your town: jobs, housing, childcare, nature, commute, internet, medical | Gap analysis vs. what young families want |
| Investment simulator | "If we invest ¥50M in childcare, we attract ~X families → Y tax revenue" | ROI model for each investment |
| Success case library | What worked in other towns? (Kamiyama, Sabae, Ama-cho success stories) | Documented with data |
| Digital nomad package | Template for remote-work-friendly town offerings (co-working, housing, broadband) | Customizable marketing kit |

### 4. Success Metrics

| Category | Metric | Baseline | Target |
|:---|:---|:---|:---|
| Forecasting | Population projection accuracy | Varies | > 90% (5-year) |
| Savings | Infrastructure consolidation savings | 0 (no modeling) | ¥500M+/municipality |
| Fiscal | Early warning lead time | Reactive | 5+ years |
| Elderly | Undetected isolation incidents | Unknown (many) | Zero > 24 hours |
| Migration | Towns with measurable attraction strategy | < 10% | 50%+ |
| Adoption | Municipalities using platform | 0 | 100+ |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|:---|:---|:---|
| **Dashboard** | React.js + TypeScript | Rich analytics + i18n for Japanese |
| **Maps/GIS** | Mapbox GL + deck.gl + Turf.js | Neighborhood-level geospatial |
| **3D Visualization** | Project PLATEAU integration (CityGML) | Japan's 3D digital twin |
| **Backend** | Python (FastAPI) | Demographic modeling + ML |
| **Demographic Model** | Cohort-Component Model (Python) | Population projection |
| **Database** | PostgreSQL + PostGIS | Geospatial demographic data |
| **IoT (Elderly)** | Simulated sensor data | Activity monitoring prototype |
| **Data Sources** | e-Stat (Japan statistics), RESAS, PLATEAU | Government open data |
| **i18n** | react-i18next | Japanese + English |
| **Hosting** | Vercel + Railway | Free tier |

---

## 📐 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       MACHIMIRAI (まちミライ)                     │
├───────────────┬──────────────┬──────────────────┬────────────────┤
│  Demographic  │  Shrinkage   │  Fiscal          │  Welfare       │
│  Dashboard    │  Planner     │  Monitor         │  Network       │
│  (React.js)   │  (React.js)  │  (React.js)      │  (React.js)    │
├───────────────┴──────────────┴──────────────────┴────────────────┤
│              API Layer (FastAPI) [JP + EN i18n]                   │
├──────────┬──────────────┬────────────────┬───────────────────────┤
│ Cohort   │  Infra       │  Fiscal        │  Akiya               │
│ Model    │  Optimizer   │  Forecaster    │  Manager              │
│          │  (Scenarios) │                │                       │
├──────────┴──────────────┴────────────────┴───────────────────────┤
│              PostgreSQL + PostGIS                                 │
├──────────────────────────────────────────────────────────────────┤
│  Data Sources:                                                   │
│  e-Stat │ RESAS │ PLATEAU │ Municipal Data │ IoT Sensors        │
└─────────┴───────┴─────────┴────────────────┴────────────────────┘
```

---

## 🗄️ Database Schema

```sql
-- Municipalities
CREATE TABLE municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_code VARCHAR(6) UNIQUE NOT NULL,  -- JIS X 0402 code
    municipality_name VARCHAR(255) NOT NULL,
    municipality_name_en VARCHAR(255),
    prefecture VARCHAR(100),
    municipality_type ENUM('shi', 'ku', 'machi', 'mura'),  -- City, Ward, Town, Village
    area_sq_km DECIMAL(10,2),
    population_current INTEGER,
    population_peak INTEGER,
    population_peak_year INTEGER,
    elderly_ratio DECIMAL(5,2),           -- % aged 65+
    child_ratio DECIMAL(5,2),             -- % aged 0-14
    working_ratio DECIMAL(5,2),           -- % aged 15-64
    total_fertility_rate DECIMAL(3,2),
    net_migration_annual INTEGER,
    fiscal_independence_ratio DECIMAL(5,2), -- 財政力指数 (higher = more independent)
    akiya_count INTEGER,                  -- Empty houses
    survival_risk_score DECIMAL(5,2),     -- 0-100 composite risk
    created_at TIMESTAMP DEFAULT NOW()
);

-- Population by Neighborhood (町丁目 level)
CREATE TABLE neighborhood_population (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    neighborhood_code VARCHAR(15),
    neighborhood_name VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    census_year INTEGER,
    total_population INTEGER,
    age_0_14 INTEGER,
    age_15_64 INTEGER,
    age_65_plus INTEGER,
    age_75_plus INTEGER,
    households INTEGER,
    single_elderly_households INTEGER,
    population_density DECIMAL(10,2),
    change_5yr_pct DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Population Projections
CREATE TABLE population_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    neighborhood_code VARCHAR(15),
    projection_year INTEGER,
    model_version VARCHAR(50),
    projected_total INTEGER,
    projected_elderly_ratio DECIMAL(5,2),
    projected_child_ratio DECIMAL(5,2),
    confidence_interval_low INTEGER,
    confidence_interval_high INTEGER,
    scenario ENUM('baseline', 'optimistic', 'pessimistic'),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Public Facilities (Infrastructure)
CREATE TABLE public_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    facility_name VARCHAR(255),
    facility_type ENUM('elementary_school', 'junior_high', 'hospital', 'clinic', 
                        'community_center', 'library', 'fire_station', 'post_office',
                        'water_treatment', 'road_bridge'),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    capacity INTEGER,
    current_utilization_pct DECIMAL(5,2),
    annual_maintenance_cost_yen BIGINT,
    age_years INTEGER,
    condition ENUM('good', 'fair', 'poor', 'critical'),
    consolidation_candidate BOOLEAN DEFAULT FALSE,
    serving_population INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Akiya (Empty Houses)
CREATE TABLE akiya (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    building_age_years INTEGER,
    floor_area_sqm DECIMAL(8,2),
    condition ENUM('habitable', 'needs_repair', 'dangerous', 'ruins'),
    risk_score DECIMAL(5,2),             -- Fire, collapse, pest risk
    owner_known BOOLEAN DEFAULT FALSE,
    owner_contacted BOOLEAN DEFAULT FALSE,
    proposed_action ENUM('renovation', 'demolition', 'sale', 'community_use', 'pending'),
    estimated_demolition_cost_yen INTEGER,
    last_inspection_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Elderly Monitoring
CREATE TABLE elderly_residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID REFERENCES municipalities(id),
    resident_name VARCHAR(255),
    age INTEGER,
    living_alone BOOLEAN DEFAULT TRUE,
    health_conditions TEXT[],
    mobility_level ENUM('independent', 'assisted', 'wheelchair', 'bedridden'),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    last_activity_detected TIMESTAMP,
    last_welfare_check TIMESTAMP,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    assigned_volunteer_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 Demographic Projection Model

```python
import numpy as np
import pandas as pd

def cohort_component_projection(municipality_data, years_ahead=30):
    """
    Cohort-Component Population Projection Model.
    
    Used by Japan's National Institute of Population and Social Security 
    Research (NIPSSR) as the standard methodology.
    
    Components:
    1. Survival rates by age (mortality)
    2. Fertility rates by age of mother
    3. Net migration rates by age
    """
    
    # Current population by single-year age (0-100+)
    population = municipality_data['age_distribution']  # Array of 101 values
    
    # Age-specific survival rates (from life tables)
    survival_rates = get_survival_rates(municipality_data['prefecture'])
    
    # Age-specific fertility rates (15-49)
    fertility_rates = get_fertility_rates(municipality_data['tfr'])
    
    # Age-specific net migration rates
    migration_rates = get_migration_rates(municipality_data['migration_pattern'])
    
    projections = []
    
    for year in range(1, years_ahead + 1):
        new_population = np.zeros(101)
        
        # Age everyone by 1 year (apply survival rates)
        for age in range(1, 101):
            new_population[age] = population[age - 1] * survival_rates[age - 1]
        
        # Calculate births (from women aged 15-49)
        births = sum(
            population[age] * fertility_rates[age - 15] / 2  # /2 for female only
            for age in range(15, 50)
            if age - 15 < len(fertility_rates)
        )
        new_population[0] = births
        
        # Apply net migration
        for age in range(101):
            new_population[age] += new_population[age] * migration_rates[min(age, 99)]
            new_population[age] = max(0, new_population[age])
        
        population = new_population
        
        projections.append({
            'year': municipality_data['base_year'] + year,
            'total': int(sum(population)),
            'age_0_14': int(sum(population[0:15])),
            'age_15_64': int(sum(population[15:65])),
            'age_65_plus': int(sum(population[65:])),
            'elderly_ratio': sum(population[65:]) / sum(population) * 100,
            'child_ratio': sum(population[0:15]) / sum(population) * 100,
        })
    
    return pd.DataFrame(projections)
```

---

## 🔨 Step-by-Step Build Guide

### Phase 1: Data & Research (Days 1-3)
1. **Study Japan's demographic data** — e-Stat, RESAS, NIPSSR projections
2. **Understand smart shrinkage** — RIETI, Tokyo Foundation research papers
3. **Collect municipality data** — Population, facilities, fiscal data for 10 sample towns
4. **Build cohort-component model** — Neighborhood-level projections

### Phase 2: Core Platform (Days 4-8)
5. **Population dashboard** — Pyramids, forecasts, countdown timers
6. **Infrastructure mapper** — GIS map of public facilities with utilization data
7. **Consolidation simulator** — What-if scenario builder
8. **Fiscal monitor** — Revenue/expenditure projections

### Phase 3: Welfare & Akiya (Days 9-11)
9. **Akiya manager** — Map + risk assessment + action tracking
10. **Elderly monitoring** — Activity tracking + alert system
11. **Migration toolkit** — Town attractiveness scorecard

### Phase 4: Polish (Days 12-14)
12. **Japanese localization** — Full i18n support
13. **Figma wireframes** — Dashboard + planner + mobile views
14. **Case study + documentation** — Portfolio-ready

---

## 📊 Dashboard Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│  まちミライ MACHIMIRAI — 南阿蘇村 (Minamiaso)    [2026 → 2056]  │
├──────────┬───────────────────────────────────────────────────────┤
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│ Menu     │  │ 人口      │ │ 高齢化率  │ │ 空き家    │ │ 財政力   ││
│          │  │ Population│ │ Elderly % │ │ Akiya    │ │ Fiscal   ││
│ • 人口    │  │  9,247   │ │  38.2%   │ │   842    │ │  0.32    ││
│ • 施設    │  │ (-2.5%/yr)│ │ (↑1.8%)  │ │ (+67/yr) │ │ (At Risk)││
│ • 財政    │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│ • 空き家  │  ┌──────────────────────┐ ┌──────────────────────────┤│
│ • 高齢者  │  │ Population Pyramid   │ │ 30-Year Projection        ││
│ • 移住    │  │ ┌──────┬──────┐      │ │ 2026: ████████── 9,247    ││
│          │  │ │ Male │Female│      │ │ 2036: ██████──── 7,100    ││
│          │  │ │ ▓▓▓▓ │ ▓▓▓▓│75+   │ │ 2046: ████────── 5,200    ││
│          │  │ │  ▓▓▓ │ ▓▓▓ │65-74 │ │ 2056: ██──────── 3,800    ││
│          │  │ │  ▓▓  │  ▓▓ │15-64 │ │ ⚠️ Below 5,000 by 2043    ││
│          │  │ │  ▓   │  ▓  │ 0-14 │ │                            ││
│          │  │ └──────┴──────┘      │ │ Elderly ratio 2056: 52%   ││
│          │  └──────────────────────┘ └──────────────────────────┘│
│          │  ┌──────────────────────────────────────────────────┐ │
│          │  │ 施設統合シミュレーター (Consolidation Simulator)   │ │
│          │  │ Scenario A: Merge 2 schools → Save ¥42M/yr       │ │
│          │  │ Scenario B: Close clinic → 92% within 30min hosp │ │
│          │  │ Scenario C: Combined A+B → Save ¥67M/yr          │ │
│          │  │ [Compare Scenarios] [Generate Report]             │ │
│          │  └──────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────┘
```

---

## 🔍 Competitive Analysis

| Feature | MachiMirai (Yours) | RESAS | Project PLATEAU | V-RESAS | Excel (Current) |
|:---|:---|:---|:---|:---|:---|
| **Population projection** | ✅ Neighborhood-level | ⚠️ Municipal level | ❌ | ⚠️ | ❌ Manual |
| **Smart shrinkage planning** | ✅ Scenario simulator | ❌ | ❌ | ❌ | ❌ |
| **Fiscal forecasting** | ✅ 20-year | ❌ | ❌ | ❌ | ❌ Manual |
| **Akiya management** | ✅ GIS + risk scoring | ❌ | ⚠️ 3D view | ❌ | ❌ |
| **Elderly welfare** | ✅ Activity monitoring | ❌ | ❌ | ❌ | ❌ |
| **Infrastructure optimization** | ✅ Consolidation ROI | ❌ | ⚠️ Visualization | ❌ | ❌ |
| **Migration strategy** | ✅ ROI toolkit | ⚠️ Analytics | ❌ | ❌ | ❌ |

---

## 🔗 References & Resources

### Data Sources

| Source | URL |
|:---|:---|
| e-Stat (Japan Statistics) | [e-stat.go.jp](https://www.e-stat.go.jp) |
| RESAS (Regional Economy Analysis) | [resas.go.jp](https://resas.go.jp) |
| Project PLATEAU (3D Digital Twin) | [mlit.go.jp/plateau](https://www.mlit.go.jp/plateau/) |
| NIPSSR (Population Projections) | [ipss.go.jp](https://www.ipss.go.jp) |
| MIC Municipal Data | [soumu.go.jp](https://www.soumu.go.jp) |

### Research Papers & Reports

| Resource | Topic |
|:---|:---|
| Tokyo Foundation — Smart Shrinkage | Policy framework for managing decline |
| RIETI — Regional Revitalization | Evidence-based policy analysis |
| OECD — Japan Aging Policy Review | International comparison |
| Akita Prefecture Annual Report | Fastest-declining prefecture case study |

---

## 📝 Resume Bullet Points (Ready to Use)

```
MachiMirai — Municipal Survival Intelligence Platform for Depopulating Japan | GovTech
• Identified 477 Japanese municipalities (25% of all towns) experiencing >10% 
  population decline with zero predictive planning tools for "smart shrinkage" 
  → designed a demographic intelligence platform with neighborhood-level 
  cohort-component projections, infrastructure consolidation simulation, and 
  fiscal sustainability early warning
• Built consolidation scenario simulator quantifying ¥-denominated trade-offs 
  (school mergers, clinic closures, facility repurposing), akiya (empty house) 
  risk mapping for 9M+ abandoned properties, and elderly isolation monitoring 
  system with 24-hour activity detection alerts
• Projected 15-25% infrastructure cost savings through data-driven consolidation 
  planning, 5+ year fiscal cliff early warning, and zero-miss elderly welfare 
  monitoring — addressing Japan's #1 societal challenge (少子高齢化)
```

---

## 🔑 ATS Keywords

Demographic analytics, population decline, aging society, shoshika koreika (少子高齢化), smart shrinkage, municipal governance, GovTech, Japan, infrastructure optimization, fiscal sustainability, akiya (空き家), elderly welfare, cohort-component model, RESAS, e-Stat, PLATEAU, digital twin, regional revitalization, Society 5.0, Digital Garden City, geospatial analytics, PostGIS, evidence-based policy, compact city
