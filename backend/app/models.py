import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Municipality(Base):
    __tablename__ = "municipalities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_code = Column(String(10), unique=True, nullable=False, index=True) # JIS X 0402
    municipality_name = Column(String(255), nullable=False) # e.g., 南阿蘇村
    municipality_name_en = Column(String(255), nullable=True) # e.g., Minamiaso
    prefecture = Column(String(100), nullable=False) # e.g., 熊本県 (Kumamoto)
    municipality_type = Column(String(20), default="machi") # shi, ku, machi, mura
    area_sq_km = Column(Float, default=0.0)
    population_current = Column(Integer, default=0)
    population_peak = Column(Integer, default=0)
    population_peak_year = Column(Integer, default=1980)
    elderly_ratio = Column(Float, default=0.0) # % aged 65+
    child_ratio = Column(Float, default=0.0) # % aged 0-14
    working_ratio = Column(Float, default=0.0) # % aged 15-64
    total_fertility_rate = Column(Float, default=1.2)
    net_migration_annual = Column(Integer, default=-50)
    fiscal_independence_ratio = Column(Float, default=0.35) # 財政力指数
    akiya_count = Column(Integer, default=0)
    survival_risk_score = Column(Float, default=50.0) # 0-100 composite risk
    latitude = Column(Float, default=32.8)
    longitude = Column(Float, default=131.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    neighborhoods = relationship("NeighborhoodPopulation", back_populates="municipality", cascade="all, delete-orphan")
    projections = relationship("PopulationProjection", back_populates="municipality", cascade="all, delete-orphan")
    facilities = relationship("PublicFacility", back_populates="municipality", cascade="all, delete-orphan")
    akiya_properties = relationship("Akiya", back_populates="municipality", cascade="all, delete-orphan")
    elderly_residents = relationship("ElderlyResident", back_populates="municipality", cascade="all, delete-orphan")
    fiscal_records = relationship("FiscalRecord", back_populates="municipality", cascade="all, delete-orphan")
    consolidation_scenarios = relationship("ConsolidationScenario", back_populates="municipality", cascade="all, delete-orphan")


class NeighborhoodPopulation(Base):
    __tablename__ = "neighborhood_population"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    neighborhood_code = Column(String(20), nullable=False)
    neighborhood_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    census_year = Column(Integer, default=2025)
    total_population = Column(Integer, default=0)
    age_0_14 = Column(Integer, default=0)
    age_15_64 = Column(Integer, default=0)
    age_65_plus = Column(Integer, default=0)
    age_75_plus = Column(Integer, default=0)
    households = Column(Integer, default=0)
    single_elderly_households = Column(Integer, default=0)
    population_density = Column(Float, default=0.0)
    change_5yr_pct = Column(Float, default=0.0)
    compact_zone_status = Column(String(50), default="maintain") # maintain, consolidate, retire
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="neighborhoods")


class PopulationProjection(Base):
    __tablename__ = "population_projections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    neighborhood_code = Column(String(20), nullable=True)
    projection_year = Column(Integer, nullable=False)
    model_version = Column(String(50), default="Cohort-Component-NIPSSR-v2.1")
    projected_total = Column(Integer, nullable=False)
    projected_0_14 = Column(Integer, default=0)
    projected_15_64 = Column(Integer, default=0)
    projected_65_plus = Column(Integer, default=0)
    projected_75_plus = Column(Integer, default=0)
    projected_elderly_ratio = Column(Float, default=0.0)
    projected_child_ratio = Column(Float, default=0.0)
    confidence_interval_low = Column(Integer, default=0)
    confidence_interval_high = Column(Integer, default=0)
    scenario = Column(String(20), default="baseline") # baseline, optimistic, pessimistic
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="projections")


class PublicFacility(Base):
    __tablename__ = "public_facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    facility_name = Column(String(255), nullable=False)
    facility_type = Column(String(50), nullable=False) # elementary_school, junior_high, hospital, clinic, community_center, library, fire_station, post_office, water_treatment, road_bridge
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=100)
    current_utilization_pct = Column(Float, default=50.0)
    annual_maintenance_cost_yen = Column(Integer, default=10000000) # Yen
    age_years = Column(Integer, default=30)
    condition = Column(String(20), default="fair") # good, fair, poor, critical
    consolidation_candidate = Column(Boolean, default=False)
    serving_population = Column(Integer, default=1000)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="facilities")


