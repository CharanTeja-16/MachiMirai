from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Akiya, Municipality
from app.schemas import AkiyaSchema, AkiyaCreateRequest, AkiyaStatusUpdateRequest

router = APIRouter(prefix="/api/akiya", tags=["Akiya (Empty House) Manager"])

@router.get("/{municipality_id}", response_model=List[AkiyaSchema])
def get_all_akiya(municipality_id: str, condition: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Akiya).filter(Akiya.municipality_id == municipality_id)
    if condition:
        query = query.filter(Akiya.condition == condition)
    properties = query.order_by(Akiya.risk_score.desc()).all()
    return properties

@router.post("/{municipality_id}", response_model=AkiyaSchema)
def create_akiya(municipality_id: str, req: AkiyaCreateRequest, db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")

    composite_risk = round((req.fire_risk * 0.35 + req.collapse_risk * 0.45 + req.pest_risk * 0.20), 1)

    # Calculate estimated costs based on sqm and condition
    if req.condition in ["dangerous", "ruins"]:
        d_cost = int(req.floor_area_sqm * 24000)
        r_cost = int(req.floor_area_sqm * 50000)
    else:
        d_cost = int(req.floor_area_sqm * 20000)
        r_cost = int(req.floor_area_sqm * 28000)

    # Automatic repurposing recommendation
    suggested_action = "pending"
    if composite_risk >= 75:
        suggested_action = "demolition"
    elif composite_risk <= 35:
        suggested_action = "renovation"
    elif req.floor_area_sqm >= 130:
        suggested_action = "community_use"
    else:
        suggested_action = "sale"

    new_akiya = Akiya(
        municipality_id=municipality_id,
        address=req.address,
        latitude=req.latitude,
        longitude=req.longitude,
        building_age_years=req.building_age_years,
        floor_area_sqm=req.floor_area_sqm,
        condition=req.condition,
        risk_score=composite_risk,
        fire_risk=req.fire_risk,
        collapse_risk=req.collapse_risk,
        pest_risk=req.pest_risk,
        owner_known=req.owner_known,
        owner_contacted=False,
        owner_status="uncontacted",
        proposed_action=suggested_action,
        estimated_demolition_cost_yen=d_cost,
        estimated_renovation_cost_yen=r_cost,
        last_inspection_date="2026-03-01",
        photo_url="https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80"
    )

    db.add(new_akiya)
    muni.akiya_count += 1
    db.commit()
    db.refresh(new_akiya)
    return new_akiya

@router.patch("/property/{akiya_id}", response_model=AkiyaSchema)
def update_akiya_status(akiya_id: str, req: AkiyaStatusUpdateRequest, db: Session = Depends(get_db)):
    prop = db.query(Akiya).filter(Akiya.id == akiya_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Akiya property not found")

    if req.owner_contacted is not None:
        prop.owner_contacted = req.owner_contacted
    if req.owner_status is not None:
        prop.owner_status = req.owner_status
    if req.proposed_action is not None:
        prop.proposed_action = req.proposed_action
    if req.condition is not None:
        prop.condition = req.condition

    db.commit()
    db.refresh(prop)
    return prop

@router.get("/demolition-prioritizer/{municipality_id}")
def get_demolition_priorities(municipality_id: str, budget_yen: int = 15000000, db: Session = Depends(get_db)):
    """
    Ranks dangerous empty houses by cost-effectiveness:
    Priority Score = (Risk Score * Hazard Index) / Demolition Cost (in 10k Yen)
    """
    properties = db.query(Akiya).filter(
        Akiya.municipality_id == municipality_id,
        Akiya.condition.in_(["dangerous", "ruins"])
    ).all()

    scored_list = []
    for p in properties:
        # Score per Yen ratio
        cost_units = max(1, p.estimated_demolition_cost_yen / 100000)
        priority_index = round((p.risk_score * 1.5) / cost_units, 2)
        scored_list.append({
            "id": p.id,
            "address": p.address,
            "condition": p.condition,
            "risk_score": p.risk_score,
            "collapse_risk": p.collapse_risk,
            "fire_risk": p.fire_risk,
            "estimated_demolition_cost_yen": p.estimated_demolition_cost_yen,
            "owner_status": p.owner_status,
            "priority_index": priority_index
        })

    # Sort descending by priority index
    scored_list.sort(key=lambda x: x["priority_index"], reverse=True)

    # Optimize allocation within specified budget
    selected_for_demolition = []
    accumulated_cost = 0
    for item in scored_list:
        if accumulated_cost + item["estimated_demolition_cost_yen"] <= budget_yen:
            selected_for_demolition.append(item)
            accumulated_cost += item["estimated_demolition_cost_yen"]

    return {
        "budget_specified_yen": budget_yen,
        "total_dangerous_properties": len(scored_list),
        "properties_funded_within_budget": len(selected_for_demolition),
        "total_cost_allocated_yen": accumulated_cost,
        "budget_remaining_yen": budget_yen - accumulated_cost,
        "priority_ranked_properties": scored_list,
        "funded_properties": selected_for_demolition
    }
