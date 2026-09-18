from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Municipality, NeighborhoodPopulation, PopulationProjection
from app.schemas import (
    DemographicDashboardData, AgeSexCohort, NeighborhoodStat,
    DemographicCountdownItem, MunicipalitySummary
)
from app.demographic_engine import (
    generate_initial_pyramid, run_cohort_component_projection,
    calculate_demographic_countdown
)

router = APIRouter(prefix="/api/demographics", tags=["Demographic Intelligence"])

def format_pyramid_cohorts(male: List[int], female: List[int]) -> List[AgeSexCohort]:
    # Group 101 single-year cohorts into 5-year brackets + 85+
    cohort_labels = [
        ("0-4", 0, 5), ("5-9", 5, 10), ("10-14", 10, 15),
        ("15-19", 15, 20), ("20-24", 20, 25), ("25-29", 25, 30),
        ("30-34", 30, 35), ("35-39", 35, 40), ("40-44", 40, 45),
        ("45-49", 45, 50), ("50-54", 50, 55), ("55-59", 55, 60),
        ("60-64", 60, 65), ("65-69", 65, 70), ("70-74", 70, 75),
        ("75-79", 75, 80), ("80-84", 80, 85), ("85+", 85, 101)
    ]
    results = []
    for label, start, end in cohort_labels:
        m_sum = sum(male[start:end])
        f_sum = sum(female[start:end])
        results.append(AgeSexCohort(
            age_group=label,
            male=m_sum,
            female=f_sum,
            total=m_sum + f_sum
        ))
    return results

