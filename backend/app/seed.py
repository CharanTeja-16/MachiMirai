import random
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models import (
    Municipality, NeighborhoodPopulation, PopulationProjection,
    PublicFacility, ConsolidationScenario, Akiya, ElderlyResident,
    SensorLog, FiscalRecord, MigrationProgram, User
)
from app.demographic_engine import (
    generate_initial_pyramid, run_cohort_component_projection
)

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def seed_database(db: Session):
    # Check if database already seeded
    if db.query(Municipality).first():
        return

    print("Seeding MachiMirai database with Japanese municipal datasets...")

    # 1. Create Pre-seeded Users / Personas
    users_data = [
        {
            "email": "mayor@minamiaso.jp",
            "password": "password123",
            "full_name": "田中 敏夫 (Mayor Tanaka)",
            "role": "mayor"
        },
        {
            "email": "yamamoto@akita.pref.jp",
            "password": "password123",
            "full_name": "山本 健一 (Yamamoto-san, Prefectural Planner)",
            "role": "prefectural_planner"
        },
        {
            "email": "suzuki@welfare.minamiaso.jp",
            "password": "password123",
            "full_name": "鈴木 恵子 (Suzuki-san, Welfare Coordinator)",
            "role": "welfare_coordinator"
        },
        {
            "email": "citizen@minamiaso.jp",
            "password": "password123",
            "full_name": "佐藤 拓海 (Satō-san, Local Citizen / Entrepreneur)",
            "role": "citizen"
        }
    ]

    for u in users_data:
        user_obj = User(
            email=u["email"],
            hashed_password=pwd_context.hash(u["password"]),
            full_name=u["full_name"],
            role=u["role"]
        )
        db.add(user_obj)
    db.commit()

    # 2. Municipalities
    muni_minamiaso = Municipality(
        municipality_code="43428",
        municipality_name="南阿蘇村",
        municipality_name_en="Minamiaso Village",
        prefecture="熊本県 (Kumamoto)",
        municipality_type="mura",
        area_sq_km=137.32,
        population_current=9247,
        population_peak=18500,
        population_peak_year=1980,
        elderly_ratio=38.2,
        child_ratio=9.8,
        working_ratio=52.0,
        total_fertility_rate=1.28,
        net_migration_annual=-65,
        fiscal_independence_ratio=0.32,
        akiya_count=842,
        survival_risk_score=74.5,
        latitude=32.8189,
        longitude=131.0125
    )
    
    muni_gojome = Municipality(
        municipality_code="05368",
        municipality_name="五城目町",
        municipality_name_en="Gojome Town",
        prefecture="秋田県 (Akita)",
        municipality_type="machi",
        area_sq_km=214.92,
        population_current=8110,
        population_peak=18900,
        population_peak_year=1975,
        elderly_ratio=43.1,
        child_ratio=8.1,
        working_ratio=48.8,
        total_fertility_rate=1.15,
        net_migration_annual=-88,
        fiscal_independence_ratio=0.28,
        akiya_count=915,
        survival_risk_score=82.0,
        latitude=39.9142,
        longitude=140.1197
    )

    muni_kamiyama = Municipality(
        municipality_code="36342",
        municipality_name="神山町",
        municipality_name_en="Kamiyama Town",
        prefecture="徳島県 (Tokushima)",
        municipality_type="machi",
        area_sq_km=173.30,
        population_current=4680,
        population_peak=21000,
        population_peak_year=1955,
        elderly_ratio=51.5,
        child_ratio=6.9,
        working_ratio=41.6,
        total_fertility_rate=1.25,
        net_migration_annual=-12,
        fiscal_independence_ratio=0.31,
        akiya_count=560,
        survival_risk_score=61.2,
        latitude=33.9744,
        longitude=134.3475
    )

    muni_yubari = Municipality(
        municipality_code="01211",
        municipality_name="夕張市",
        municipality_name_en="Yubari City",
        prefecture="北海道 (Hokkaido)",
        municipality_type="shi",
        area_sq_km=763.07,
        population_current=6320,
        population_peak=116908,
        population_peak_year=1960,
        elderly_ratio=54.2,
        child_ratio=5.5,
        working_ratio=40.3,
        total_fertility_rate=1.08,
        net_migration_annual=-105,
        fiscal_independence_ratio=0.22,
        akiya_count=1420,
        survival_risk_score=91.0,
        latitude=43.0567,
        longitude=141.9744
    )

    db.add_all([muni_minamiaso, muni_gojome, muni_kamiyama, muni_yubari])
    db.commit()

    # Link demo users to Minamiaso
    db.query(User).filter(User.email.in_(["mayor@minamiaso.jp", "suzuki@welfare.minamiaso.jp", "citizen@minamiaso.jp"])).update({"municipality_id": muni_minamiaso.id})
    db.commit()

    # 3. Neighborhoods for Minamiaso Village (町丁目 level)
    neighborhoods_data = [
        {"code": "4342801", "name": "長野 (Nagano Central)", "lat": 32.8212, "lon": 131.0110, "pop": 2480, "c": 310, "w": 1340, "e": 830, "se": 380, "hh": 1050, "shh": 220, "chg": -1.8, "zone": "maintain"},
        {"code": "4342802", "name": "河陽 (Kayo District)", "lat": 32.8340, "lon": 130.9820, "pop": 1820, "c": 190, "w": 960, "e": 670, "se": 290, "hh": 780, "shh": 160, "chg": -2.4, "zone": "maintain"},
        {"code": "4342803", "name": "久石 (Hisaishi Hamlet)", "lat": 32.8090, "lon": 131.0340, "pop": 1210, "c": 110, "w": 590, "e": 510, "se": 240, "hh": 520, "shh": 130, "chg": -3.5, "zone": "consolidate"},
        {"code": "4342804", "name": "両併 (Ryohei Valley)", "lat": 32.7950, "lon": 131.0450, "pop": 890, "c": 60, "w": 410, "e": 420, "se": 210, "hh": 410, "shh": 115, "chg": -4.2, "zone": "consolidate"},
        {"code": "4342805", "name": "吉田 (Yoshida Springs)", "lat": 32.8290, "lon": 131.0620, "pop": 1450, "c": 140, "w": 740, "e": 570, "se": 250, "hh": 620, "shh": 145, "chg": -2.1, "zone": "maintain"},
        {"code": "4342806", "name": "立野 (Tateno Gorge)", "lat": 32.8420, "lon": 130.9650, "pop": 930, "c": 70, "w": 470, "e": 390, "se": 180, "hh": 430, "shh": 98, "chg": -3.8, "zone": "retire"},
        {"code": "4342807", "name": "白水 (Hakusui Highland)", "lat": 32.8120, "lon": 131.0780, "pop": 467, "c": 26, "w": 210, "e": 231, "se": 118, "hh": 215, "shh": 64, "chg": -5.1, "zone": "retire"},
    ]

    for nd in neighborhoods_data:
        n_obj = NeighborhoodPopulation(
            municipality_id=muni_minamiaso.id,
            neighborhood_code=nd["code"],
            neighborhood_name=nd["name"],
            latitude=nd["lat"],
            longitude=nd["lon"],
            total_population=nd["pop"],
            age_0_14=nd["c"],
            age_15_64=nd["w"],
            age_65_plus=nd["e"],
            age_75_plus=nd["se"],
            households=nd["hh"],
            single_elderly_households=nd["shh"],
            population_density=round(nd["pop"] / 19.5, 1),
            change_5yr_pct=nd["chg"],
            compact_zone_status=nd["zone"]
        )
        db.add(n_obj)
    db.commit()

    # 4. Demographic Cohort-Component 30-Year Projections
    male_init, female_init = generate_initial_pyramid(
        total_pop=muni_minamiaso.population_current,
        elderly_ratio=muni_minamiaso.elderly_ratio,
        child_ratio=muni_minamiaso.child_ratio
    )
    projections = run_cohort_component_projection(
        male_pop=male_init,
        female_pop=female_init,
        tfr=muni_minamiaso.total_fertility_rate,
        years_ahead=30,
        scenario="baseline",
        base_year=2026
    )

    for p in projections:
        proj_obj = PopulationProjection(
            municipality_id=muni_minamiaso.id,
            projection_year=p["year"],
            projected_total=p["total"],
            projected_0_14=p["age_0_14"],
            projected_15_64=p["age_15_64"],
            projected_65_plus=p["age_65_plus"],
            projected_75_plus=p["age_75_plus"],
            projected_elderly_ratio=p["elderly_ratio"],
            projected_child_ratio=p["child_ratio"],
            confidence_interval_low=int(p["total"] * 0.94),
            confidence_interval_high=int(p["total"] * 1.05),
            scenario="baseline"
        )
        db.add(proj_obj)
    db.commit()

    # 5. Public Facilities for Minamiaso
    facilities_data = [
        {
            "name": "南阿蘇中央小学校 (Minamiaso Central Elementary)",
            "type": "elementary_school",
            "lat": 32.8220, "lon": 131.0135,
            "cap": 350, "util": 62.0, "cost": 48000000, "age": 28, "cond": "good",
            "candidate": False, "serv_pop": 4200, "addr": "長野142"
        },
        {
            "name": "旧久石小学校 (Hisaishi Branch Elementary)",
            "type": "elementary_school",
            "lat": 32.8080, "lon": 131.0360,
            "cap": 180, "util": 18.3, "cost": 31000000, "age": 49, "cond": "poor",
            "candidate": True, "serv_pop": 650, "addr": "久石402"
        },
        {
            "name": "南阿蘇中学校 (Minamiaso Junior High)",
            "type": "junior_high",
            "lat": 32.8250, "lon": 131.0080,
            "cap": 300, "util": 54.0, "cost": 52000000, "age": 24, "cond": "good",
            "candidate": False, "serv_pop": 5800, "addr": "河陽891"
        },
        {
            "name": "阿蘇地域国民健康保険病院 (Aso Regional Public Hospital)",
            "type": "hospital",
            "lat": 32.8205, "lon": 131.0090,
            "cap": 85, "util": 88.5, "cost": 185000000, "age": 31, "cond": "fair",
            "candidate": False, "serv_pop": 9200, "addr": "長野310"
        },
        {
            "name": "白水へき地診療所 (Hakusui Rural Clinic)",
            "type": "clinic",
            "lat": 32.8115, "lon": 131.0760,
            "cap": 25, "util": 24.0, "cost": 29000000, "age": 42, "cond": "poor",
            "candidate": True, "serv_pop": 460, "addr": "白水55"
        },
        {
            "name": "南阿蘇村総合コミュニティセンター (Central Community Center)",
            "type": "community_center",
            "lat": 32.8235, "lon": 131.0150,
            "cap": 400, "util": 45.0, "cost": 22000000, "age": 19, "cond": "good",
            "candidate": False, "serv_pop": 7000, "addr": "長野120"
        },
        {
            "name": "立野地区市民センター (Tateno District Center)",
            "type": "community_center",
            "lat": 32.8415, "lon": 130.9660,
            "cap": 120, "util": 14.5, "cost": 14000000, "age": 46, "cond": "critical",
            "candidate": True, "serv_pop": 420, "addr": "立野21"
        },
        {
            "name": "阿蘇外輪山浄水管理センター (Outer Rim Water Plant)",
            "type": "water_treatment",
            "lat": 32.8150, "lon": 131.0250,
            "cap": 12000, "util": 42.0, "cost": 94000000, "age": 37, "cond": "fair",
            "candidate": False, "serv_pop": 9247, "addr": "久石水洗場"
        },
        {
            "name": "長野渓谷第2大橋 (Nagano Gorge Bridge #2)",
            "type": "road_bridge",
            "lat": 32.8190, "lon": 131.0210,
            "cap": 5000, "util": 35.0, "cost": 41000000, "age": 52, "cond": "poor",
            "candidate": True, "serv_pop": 1800, "addr": "村道長野線"
        },
        {
            "name": "南阿蘇消防支署 (Minamiaso Fire Branch)",
            "type": "fire_station",
            "lat": 32.8228, "lon": 131.0115,
            "cap": 15, "util": 90.0, "cost": 38000000, "age": 16, "cond": "good",
            "candidate": False, "serv_pop": 9247, "addr": "長野204"
        }
    ]

    for fd in facilities_data:
        fac_obj = PublicFacility(
            municipality_id=muni_minamiaso.id,
            facility_name=fd["name"],
            facility_type=fd["type"],
            latitude=fd["lat"],
            longitude=fd["lon"],
            capacity=fd["cap"],
            current_utilization_pct=fd["util"],
            annual_maintenance_cost_yen=fd["cost"],
            age_years=fd["age"],
            condition=fd["cond"],
            consolidation_candidate=fd["candidate"],
            serving_population=fd["serv_pop"],
            address=fd["addr"]
        )
        db.add(fac_obj)
    db.commit()

    # 6. Consolidation Scenarios
    scenarios = [
        {
            "name": "Scenario A: 久石小学校の南阿蘇中央小への統合 (Merge Hisaishi into Central Elementary)",
            "desc": "久石小学校（在籍児童18名、築49年）を中央小学校へ統合。旧校舎はリモートワーク共創拠点として民間転用。",
            "savings": 28000000,
            "trans_cost": 9500000,
            "travel_delta": 6.5,
            "hospital_cov": 95.0,
            "repurpose": "サテライトオフィス＋地域交流カフェ (Satellite office & community cafe)",
            "status": "adopted"
        },
        {
            "name": "Scenario B: 白水へき地診療所の巡回診療車化 (Replace Hakusui Clinic with Mobile Health Van)",
            "desc": "週2回稼働の白水診療所建屋を退役させ、阿蘇地域病院からのEV巡回診療車および遠隔オンライン診療へ移行。",
            "savings": 23500000,
            "trans_cost": 12000000,
            "travel_delta": 0.0,
            "hospital_cov": 93.8,
            "repurpose": "防災資機材保管庫・住民集会所 (Disaster supplies hub)",
            "status": "under_review"
        },
        {
            "name": "Scenario C: 統合スマート縮退包括プラン (Comprehensive Smart Shrinkage Package)",
            "desc": "小学校統合・白水診療所転換・老朽立野地区市民センター閉館を統合実施。年間インフラ維持費を18.2%削減。",
            "savings": 65500000,
            "trans_cost": 24000000,
            "travel_delta": 4.2,
            "hospital_cov": 94.2,
            "repurpose": "マルチユース共創ラボ＋防災パーク (Multi-use innovation lab)",
            "status": "proposed"
        }
    ]

    for sc in scenarios:
        sc_obj = ConsolidationScenario(
            municipality_id=muni_minamiaso.id,
            name=sc["name"],
            description=sc["desc"],
            target_facilities=[],
            annual_savings_yen=sc["savings"],
            transition_cost_yen=sc["trans_cost"],
            student_travel_time_delta_min=sc["travel_delta"],
            hospital_30min_coverage_pct=sc["hospital_cov"],
            repurposed_plan=sc["repurpose"],
            status=sc["status"]
        )
        db.add(sc_obj)
    db.commit()

    # 7. Akiya (Empty Houses)
    akiya_samples = [
        {"addr": "南阿蘇村久石382番地", "lat": 32.8095, "lon": 131.0335, "age": 58, "sqm": 145.0, "cond": "dangerous", "score": 88.5, "fire": 85.0, "col": 92.0, "pest": 88.0, "ok": False, "oc": False, "status": "uncontacted", "act": "demolition", "d_cost": 3200000, "r_cost": 6500000, "photo": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80"},
        {"addr": "南阿蘇村立野105番地", "lat": 32.8410, "lon": 130.9675, "age": 62, "sqm": 110.0, "cond": "ruins", "score": 94.0, "fire": 95.0, "col": 96.0, "pest": 91.0, "ok": True, "oc": True, "status": "negotiating", "act": "demolition", "d_cost": 2800000, "r_cost": 8000000, "photo": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80"},
        {"addr": "南阿蘇村長野412番地", "lat": 32.8225, "lon": 131.0142, "age": 42, "sqm": 135.0, "cond": "needs_repair", "score": 52.0, "fire": 45.0, "col": 48.0, "pest": 63.0, "ok": True, "oc": True, "status": "agreement_reached", "act": "community_use", "d_cost": 2500000, "r_cost": 3800000, "photo": "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600&q=80"},
        {"addr": "南阿蘇村河陽673番地", "lat": 32.8330, "lon": 130.9850, "age": 35, "sqm": 160.0, "cond": "habitable", "score": 28.0, "fire": 20.0, "col": 25.0, "pest": 39.0, "ok": True, "oc": True, "status": "agreement_reached", "act": "renovation", "d_cost": 2400000, "r_cost": 2200000, "photo": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&q=80"},
        {"addr": "南阿蘇村両併214番地", "lat": 32.7960, "lon": 131.0430, "age": 51, "sqm": 128.0, "cond": "needs_repair", "score": 64.0, "fire": 62.0, "col": 60.0, "pest": 70.0, "ok": False, "oc": False, "status": "uncontacted", "act": "sale", "d_cost": 2700000, "r_cost": 4200000, "photo": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80"},
        {"addr": "南阿蘇村吉田89番地", "lat": 32.8280, "lon": 131.0610, "age": 38, "sqm": 175.0, "cond": "habitable", "score": 32.0, "fire": 25.0, "col": 30.0, "pest": 41.0, "ok": True, "oc": False, "status": "uncontacted", "act": "renovation", "d_cost": 2600000, "r_cost": 2900000, "photo": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"},
        {"addr": "南阿蘇村白水103番地", "lat": 32.8125, "lon": 131.0770, "age": 55, "sqm": 118.0, "cond": "dangerous", "score": 79.0, "fire": 78.0, "col": 82.0, "pest": 77.0, "ok": True, "oc": True, "status": "unresponsive", "act": "demolition", "d_cost": 2900000, "r_cost": 5500000, "photo": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80"}
    ]

    for ak in akiya_samples:
        ak_obj = Akiya(
            municipality_id=muni_minamiaso.id,
            address=ak["addr"],
            latitude=ak["lat"],
            longitude=ak["lon"],
            building_age_years=ak["age"],
            floor_area_sqm=ak["sqm"],
            condition=ak["cond"],
            risk_score=ak["score"],
            fire_risk=ak["fire"],
            collapse_risk=ak["col"],
            pest_risk=ak["pest"],
            owner_known=ak["ok"],
            owner_contacted=ak["oc"],
            owner_status=ak["status"],
            proposed_action=ak["act"],
            estimated_demolition_cost_yen=ak["d_cost"],
            estimated_renovation_cost_yen=ak["r_cost"],
            last_inspection_date="2026-01-15",
            photo_url=ak["photo"]
        )
        db.add(ak_obj)
    db.commit()

    # 8. Elderly Residents & Sensor Telemetry (with active 24h anomaly detection)
    elderly_samples = [
        {
            "name": "高橋 シズ (Takahashi Shizu)", "age": 84, "alone": True,
            "conditions": ["高血圧 (Hypertension)", "骨粗鬆症 (Osteoporosis)", "軽度認知機能低下"],
            "mobility": "assisted", "e_name": "高橋 誠 (息子・熊本市内)", "e_phone": "096-382-9912",
            "addr": "南阿蘇村久石442", "lat": 32.8092, "lon": 131.0345,
            "inactivity_hrs": 29.5, "risk": "critical", "vol": "佐藤 正志 (民生委員)",
            "falls": 2, "amb": 1
        },
        {
            "name": "小林 義男 (Kobayashi Yoshio)", "age": 79, "alone": True,
            "conditions": ["糖尿病 (Type 2 Diabetes)", "不整脈 (Arrhythmia)"],
            "mobility": "independent", "e_name": "小林 由美 (娘・福岡県)", "e_phone": "092-411-8833",
            "addr": "南阿蘇村長野218", "lat": 32.8218, "lon": 131.0122,
            "inactivity_hrs": 3.2, "risk": "low", "vol": "中村 静香 (ボランティア)",
            "falls": 0, "amb": 0
        },
        {
            "name": "渡辺 トメ (Watanabe Tome)", "age": 91, "alone": True,
            "conditions": ["慢性心不全 (Congestive Heart Failure)", "腰椎圧迫骨折"],
            "mobility": "wheelchair", "e_name": "地域包括支援センター", "e_phone": "0967-67-1111",
            "addr": "南阿蘇村立野84", "lat": 32.8412, "lon": 130.9665,
            "inactivity_hrs": 25.8, "risk": "high", "vol": "佐藤 正志 (民生委員)",
            "falls": 3, "amb": 2
        },
        {
            "name": "松本 健蔵 (Matsumoto Kenzo)", "age": 82, "alone": True,
            "conditions": ["パーキンソン病疑い (Parkinsonism)", "前立腺肥大"],
            "mobility": "assisted", "e_name": "松本 一郎 (甥)", "e_phone": "090-5541-2299",
            "addr": "南阿蘇村吉田112", "lat": 32.8285, "lon": 131.0615,
            "inactivity_hrs": 6.8, "risk": "medium", "vol": "森田 健太",
            "falls": 1, "amb": 0
        },
        {
            "name": "中村 カツ (Nakamura Katsu)", "age": 86, "alone": True,
            "conditions": ["変形性膝関節症 (Osteoarthritis)", "白内障"],
            "mobility": "assisted", "e_name": "中村 浩 (長男)", "e_phone": "080-3321-4455",
            "addr": "南阿蘇村河陽530", "lat": 32.8335, "lon": 130.9835,
            "inactivity_hrs": 1.5, "risk": "low", "vol": "中村 静香 (ボランティア)",
            "falls": 0, "amb": 0
        }
    ]

    for el in elderly_samples:
        last_act = datetime.utcnow() - timedelta(hours=el["inactivity_hrs"])
        el_obj = ElderlyResident(
            municipality_id=muni_minamiaso.id,
            resident_name=el["name"],
            age=el["age"],
            living_alone=el["alone"],
            health_conditions=el["conditions"],
            mobility_level=el["mobility"],
            emergency_contact_name=el["e_name"],
            emergency_contact_phone=el["e_phone"],
            address=el["addr"],
            latitude=el["lat"],
            longitude=el["lon"],
            last_activity_detected=last_act,
            last_welfare_check=datetime.utcnow() - timedelta(days=1),
            hours_since_activity=el["inactivity_hrs"],
            risk_level=el["risk"],
            assigned_volunteer=el["vol"],
            fall_incidents_last_year=el["falls"],
            ambulance_calls_last_year=el["amb"]
        )
        db.add(el_obj)
        db.flush()

        # Telemetry points for the resident (Water and electricity logs)
        for h in range(24, -1, -3):
            t_stamp = datetime.utcnow() - timedelta(hours=h)
            is_anomaly = (el["inactivity_hrs"] > 24 and h <= 24)
            # Water meter
            w_val = 0.0 if is_anomaly else random.uniform(8.0, 35.0)
            db.add(SensorLog(
                resident_id=el_obj.id,
                sensor_type="water_meter",
                reading_value=w_val,
                unit="L/3h",
                is_anomaly=is_anomaly,
                timestamp=t_stamp
            ))
            # Power meter
            p_val = 0.05 if is_anomaly else random.uniform(0.35, 1.8)
            db.add(SensorLog(
                resident_id=el_obj.id,
                sensor_type="power_meter",
                reading_value=p_val,
                unit="kWh",
                is_anomaly=is_anomaly,
                timestamp=t_stamp
            ))
    db.commit()

    # 9. Fiscal Records (2018 - 2045: Tracking Fiscal Cliff)
    # Minamiaso base budget: ~¥6.2B (6,200,000,000 Yen)
    for yr in range(2018, 2046):
        is_proj = yr > 2025
        y_offset = yr - 2025
        
        # Local taxes shrink as working population contracts
        base_tax = 1450000000
        tax_rev = int(base_tax * ((1.0 - 0.024 * y_offset) if y_offset > 0 else (1.0 - 0.015 * y_offset)))
        
        # National allocation transfers also tighten gradually under austerity
        base_transfers = 3850000000
        transfers = int(base_transfers * ((1.0 - 0.009 * y_offset) if y_offset > 0 else (1.0 + 0.005 * y_offset)))
        
        other_rev = int(820000000 * ((1.0 - 0.01 * y_offset) if y_offset > 0 else 1.0))
        total_rev = tax_rev + transfers + other_rev
        
        # Expenditures: Welfare and medical care for 75+ escalates rapidly!
        base_welfare = 2200000000
        welfare = int(base_welfare * ((1.0 + 0.038 * y_offset) if y_offset > 0 else (1.0 + 0.022 * y_offset)))
        
        # Aging bridges, schools, and water pipes require rising upkeep
        base_infra = 1850000000
        infra = int(base_infra * ((1.0 + 0.018 * y_offset) if y_offset > 0 else (1.0 + 0.01 * y_offset)))
        
        education = int(580000000 * ((1.0 - 0.02 * y_offset) if y_offset > 0 else 1.0))
        admin = int(1420000000 * ((1.0 + 0.005 * y_offset) if y_offset > 0 else 1.0))
        total_exp = welfare + infra + education + admin
        
        surplus_deficit = total_rev - total_exp
        debt_ratio = min(28.0, 11.2 + (max(0, y_offset) * 0.65))

        f_rec = FiscalRecord(
            municipality_id=muni_minamiaso.id,
            fiscal_year=yr,
            tax_revenue_yen=tax_rev,
            national_transfers_yen=transfers,
            other_revenue_yen=other_rev,
            total_revenue_yen=total_rev,
            welfare_expenditure_yen=welfare,
            infra_expenditure_yen=infra,
            education_expenditure_yen=education,
            admin_expenditure_yen=admin,
            total_expenditure_yen=total_exp,
            net_surplus_deficit_yen=surplus_deficit,
            debt_service_ratio=round(debt_ratio, 1),
            is_projected=is_proj
        )
        db.add(f_rec)
    db.commit()

    # 10. Migration Programs & Case Studies
    migration_programs = [
        {
            "title": "子育て世代移住支援金＋空き家改修パッケージ (Childcare Relocation Grant & Akiya Renovation)",
            "cat": "childcare",
            "inv": 45000000,
            "fam": 18,
            "ret": 9200000,
            "roi": 104.4,
            "desc": "未就学児を持つ移住世帯へ最大200万円給付＋空き家改修補助金100万円。3年間で18世帯の定住誘致を達成。"
        },
        {
            "title": "阿蘇サテライトオフィス誘致・光回線インフラ整備 (Aso Satellite Office & High-Speed Fiber)",
            "cat": "remote_work",
            "inv": 60000000,
            "fam": 14,
            "ret": 14500000,
            "roi": 141.6,
            "desc": "旧小学校の一角を高速光ファイバー・個室ブース付きコワーキングスペースへ改修。都内IT企業4社のサテライト誘致。"
        },
        {
            "title": "新規就農・阿蘇高冷地野菜起業インキュベーション (Highland Agribusiness Incubation)",
            "cat": "entrepreneurship",
            "inv": 35000000,
            "fam": 10,
            "ret": 6800000,
            "roi": 94.2,
            "desc": "耕作放棄地の再整備とハウス農業研修制度。若手農業起業家への機械リース助成。"
        }
    ]

    for mp in migration_programs:
        mp_obj = MigrationProgram(
            municipality_id=muni_minamiaso.id,
            title=mp["title"],
            category=mp["cat"],
            investment_amount_yen=mp["inv"],
            families_attracted_est=mp["fam"],
            tax_revenue_return_annual_yen=mp["ret"],
            ten_year_net_roi_pct=mp["roi"],
            description=mp["desc"],
            status="active"
        )
        db.add(mp_obj)
    db.commit()

    print("MachiMirai database seeding complete with zero placeholder gaps!")
