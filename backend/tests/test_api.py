import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_get_municipalities():
    response = client.get("/api/municipalities")
    assert response.status_code == 200
    munis = response.json()
    assert len(munis) >= 4
    # Check Minamiaso
    minamiaso = next((m for m in munis if m["municipality_code"] == "43428"), None)
    assert minamiaso is not None
    assert minamiaso["municipality_name"] == "南阿蘇村"
    assert minamiaso["elderly_ratio"] == 38.2

def test_demographic_dashboard():
    # Get Minamiaso ID
    m_resp = client.get("/api/municipalities")
    minamiaso_id = m_resp.json()[0]["id"]
    
    response = client.get(f"/api/demographics/dashboard/{minamiaso_id}")
    assert response.status_code == 200
    data = response.json()
    assert "pyramid_current" in data
    assert "pyramid_2056" in data
    assert "countdown" in data
    assert "neighborhoods" in data
    assert len(data["neighborhoods"]) >= 5

def test_shrinkage_facilities_and_simulation():
    m_resp = client.get("/api/municipalities")
    minamiaso_id = m_resp.json()[0]["id"]

    f_resp = client.get(f"/api/shrinkage/facilities/{minamiaso_id}")
    assert f_resp.status_code == 200
    facilities = f_resp.json()
    assert len(facilities) >= 8

    # Find a consolidation candidate
    candidate = next(f for f in facilities if f["consolidation_candidate"] is True)
    
    # Run simulation
    sim_resp = client.post(
        f"/api/shrinkage/simulate/{minamiaso_id}",
        json={
            "name": "Automated Test Scenario",
            "description": "Merging candidate facility",
            "actions": [
                {
                    "facility_id": candidate["id"],
                    "action": "close"
                }
            ]
        }
    )
    assert sim_resp.status_code == 200
    sim_data = sim_resp.json()
    assert sim_data["annual_savings_yen"] > 0
    assert sim_data["hospital_30min_coverage_pct"] > 0

def test_fiscal_forecast():
    m_resp = client.get("/api/municipalities")
    minamiaso_id = m_resp.json()[0]["id"]

    response = client.get(f"/api/fiscal/forecast/{minamiaso_id}")
    assert response.status_code == 200
    f_data = response.json()
    assert "records" in f_data
    assert "fiscal_cliff_year" in f_data
    assert f_data["fiscal_cliff_year"] is not None
    assert f_data["years_to_cliff"] is not None

def test_elderly_alerts_and_checkin():
    m_resp = client.get("/api/municipalities")
    minamiaso_id = m_resp.json()[0]["id"]

    alerts_resp = client.get(f"/api/elderly/alerts/{minamiaso_id}")
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert "active_emergency_count" in alerts

    # Get residents
    res_resp = client.get(f"/api/elderly/{minamiaso_id}")
    assert res_resp.status_code == 200
    residents = res_resp.json()
    assert len(residents) >= 3

    # Check in on the first resident
    target = residents[0]
    checkin_resp = client.post(
        f"/api/elderly/resident/{target['id']}/checkin",
        json={
            "volunteer_name": "Test Volunteer Tanaka",
            "notes": "Checked resident, doing well",
            "health_status": "stable"
        }
    )
    assert checkin_resp.status_code == 200
    assert checkin_resp.json()["success"] is True

def test_migration_simulation():
    response = client.post(
        "/api/migration/simulate",
        json={
            "investment_category": "childcare",
            "investment_yen": 50000000
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["families_attracted"] > 0
    assert data["annual_local_tax_gain_yen"] > 0
    assert data["ten_year_net_roi_pct"] > 0
