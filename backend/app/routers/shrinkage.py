from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import math

from app.database import get_db
from app.models import PublicFacility, ConsolidationScenario, NeighborhoodPopulation, Municipality
from app.schemas import (
    PublicFacilitySchema, ConsolidationScenarioResponse, SimulationScenarioRequest
)

router = APIRouter(prefix="/api/shrinkage", tags=["Smart Shrinkage Planner"])

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Earth radius in kilometers
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

@router.get("/facilities/{municipality_id}", response_model=List[PublicFacilitySchema])
def get_facilities(municipality_id: str, db: Session = Depends(get_db)):
    facilities = db.query(PublicFacility).filter(
        PublicFacility.municipality_id == municipality_id
    ).all()
    return facilities

@router.get("/scenarios/{municipality_id}", response_model=List[ConsolidationScenarioResponse])
def get_scenarios(municipality_id: str, db: Session = Depends(get_db)):
    scenarios = db.query(ConsolidationScenario).filter(
        ConsolidationScenario.municipality_id == municipality_id
    ).all()
    return scenarios

@router.post("/simulate/{municipality_id}", response_model=ConsolidationScenarioResponse)
def simulate_consolidation(
    municipality_id: str,
    req: SimulationScenarioRequest,
    db: Session = Depends(get_db)
):
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")

    facilities = db.query(PublicFacility).filter(PublicFacility.municipality_id == municipality_id).all()
    facility_dict = {f.id: f for f in facilities}
    neighborhoods = db.query(NeighborhoodPopulation).filter(NeighborhoodPopulation.municipality_id == municipality_id).all()

    total_annual_savings = 0
    total_transition_costs = 0
    travel_time_deltas = []
    closed_facilities_count = 0

    actions_summary = []

    for item in req.actions:
        fac = facility_dict.get(item.facility_id)
        if not fac:
            continue

        if item.action in ["merge_into", "close"]:
            # Annual maintenance cost is saved
            savings = fac.annual_maintenance_cost_yen
            # Transition costs: demolition / severance / severance / relocation
            trans_cost = int(savings * 0.35)
            total_annual_savings += savings
            total_transition_costs += trans_cost
            closed_facilities_count += 1

            # If it's a school, compute student travel time increase
            if "school" in fac.facility_type:
                target_fac = facility_dict.get(item.target_facility_id)
                if target_fac:
                    dist = haversine_distance_km(fac.latitude, fac.longitude, target_fac.latitude, target_fac.longitude)
                    # Average school bus speed ~30 km/h in rural hills -> 2 min per km
                    added_minutes = round(dist * 2.0, 1)
                    travel_time_deltas.append(added_minutes)
                else:
                    travel_time_deltas.append(5.0)

            actions_summary.append({
                "facility_name": fac.facility_name,
                "action": item.action,
                "target": item.target_facility_id,
                "savings_yen": savings
            })

        elif item.action == "repurpose":
            # Partial savings (community lease / commercial coworking cover ~60% upkeep)
            savings = int(fac.annual_maintenance_cost_yen * 0.60)
            trans_cost = 8000000 # renovation grant
            total_annual_savings += savings
            total_transition_costs += trans_cost
            actions_summary.append({
                "facility_name": fac.facility_name,
                "action": "repurpose",
                "theme": item.repurpose_theme or "Remote Work Satellite & Hub",
                "savings_yen": savings
            })

    # Coverage calculations:
    # Compute % of total neighborhood population within 30 min (15 km drive) of surviving medical facilities
    surviving_clinics = [
        f for f in facilities
        if f.facility_type in ["hospital", "clinic"] and
        not any(a.facility_id == f.id and a.action == "close" for a in req.actions)
    ]
    
    total_pop = sum(n.total_population for n in neighborhoods) or 1
    covered_pop = 0
    for n in neighborhoods:
        # Check if within 15 km of at least one open clinic/hospital
        is_covered = any(
            haversine_distance_km(n.latitude, n.longitude, h.latitude, h.longitude) <= 15.0
            for h in surviving_clinics
        )
        if is_covered:
            covered_pop += n.total_population

    coverage_pct = round((covered_pop / total_pop) * 100, 1)
    avg_travel_delta = round(sum(travel_time_deltas) / len(travel_time_deltas), 1) if travel_time_deltas else 0.0

    # Create and persist scenario record
    new_scenario = ConsolidationScenario(
        municipality_id=municipality_id,
        name=req.name,
        description=req.description or f"Custom scenario consolidating {closed_facilities_count} facilities",
        target_facilities=actions_summary,
        annual_savings_yen=total_annual_savings,
        transition_cost_yen=total_transition_costs,
        student_travel_time_delta_min=avg_travel_delta,
        hospital_30min_coverage_pct=coverage_pct,
        repurposed_plan="Community Maker Space & Disaster Preparedness Hub",
        status="proposed"
    )
    db.add(new_scenario)
    db.commit()
    db.refresh(new_scenario)

    return new_scenario

