import numpy as np
from typing import List, Dict, Any, Tuple

# Standard Japanese Life Table Survival Rates (Ages 0 to 100+)
# Derived from MHLW 23rd Complete Life Tables
def get_standard_survival_rates() -> np.ndarray:
    rates = np.ones(101)
    # Infancy
    rates[0] = 0.998
    # Childhood (1-14)
    for a in range(1, 15):
        rates[a] = 0.9997
    # Youth & Young Adults (15-39)
    for a in range(15, 40):
        rates[a] = 0.9992 - (a - 15) * 0.00004
    # Middle Age (40-64)
    for a in range(40, 65):
        rates[a] = 0.998 - (a - 40) * 0.0003
    # Young Elderly (65-74)
    for a in range(65, 75):
        rates[a] = 0.990 - (a - 65) * 0.0015
    # Old-Old (75-84)
    for a in range(75, 85):
        rates[a] = 0.975 - (a - 75) * 0.004
    # Oldest-Old (85-99)
    for a in range(85, 100):
        rates[a] = 0.935 - (a - 85) * 0.015
    # 100+
    rates[100] = 0.65
    return np.clip(rates, 0.0, 1.0)


# Standard Age-Specific Fertility Rates (ASFR) for ages 15-49
# Shaped based on Japan National Institute of Population and Social Security Research (NIPSSR)
def get_fertility_curve(target_tfr: float = 1.2) -> np.ndarray:
    ages = np.arange(15, 50)
    # Peak fertility in Japan is typically between 28 and 33
    mu = 30.5
    sigma = 4.8
    normal_curve = np.exp(-0.5 * ((ages - mu) / sigma) ** 2)
    # Normalize sum to match target TFR
    scale = target_tfr / np.sum(normal_curve)
    return normal_curve * scale


# Age-specific Net Migration Pattern
# Rural Japanese towns face high youth out-migration at ages 18-24 (university/work)
# and slight return-migration at ages 28-35 (U-turn / I-turn) and 60-65 (retirement)
def get_rural_migration_curve(base_rate: float = -0.012, scenario: str = "baseline") -> np.ndarray:
    rates = np.full(101, base_rate * 0.2)
    
    # High out-migration for university and entry-level jobs in Tokyo/Osaka
    for a in range(18, 25):
        rates[a] = base_rate * 2.8 # heavy youth drain
    
    # Slight U-turn / I-turn family inflow
    for a in range(28, 38):
        rates[a] = base_rate * 0.4
    
    # Middle age stability
    for a in range(38, 60):
        rates[a] = base_rate * 0.2
        
    # Elderly care relocation to urban clinics/children
    for a in range(78, 101):
        rates[a] = base_rate * 0.8

    if scenario == "optimistic":
        rates = rates * 0.5 + 0.003 # reduced outflow, some in-migration
    elif scenario == "pessimistic":
        rates = rates * 1.4 # accelerated flight

    return rates


def generate_initial_pyramid(total_pop: int, elderly_ratio: float, child_ratio: float) -> Tuple[np.ndarray, np.ndarray]:
    """
    Synthesize realistic single-year male/female distributions matching municipality aggregates.
    """
    ages = np.arange(101)
    
    # Base density curve modeled after typical aging rural Japanese towns
    curve = np.zeros(101)
    for a in range(101):
        if a < 15:
            curve[a] = 0.5 + 0.03 * a
        elif a < 65:
            # Bulge around bubble generation (ages 50-60)
            bubble = 1.8 * np.exp(-0.5 * ((a - 54) / 7.0) ** 2)
            dankai = 2.2 * np.exp(-0.5 * ((a - 76) / 4.0) ** 2)
            curve[a] = 1.0 + bubble + dankai
        else:
            dankai_senior = 2.4 * np.exp(-0.5 * ((a - 77) / 5.0) ** 2)
            curve[a] = (1.5 + dankai_senior) * np.exp(-0.04 * (a - 65))

    # Calculate exact cohort population targets
    target_child = total_pop * (child_ratio / 100.0)
    target_elderly = total_pop * (elderly_ratio / 100.0)
    target_working = max(0.0, total_pop - target_child - target_elderly)

    pop_single_year = np.zeros(101)
    if np.sum(curve[:15]) > 0:
        pop_single_year[:15] = curve[:15] * (target_child / np.sum(curve[:15]))
    if np.sum(curve[15:65]) > 0:
        pop_single_year[15:65] = curve[15:65] * (target_working / np.sum(curve[15:65]))
    if np.sum(curve[65:]) > 0:
        pop_single_year[65:] = curve[65:] * (target_elderly / np.sum(curve[65:]))
    
    # Sex ratio at birth: ~1.05 male to 1.0 female, but female longevity dominates > 75
    male = np.zeros(101)
    female = np.zeros(101)
    for a in range(101):
        if a < 50:
            male_ratio = 0.51
        elif a < 70:
            male_ratio = 0.49
        elif a < 85:
            male_ratio = 0.44 - (a - 70) * 0.008
        else:
            male_ratio = 0.30 - (a - 85) * 0.01
        male_ratio = max(0.15, male_ratio)
        male[a] = pop_single_year[a] * male_ratio
        female[a] = pop_single_year[a] * (1.0 - male_ratio)
        
    return male, female


