from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Municipality
from app.schemas import MunicipalitySummary

router = APIRouter(prefix="/api/municipalities", tags=["Municipalities"])

@router.get("", response_model=List[MunicipalitySummary])
def get_municipalities(db: Session = Depends(get_db)):
    municipalities = db.query(Municipality).order_by(Municipality.population_current.desc()).all()
    return municipalities

@router.get("/{id}", response_model=MunicipalitySummary)
def get_municipality_by_id(id: str, db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.id == id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return muni

@router.get("/code/{code}", response_model=MunicipalitySummary)
def get_municipality_by_code(code: str, db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.municipality_code == code).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")
    return muni