class ConsolidationScenario(Base):
    __tablename__ = "consolidation_scenarios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_facilities = Column(JSON, default=list) # List of facility IDs & actions
    annual_savings_yen = Column(Integer, default=0)
    transition_cost_yen = Column(Integer, default=0)
    student_travel_time_delta_min = Column(Float, default=0.0)
    hospital_30min_coverage_pct = Column(Float, default=95.0)
    repurposed_plan = Column(String(255), nullable=True) # e.g., Community daycare + maker hub
    status = Column(String(30), default="proposed") # proposed, under_review, adopted
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="consolidation_scenarios")


class Akiya(Base):
    __tablename__ = "akiya"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    address = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    building_age_years = Column(Integer, default=45)
    floor_area_sqm = Column(Float, default=120.0)
    condition = Column(String(30), default="needs_repair") # habitable, needs_repair, dangerous, ruins
    risk_score = Column(Float, default=50.0) # 0-100 composite (fire, collapse, pest)
    fire_risk = Column(Float, default=40.0)
    collapse_risk = Column(Float, default=40.0)
    pest_risk = Column(Float, default=40.0)
    owner_known = Column(Boolean, default=False)
    owner_contacted = Column(Boolean, default=False)
    owner_status = Column(String(50), default="uncontacted") # uncontacted, negotiating, agreement_reached, unresponsive
    proposed_action = Column(String(50), default="pending") # renovation, demolition, sale, community_use, pending
    estimated_demolition_cost_yen = Column(Integer, default=2500000)
    estimated_renovation_cost_yen = Column(Integer, default=4000000)
    last_inspection_date = Column(String(20), nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="akiya_properties")


class ElderlyResident(Base):
    __tablename__ = "elderly_residents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    resident_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=False)
    living_alone = Column(Boolean, default=True)
    health_conditions = Column(JSON, default=list) # e.g. ["Hypertension", "Early Dementia", "Fall risk"]
    mobility_level = Column(String(30), default="independent") # independent, assisted, wheelchair, bedridden
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(30), nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_activity_detected = Column(DateTime, default=datetime.utcnow)
    last_welfare_check = Column(DateTime, default=datetime.utcnow)
    hours_since_activity = Column(Float, default=4.0)
    risk_level = Column(String(20), default="medium") # low, medium, high, critical
    assigned_volunteer = Column(String(255), nullable=True)
    fall_incidents_last_year = Column(Integer, default=0)
    ambulance_calls_last_year = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="elderly_residents")
    sensor_logs = relationship("SensorLog", back_populates="resident", cascade="all, delete-orphan")


class SensorLog(Base):
    __tablename__ = "sensor_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resident_id = Column(String(36), ForeignKey("elderly_residents.id"), nullable=False, index=True)
    sensor_type = Column(String(50), nullable=False) # water_meter, power_meter, door_sensor, motion_detector
    reading_value = Column(Float, nullable=False)
    unit = Column(String(20), default="L/h") # L/h, kWh, events
    is_anomaly = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    resident = relationship("ElderlyResident", back_populates="sensor_logs")


class FiscalRecord(Base):
    __tablename__ = "fiscal_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    fiscal_year = Column(Integer, nullable=False)
    tax_revenue_yen = Column(Integer, nullable=False) # 地方税
    national_transfers_yen = Column(Integer, nullable=False) # 地方交付税
    other_revenue_yen = Column(Integer, default=0)
    total_revenue_yen = Column(Integer, nullable=False)
    welfare_expenditure_yen = Column(Integer, nullable=False) # 社会保障費
    infra_expenditure_yen = Column(Integer, nullable=False) # 公共施設・インフラ維持管理費
    education_expenditure_yen = Column(Integer, default=0)
    admin_expenditure_yen = Column(Integer, default=0)
    total_expenditure_yen = Column(Integer, nullable=False)
    net_surplus_deficit_yen = Column(Integer, nullable=False)
    debt_service_ratio = Column(Float, default=12.5) # 実質公債費比率
    is_projected = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    municipality = relationship("Municipality", back_populates="fiscal_records")


class MigrationProgram(Base):
    __tablename__ = "migration_programs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    municipality_id = Column(String(36), ForeignKey("municipalities.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False) # childcare, housing_subsidy, remote_work, entrepreneurship
    investment_amount_yen = Column(Integer, default=30000000)
    families_attracted_est = Column(Integer, default=15)
    tax_revenue_return_annual_yen = Column(Integer, default=7500000)
    ten_year_net_roi_pct = Column(Float, default=150.0)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="active") # active, planned, completed
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # mayor, prefectural_planner, welfare_coordinator, citizen
    municipality_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
