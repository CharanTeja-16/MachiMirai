from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class LoginRequest(BaseModel):
    email: str
    password: str

class SwitchPersonaRequest(BaseModel):
    role: str # mayor, prefectural_planner, welfare_coordinator, citizen
    municipality_id: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    municipality_id: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# --- Municipality Schemas ---
class MunicipalitySummary(BaseModel):
    id: str
    municipality_code: str
    municipality_name: str
    municipality_name_en: Optional[str]
    prefecture: str
    municipality_type: str
    area_sq_km: float
    population_current: int
    population_peak: int
    population_peak_year: int
    elderly_ratio: float
    child_ratio: float
    working_ratio: float
    total_fertility_rate: float
    net_migration_annual: int
    fiscal_independence_ratio: float
    akiya_count: int
    survival_risk_score: float
    latitude: float
    longitude: float

class MunicipalityDetail(MunicipalitySummary):
    pass


# --- Demographic Schemas ---
class AgeSexCohort(BaseModel):
    age_group: str
    male: int
    female: int
    total: int

class PopulationPyramidData(BaseModel):
    year: int
    cohorts: List[AgeSexCohort]

class NeighborhoodStat(BaseModel):
    id: str
    neighborhood_code: str
    neighborhood_name: str
    latitude: float
    longitude: float
    total_population: int
    age_0_14: int
    age_15_64: int
    age_65_plus: int
    age_75_plus: int
    households: int
    single_elderly_households: int
    population_density: float
    change_5yr_pct: float
    compact_zone_status: str

class DemographicCountdownItem(BaseModel):
    threshold: int
    crossed_year: Optional[int]
    years_remaining: Optional[int]
    status: str

class DemographicDashboardData(BaseModel):
    municipality: MunicipalitySummary
    current_year: int
    pyramid_current: List[AgeSexCohort]
    pyramid_2036: List[AgeSexCohort]
    pyramid_2046: List[AgeSexCohort]
    pyramid_2056: List[AgeSexCohort]
    projections_summary: List[Dict[str, Any]]
    countdown: List[DemographicCountdownItem]
    neighborhoods: List[NeighborhoodStat]
    vital_stats_monthly: List[Dict[str, Any]]
    prefecture_comparison: Dict[str, Any]


# --- Smart Shrinkage Schemas ---
class PublicFacilitySchema(BaseModel):
    id: str
    municipality_id: str
    facility_name: str
    facility_type: str
    latitude: float
    longitude: float
    capacity: int
    current_utilization_pct: float
    annual_maintenance_cost_yen: int
    age_years: int
    condition: str
    consolidation_candidate: bool
    serving_population: int
    address: Optional[str]

class ConsolidationAction(BaseModel):
    facility_id: str
    action: str # merge_into, close, downsize, repurpose
    target_facility_id: Optional[str] = None
    repurpose_theme: Optional[str] = None

class SimulationScenarioRequest(BaseModel):
    name: str
    description: Optional[str] = None
    actions: List[ConsolidationAction]

class ConsolidationScenarioResponse(BaseModel):
    id: str
    municipality_id: str
    name: str
    description: Optional[str]
    target_facilities: List[Any]
    annual_savings_yen: int
    transition_cost_yen: int
    student_travel_time_delta_min: float
    hospital_30min_coverage_pct: float
    repurposed_plan: Optional[str]
    status: str
    created_at: datetime


# --- Fiscal Schemas ---
class FiscalYearRecordSchema(BaseModel):
    fiscal_year: int
    tax_revenue_yen: int
    national_transfers_yen: int
    other_revenue_yen: int
    total_revenue_yen: int
    welfare_expenditure_yen: int
    infra_expenditure_yen: int
    education_expenditure_yen: int
    admin_expenditure_yen: int
    total_expenditure_yen: int
    net_surplus_deficit_yen: int
    debt_service_ratio: float
    is_projected: bool

class FiscalForecastResponse(BaseModel):
    municipality_id: str
    records: List[FiscalYearRecordSchema]
    fiscal_cliff_year: Optional[int]
    years_to_cliff: Optional[int]
    total_unmitigated_deficit_20yr_yen: int
    fiscal_independence_ratio: float
    peer_benchmark: List[Dict[str, Any]]


# --- Akiya Schemas ---
class AkiyaSchema(BaseModel):
    id: str
    municipality_id: str
    address: str
    latitude: float
    longitude: float
    building_age_years: int
    floor_area_sqm: float
    condition: str
    risk_score: float
    fire_risk: float
    collapse_risk: float
    pest_risk: float
    owner_known: bool
    owner_contacted: bool
    owner_status: str
    proposed_action: str
    estimated_demolition_cost_yen: int
    estimated_renovation_cost_yen: int
    last_inspection_date: Optional[str]
    photo_url: Optional[str]

class AkiyaCreateRequest(BaseModel):
    address: str
    latitude: float
    longitude: float
    building_age_years: int
    floor_area_sqm: float
    condition: str
    fire_risk: float
    collapse_risk: float
    pest_risk: float
    owner_known: bool = False
    proposed_action: str = "pending"

class AkiyaStatusUpdateRequest(BaseModel):
    owner_contacted: Optional[bool] = None
    owner_status: Optional[str] = None
    proposed_action: Optional[str] = None
    condition: Optional[str] = None


# --- Elderly Schemas ---
class ElderlyResidentSchema(BaseModel):
    id: str
    municipality_id: str
    resident_name: str
    age: int
    living_alone: bool
    health_conditions: List[str]
    mobility_level: str
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    hours_since_activity: float
    risk_level: str
    assigned_volunteer: Optional[str]
    fall_incidents_last_year: int
    ambulance_calls_last_year: int
    is_emergency_flagged: bool

class CheckinLogRequest(BaseModel):
    notes: Optional[str] = "Checked in person. Resident in good spirits."
    health_status: str = "stable"
    volunteer_name: str

class SensorTelemetryPoint(BaseModel):
    sensor_type: str
    value: float
    unit: str
    timestamp: str
    is_anomaly: bool

class ElderlyResidentDetail(ElderlyResidentSchema):
    telemetry: List[SensorTelemetryPoint]


# --- Migration Schemas ---
class AttractivenessRadarDimension(BaseModel):
    dimension: str
    dimension_en: str
    score: float # 0 to 100
    prefecture_avg: float
    national_benchmark: float

class MigrationSimulationRequest(BaseModel):
    investment_category: str # childcare, housing_grant, remote_hub, agricultural_start
    investment_yen: int

class MigrationSimulationResponse(BaseModel):
    investment_category: str
    investment_yen: int
    families_attracted: int
    adults_working: int
    children_enrolled: int
    annual_local_tax_gain_yen: int
    ten_year_cumulative_tax_yen: int
    ten_year_net_roi_pct: float
    payback_years: float

class CaseStudy(BaseModel):
    town_name: str
    prefecture: str
    title: str
    summary: str
    key_interventions: List[str]
    results_achieved: str
    applicable_lessons: str
