from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FiscalRecord, Municipality
from app.schemas import FiscalForecastResponse, FiscalYearRecordSchema

router = APIRouter(prefix="/api/fiscal", tags=["Fiscal Sustainability Monitor"])

@router.get("/forecast/{municipality_id}", response_model=FiscalForecastResponse)
def get_fiscal_forecast(municipality_id: str, db: Session = Depends(get_db)):
    muni = db.query(Municipality).filter(Municipality.id == municipality_id).first()
    if not muni:
        raise HTTPException(status_code=404, detail="Municipality not found")

    records = db.query(FiscalRecord).filter(
        FiscalRecord.municipality_id == municipality_id
    ).order_by(FiscalRecord.fiscal_year.asc()).all()

    # Detect fiscal cliff crossover year (first projected year where net deficit occurs)
    cliff_year = None
    total_unmitigated_deficit = 0
    for r in records:
        if r.is_projected:
            if r.net_surplus_deficit_yen < 0:
                if cliff_year is None:
                    cliff_year = r.fiscal_year
                total_unmitigated_deficit += abs(r.net_surplus_deficit_yen)

    current_yr = 2026
    years_to_cliff = (cliff_year - current_yr) if cliff_year else None

    # Peer comparison benchmarking (compare against other Japanese depopulating towns)
    peers = [
        {"name": "南阿蘇村 (Minamiaso, Kumamoto)", "pop": 9247, "fiscal_index": 0.32, "grant_dep": 62.1, "risk": "High"},
        {"name": "五城目町 (Gojome, Akita)", "pop": 8110, "fiscal_index": 0.28, "grant_dep": 68.4, "risk": "Critical"},
        {"name": "神山町 (Kamiyama, Tokushima)", "pop": 4680, "fiscal_index": 0.31, "grant_dep": 64.0, "risk": "Medium"},
        {"name": "夕張市 (Yubari, Hokkaido)", "pop": 6320, "fiscal_index": 0.22, "grant_dep": 74.5, "risk": "Bankrupt (Reconstruction)"},
        {"name": "全国小規模町村平均 (National Small Town Avg)", "pop": 8500, "fiscal_index": 0.36, "grant_dep": 58.2, "risk": "Average"}
    ]

    return FiscalForecastResponse(
        municipality_id=municipality_id,
        records=[
            FiscalYearRecordSchema(
                fiscal_year=r.fiscal_year,
                tax_revenue_yen=r.tax_revenue_yen,
                national_transfers_yen=r.national_transfers_yen,
                other_revenue_yen=r.other_revenue_yen,
                total_revenue_yen=r.total_revenue_yen,
                welfare_expenditure_yen=r.welfare_expenditure_yen,
                infra_expenditure_yen=r.infra_expenditure_yen,
                education_expenditure_yen=r.education_expenditure_yen,
                admin_expenditure_yen=r.admin_expenditure_yen,
                total_expenditure_yen=r.total_expenditure_yen,
                net_surplus_deficit_yen=r.net_surplus_deficit_yen,
                debt_service_ratio=r.debt_service_ratio,
                is_projected=r.is_projected
            ) for r in records
        ],
        fiscal_cliff_year=cliff_year,
        years_to_cliff=years_to_cliff,
        total_unmitigated_deficit_20yr_yen=total_unmitigated_deficit,
        fiscal_independence_ratio=muni.fiscal_independence_ratio,
        peer_benchmark=peers
    )