@router.get("/dashboard/{municipality_id}", response_model=DemographicDashboardData)
def get_demographic_dashboard(municipality_id: str, scenario: str = Query("baseline", pattern="^(baseline|optimistic|pessimistic)$"), db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")

    neighborhoods = db.query(NeighborhoodPopulation).filter(
        NeighborhoodPopulation.municipality_id == municipality_id
    ).all()

    # Generate single-year starting pyramid
    m_init, f_init = generate_initial_pyramid(
        total_pop=muni.population_current,
        elderly_ratio=muni.elderly_ratio,
        child_ratio=muni.child_ratio
    )

    # Run cohort-component model
    projections = run_cohort_component_projection(
        male_pop=m_init,
        female_pop=f_init,
        tfr=muni.total_fertility_rate,
        years_ahead=30,
        scenario=scenario,
        base_year=2026
    )

    # Extract target years: 2026, 2036, 2046, 2056
    p_map = {p["year"]: p for p in projections}
    p_2026 = p_map.get(2026, projections[0])
    p_2036 = p_map.get(2036, projections[min(10, len(projections)-1)])
    p_2046 = p_map.get(2046, projections[min(20, len(projections)-1)])
    p_2056 = p_map.get(2056, projections[min(30, len(projections)-1)])

    pyramid_curr = format_pyramid_cohorts(p_2026["male_pyramid"], p_2026["female_pyramid"])
    pyramid_36 = format_pyramid_cohorts(p_2036["male_pyramid"], p_2036["female_pyramid"])
    pyramid_46 = format_pyramid_cohorts(p_2046["male_pyramid"], p_2046["female_pyramid"])
    pyramid_56 = format_pyramid_cohorts(p_2056["male_pyramid"], p_2056["female_pyramid"])

    # Countdown calculations
    countdown_raw = calculate_demographic_countdown(projections)
    countdown = [DemographicCountdownItem(**c) for c in countdown_raw]

    # Projections summary table
    proj_summary = []
    for step_yr in [2026, 2031, 2036, 2041, 2046, 2051, 2056]:
        if step_yr in p_map:
            rec = p_map[step_yr]
            proj_summary.append({
                "year": rec["year"],
                "total": rec["total"],
                "age_0_14": rec["age_0_14"],
                "age_15_64": rec["age_15_64"],
                "age_65_plus": rec["age_65_plus"],
                "age_75_plus": rec["age_75_plus"],
                "elderly_ratio": rec["elderly_ratio"],
                "child_ratio": rec["child_ratio"],
                "annual_births": rec["annual_births"],
                "annual_deaths": rec["annual_deaths"],
                "net_migration": rec["net_migration"]
            })

    # Vital stats monthly (last 12 months synthesized based on annual rates)
    monthly_vital = []
    base_deaths_m = max(1, int(p_2026["annual_deaths"] / 12))
    base_births_m = max(1, int(p_2026["annual_births"] / 12))
    base_mig_m = int(p_2026["net_migration"] / 12)
    
    months = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"]
    for i, m in enumerate(months):
        # Winter months typically have higher deaths in elderly societies
        death_factor = 1.3 if m in ["12月", "1月", "2月"] else 0.95
        # March / April have higher migration turnover (fiscal year change)
        mig_factor = 2.5 if m in ["3月", "4月"] else 0.7
        
        monthly_vital.append({
            "month": m,
            "births": int(base_births_m * (0.9 + 0.2 * ((i % 3) / 3))),
            "deaths": int(base_deaths_m * death_factor),
            "in_migration": int(22 * mig_factor),
            "out_migration": int(27 * mig_factor),
            "natural_change": int(base_births_m - base_deaths_m * death_factor),
            "social_change": int((22 - 27) * mig_factor)
        })

    # Prefecture & National comparison data
    pref_comparison = {
        "town": {
            "name": muni.municipality_name,
            "elderly_ratio": muni.elderly_ratio,
            "child_ratio": muni.child_ratio,
            "tfr": muni.total_fertility_rate,
            "annual_decline_pct": -2.4
        },
        "prefecture": {
            "name": muni.prefecture,
            "elderly_ratio": 33.4,
            "child_ratio": 11.2,
            "tfr": 1.44,
            "annual_decline_pct": -1.1
        },
        "national": {
            "name": "全国平均 (Japan National)",
            "elderly_ratio": 29.8,
            "child_ratio": 11.5,
            "tfr": 1.20,
            "annual_decline_pct": -0.68
        }
    }

    return DemographicDashboardData(
        municipality=MunicipalitySummary(
            id=muni.id,
            municipality_code=muni.municipality_code,
            municipality_name=muni.municipality_name,
            municipality_name_en=muni.municipality_name_en,
            prefecture=muni.prefecture,
            municipality_type=muni.municipality_type,
            area_sq_km=muni.area_sq_km,
            population_current=muni.population_current,
            population_peak=muni.population_peak,
            population_peak_year=muni.population_peak_year,
            elderly_ratio=muni.elderly_ratio,
            child_ratio=muni.child_ratio,
            working_ratio=muni.working_ratio,
            total_fertility_rate=muni.total_fertility_rate,
            net_migration_annual=muni.net_migration_annual,
            fiscal_independence_ratio=muni.fiscal_independence_ratio,
            akiya_count=muni.akiya_count,
            survival_risk_score=muni.survival_risk_score,
            latitude=muni.latitude,
            longitude=muni.longitude
        ),
        current_year=2026,
        pyramid_current=pyramid_curr,
        pyramid_2036=pyramid_36,
        pyramid_2046=pyramid_46,
        pyramid_2056=pyramid_56,
        projections_summary=proj_summary,
        countdown=countdown,
        neighborhoods=[
            NeighborhoodStat(
                id=n.id,
                neighborhood_code=n.neighborhood_code,
                neighborhood_name=n.neighborhood_name,
                latitude=n.latitude,
                longitude=n.longitude,
                total_population=n.total_population,
                age_0_14=n.age_0_14,
                age_15_64=n.age_15_64,
                age_65_plus=n.age_65_plus,
                age_75_plus=n.age_75_plus,
                households=n.households,
                single_elderly_households=n.single_elderly_households,
                population_density=n.population_density,
                change_5yr_pct=n.change_5yr_pct,
                compact_zone_status=n.compact_zone_status
            ) for n in neighborhoods
        ],
        vital_stats_monthly=monthly_vital,
        prefecture_comparison=pref_comparison
    )
