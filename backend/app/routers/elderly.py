from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ElderlyResident, SensorLog, Municipality
from app.schemas import (
    ElderlyResidentSchema, ElderlyResidentDetail, CheckinLogRequest,
    SensorTelemetryPoint
)

router = APIRouter(prefix="/api/elderly", tags=["Elderly Welfare Network"])

@router.get("/{municipality_id}", response_model=List[ElderlyResidentSchema])
def get_elderly_registry(municipality_id: str, risk_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ElderlyResident).filter(ElderlyResident.municipality_id == municipality_id)
    if risk_filter:
        query = query.filter(ElderlyResident.risk_level == risk_filter)
    
    # Order by hours_since_activity descending so emergencies appear first
    residents = query.order_by(ElderlyResident.hours_since_activity.desc()).all()
    
    results = []
    for r in residents:
        results.append(ElderlyResidentSchema(
            id=r.id,
            municipality_id=r.municipality_id,
            resident_name=r.resident_name,
            age=r.age,
            living_alone=r.living_alone,
            health_conditions=r.health_conditions or [],
            mobility_level=r.mobility_level,
            emergency_contact_name=r.emergency_contact_name,
            emergency_contact_phone=r.emergency_contact_phone,
            address=r.address,
            latitude=r.latitude,
            longitude=r.longitude,
            hours_since_activity=r.hours_since_activity,
            risk_level=r.risk_level,
            assigned_volunteer=r.assigned_volunteer,
            fall_incidents_last_year=r.fall_incidents_last_year,
            ambulance_calls_last_year=r.ambulance_calls_last_year,
            is_emergency_flagged=(r.hours_since_activity >= 24.0)
        ))
    return results

@router.get("/resident/{resident_id}", response_model=ElderlyResidentDetail)
def get_resident_detail(resident_id: str, db: Session = Depends(get_db)):
    r = db.query(ElderlyResident).filter(ElderlyResident.id == resident_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resident not found")

    sensor_logs = db.query(SensorLog).filter(
        SensorLog.resident_id == resident_id
    ).order_by(SensorLog.timestamp.desc()).limit(20).all()

    telemetry = [
        SensorTelemetryPoint(
            sensor_type=s.sensor_type,
            value=s.reading_value,
            unit=s.unit,
            timestamp=s.timestamp.strftime("%Y-%m-%d %H:%M"),
            is_anomaly=s.is_anomaly
        ) for s in sensor_logs
    ]

    return ElderlyResidentDetail(
        id=r.id,
        municipality_id=r.municipality_id,
        resident_name=r.resident_name,
        age=r.age,
        living_alone=r.living_alone,
        health_conditions=r.health_conditions or [],
        mobility_level=r.mobility_level,
        emergency_contact_name=r.emergency_contact_name,
        emergency_contact_phone=r.emergency_contact_phone,
        address=r.address,
        latitude=r.latitude,
        longitude=r.longitude,
        hours_since_activity=r.hours_since_activity,
        risk_level=r.risk_level,
        assigned_volunteer=r.assigned_volunteer,
        fall_incidents_last_year=r.fall_incidents_last_year,
        ambulance_calls_last_year=r.ambulance_calls_last_year,
        is_emergency_flagged=(r.hours_since_activity >= 24.0),
        telemetry=telemetry
    )

@router.post("/resident/{resident_id}/checkin")
def record_welfare_checkin(resident_id: str, req: CheckinLogRequest, db: Session = Depends(get_db)):
    r = db.query(ElderlyResident).filter(ElderlyResident.id == resident_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resident not found")

    # Reset hours since activity and update welfare check time
    r.hours_since_activity = 0.5
    r.last_welfare_check = datetime.utcnow()
    r.last_activity_detected = datetime.utcnow()
    
    # If previously critical because of inactivity, downgrade to medium
    if r.risk_level == "critical":
        r.risk_level = "medium"

    # Add fresh sensor log entry
    db.add(SensorLog(
        resident_id=r.id,
        sensor_type="door_sensor",
        reading_value=1.0,
        unit="checkin",
        is_anomaly=False,
        timestamp=datetime.utcnow()
    ))

    db.commit()
    db.refresh(r)
    return {
        "success": True,
        "message": f"Welfare check logged for {r.resident_name} by {req.volunteer_name}",
        "updated_hours_since_activity": r.hours_since_activity,
        "risk_level": r.risk_level
    }

@router.get("/alerts/{municipality_id}")
def get_critical_alerts(municipality_id: str, db: Session = Depends(get_db)):
    """
    Returns active emergencies where resident has zero activity for > 24 hours.
    Used by Welfare Coordinator (Suzuki-san) for rapid life safety triage.
    """
    emergencies = db.query(ElderlyResident).filter(
        ElderlyResident.municipality_id == municipality_id,
        ElderlyResident.hours_since_activity >= 24.0
    ).all()

    alerts = []
    for em in emergencies:
        alerts.append({
            "resident_id": em.id,
            "resident_name": em.resident_name,
            "age": em.age,
            "address": em.address,
            "hours_silent": round(em.hours_since_activity, 1),
            "emergency_contact": f"{em.emergency_contact_name} ({em.emergency_contact_phone})",
            "assigned_volunteer": em.assigned_volunteer,
            "severity": "CRITICAL",
            "recommended_action": "緊急駆けつけ要請 (Immediate physical welfare dispatch required)",
            "sla_remaining_minutes": max(5, int((30.0 - em.hours_since_activity) * 60))
        })

    return {
        "municipality_id": municipality_id,
        "active_emergency_count": len(alerts),
        "zero_miss_target_met": (len(alerts) == 0),
        "critical_alerts": alerts
    }