def run_cohort_component_projection(
    male_pop: np.ndarray,
    female_pop: np.ndarray,
    tfr: float = 1.2,
    years_ahead: int = 30,
    scenario: str = "baseline",
    base_year: int = 2026
) -> List[Dict[str, Any]]:
    """
    Executes NIPSSR Cohort-Component demographic projection engine for single-year age cohorts.
    """
    survival_rates = get_standard_survival_rates()
    fertility_rates = get_fertility_curve(tfr)
    migration_rates = get_rural_migration_curve(scenario=scenario)
    
    male = male_pop.copy()
    female = female_pop.copy()
    
    results = []
    
    # Include base year
    curr_total = int(np.sum(male) + np.sum(female))
    c_0_14 = int(np.sum(male[:15]) + np.sum(female[:15]))
    c_15_64 = int(np.sum(male[15:65]) + np.sum(female[15:65]))
    c_65_plus = int(np.sum(male[65:]) + np.sum(female[65:]))
    c_75_plus = int(np.sum(male[75:]) + np.sum(female[75:]))
    
    results.append({
        "year": base_year,
        "total": curr_total,
        "age_0_14": c_0_14,
        "age_15_64": c_15_64,
        "age_65_plus": c_65_plus,
        "age_75_plus": c_75_plus,
        "elderly_ratio": round((c_65_plus / curr_total * 100) if curr_total > 0 else 0, 1),
        "child_ratio": round((c_0_14 / curr_total * 100) if curr_total > 0 else 0, 1),
        "working_ratio": round((c_15_64 / curr_total * 100) if curr_total > 0 else 0, 1),
        "male_pyramid": [int(round(x)) for x in male],
        "female_pyramid": [int(round(x)) for x in female],
        "annual_births": int(round(np.sum(female[15:50] * fertility_rates))),
        "annual_deaths": int(round(np.sum(male * (1 - survival_rates)) + np.sum(female * (1 - survival_rates)))),
        "net_migration": int(round(np.sum((male + female) * migration_rates))),
        "scenario": scenario
    })
    
    for y in range(1, years_ahead + 1):
        new_male = np.zeros(101)
        new_female = np.zeros(101)
        
        # 1. Aging by 1 year with survival
        for a in range(1, 100):
            new_male[a] = male[a - 1] * survival_rates[a - 1]
            new_female[a] = female[a - 1] * survival_rates[a - 1]
            
        # Top-coded age 100+ accumulator
        new_male[100] = (male[99] * survival_rates[99]) + (male[100] * survival_rates[100])
        new_female[100] = (female[99] * survival_rates[99]) + (female[100] * survival_rates[100])
        
        # 2. Births from females aged 15-49
        total_births = np.sum(female[15:50] * fertility_rates)
        # Japan sex ratio at birth is approx 105.5 boys to 100 girls
        new_male[0] = total_births * (105.5 / 205.5)
        new_female[0] = total_births * (100.0 / 205.5)
        
        # 3. Net Migration
        for a in range(101):
            mig_m = new_male[a] * migration_rates[min(a, 99)]
            mig_f = new_female[a] * migration_rates[min(a, 99)]
            new_male[a] = max(0.0, new_male[a] + mig_m)
            new_female[a] = max(0.0, new_female[a] + mig_f)
            
        male = new_male
        female = new_female
        
        total = int(np.sum(male) + np.sum(female))
        age_0_14 = int(np.sum(male[:15]) + np.sum(female[:15]))
        age_15_64 = int(np.sum(male[15:65]) + np.sum(female[15:65]))
        age_65_plus = int(np.sum(male[65:]) + np.sum(female[65:]))
        age_75_plus = int(np.sum(male[75:]) + np.sum(female[75:]))
        
        results.append({
            "year": base_year + y,
            "total": total,
            "age_0_14": age_0_14,
            "age_15_64": age_15_64,
            "age_65_plus": age_65_plus,
            "age_75_plus": age_75_plus,
            "elderly_ratio": round((age_65_plus / total * 100) if total > 0 else 0, 1),
            "child_ratio": round((age_0_14 / total * 100) if total > 0 else 0, 1),
            "working_ratio": round((age_15_64 / total * 100) if total > 0 else 0, 1),
            "male_pyramid": [int(round(x)) for x in male],
            "female_pyramid": [int(round(x)) for x in female],
            "annual_births": int(round(total_births)),
            "annual_deaths": int(round(np.sum(male * (1 - survival_rates)) + np.sum(female * (1 - survival_rates)))),
            "net_migration": int(round(np.sum((male + female) * migration_rates))),
            "scenario": scenario
        })
        
    return results


def calculate_demographic_countdown(projections: List[Dict[str, Any]], thresholds: List[int] = None) -> List[Dict[str, Any]]:
    """
    Find the exact year when total population drops below critical operational thresholds.
    """
    if thresholds is None:
        thresholds = [10000, 7500, 5000, 3000, 2000, 1000]
        
    countdown_events = []
    initial_pop = projections[0]["total"]
    
    for thresh in thresholds:
        if initial_pop > thresh:
            crossed_year = None
            for p in projections:
                if p["total"] < thresh:
                    crossed_year = p["year"]
                    break
            countdown_events.append({
                "threshold": thresh,
                "crossed_year": crossed_year,
                "years_remaining": (crossed_year - projections[0]["year"]) if crossed_year else None,
                "status": "imminent" if crossed_year and (crossed_year - projections[0]["year"] <= 10) else ("approaching" if crossed_year else "safe")
            })
            
    return countdown_events
