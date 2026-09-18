import numpy as np
import pytest
from app.demographic_engine import (
    generate_initial_pyramid, run_cohort_component_projection,
    calculate_demographic_countdown, get_standard_survival_rates
)

def test_survival_rates():
    rates = get_standard_survival_rates()
    assert len(rates) == 101
    assert rates[0] > 0.99
    assert rates[50] > 0.95
    assert rates[100] < 0.70

def test_initial_pyramid_synthesis():
    male, female = generate_initial_pyramid(total_pop=9247, elderly_ratio=38.2, child_ratio=9.8)
    assert len(male) == 101
    assert len(female) == 101
    total = np.sum(male) + np.sum(female)
    assert abs(total - 9247) < 5
    elderly = np.sum(male[65:]) + np.sum(female[65:])
    elderly_pct = (elderly / total) * 100
    assert abs(elderly_pct - 38.2) < 1.0

def test_cohort_component_projection_decline():
    male, female = generate_initial_pyramid(total_pop=9247, elderly_ratio=38.2, child_ratio=9.8)
    projections = run_cohort_component_projection(male, female, tfr=1.28, years_ahead=30, scenario="baseline")
    
    assert len(projections) == 31
    assert projections[0]["year"] == 2026
    assert projections[30]["year"] == 2056
    
    # In depopulating Japan with TFR 1.28 and net out-migration, population must decrease over 30 years
    pop_2026 = projections[0]["total"]
    pop_2056 = projections[30]["total"]
    assert pop_2056 < pop_2026
    
    # Elderly ratio must increase significantly
    assert projections[30]["elderly_ratio"] > projections[0]["elderly_ratio"]

def test_demographic_countdown():
    projections = [
        {"year": 2026, "total": 9247},
        {"year": 2036, "total": 7100},
        {"year": 2043, "total": 4950},
        {"year": 2056, "total": 3800}
    ]
    countdown = calculate_demographic_countdown(projections, thresholds=[5000, 3000])
    assert len(countdown) == 2
    assert countdown[0]["threshold"] == 5000
    assert countdown[0]["crossed_year"] == 2043
    assert countdown[0]["years_remaining"] == 17