@router.get("/compact-city/{municipality_id}")
def get_compact_city_plan(municipality_id: str, db: Session = Depends(get_db)):
    """
    Returns neighborhood zoning for compact city (maintain, consolidate, retire)
    with 10-year action timeline and infrastructure cost trajectory.
    """
    neighborhoods = db.query(NeighborhoodPopulation).filter(
        NeighborhoodPopulation.municipality_id == municipality_id
    ).all()
    
    facilities = db.query(PublicFacility).filter(
        PublicFacility.municipality_id == municipality_id
    ).all()

    total_infra_cost = sum(f.annual_maintenance_cost_yen for f in facilities)
    
    # 10-year action roadmap
    roadmap = [
        {
            "phase": "Year 1-2 (緊急対応・検討期)",
            "title": "老朽危険施設の退役と統廃合協議",
            "actions": [
                "耐震基準未達の立野地区市民センター閉館手続き",
                "久石小学校の中央小学校統合PTA説明会及びスクールバス運行計画策定",
                "白水診療所における巡回診療車（EVモビリティ）実証実験開始"
            ],
            "cost_impact_yen": -12000000
        },
        {
            "phase": "Year 3-5 (統合実行期)",
            "title": "学校統合完了及び廃校リノベーション",
            "actions": [
                "久石小学校の統合完了（年間¥28M維持費削減）",
                "旧久石小校舎を「阿蘇未来共創ラボ＆コワーキング」として民間賃貸",
                "長野渓谷第2大橋の計画的修繕と通行重量制限の実施"
            ],
            "cost_impact_yen": -41500000
        },
        {
            "phase": "Year 6-10 (コンパクトシティ定着期)",
            "title": "居住誘導区域への集約と拠点強化",
            "actions": [
                "長野中央地区への医療・子育て・商業機能の徒歩圏集約",
                "遠隔地におけるオンデマンド型自動運転バスの本格運行",
                "公共施設総床面積の25%削減達成による財政健全化"
            ],
            "cost_impact_yen": -65500000
        }
    ]

    return {
        "municipality_id": municipality_id,
        "total_facilities": len(facilities),
        "total_annual_infra_budget_yen": total_infra_cost,
        "zones_summary": {
            "maintain_zones": sum(1 for n in neighborhoods if n.compact_zone_status == "maintain"),
            "consolidate_zones": sum(1 for n in neighborhoods if n.compact_zone_status == "consolidate"),
            "retire_zones": sum(1 for n in neighborhoods if n.compact_zone_status == "retire")
        },
        "neighborhood_zones": [
            {
                "id": n.id,
                "name": n.neighborhood_name,
                "status": n.compact_zone_status,
                "population": n.total_population,
                "density": n.population_density,
                "lat": n.latitude,
                "lon": n.longitude
            } for n in neighborhoods
        ],
        "roadmap": roadmap
    }
