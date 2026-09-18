const API_BASE = 'http://localhost:8000/api';

export async function fetchMunicipalities() {
  const res = await fetch(`${API_BASE}/municipalities`);
  if (!res.ok) throw new Error('Failed to fetch municipalities');
  return res.json();
}

export async function fetchDemographicDashboard(municipalityId: string, scenario: string = 'baseline') {
  const res = await fetch(`${API_BASE}/demographics/dashboard/${municipalityId}?scenario=${scenario}`);
  if (!res.ok) throw new Error('Failed to fetch demographic dashboard');
  return res.json();
}

export async function fetchFacilities(municipalityId: string) {
  const res = await fetch(`${API_BASE}/shrinkage/facilities/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch facilities');
  return res.json();
}

export async function fetchScenarios(municipalityId: string) {
  const res = await fetch(`${API_BASE}/shrinkage/scenarios/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function simulateConsolidation(municipalityId: string, payload: any) {
  const res = await fetch(`${API_BASE}/shrinkage/simulate/${municipalityId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to simulate consolidation');
  return res.json();
}

export async function fetchCompactCityPlan(municipalityId: string) {
  const res = await fetch(`${API_BASE}/shrinkage/compact-city/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch compact city plan');
  return res.json();
}

export async function fetchFiscalForecast(municipalityId: string) {
  const res = await fetch(`${API_BASE}/fiscal/forecast/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch fiscal forecast');
  return res.json();
}

export async function fetchAkiya(municipalityId: string, condition?: string) {
  const url = condition 
    ? `${API_BASE}/akiya/${municipalityId}?condition=${condition}`
    : `${API_BASE}/akiya/${municipalityId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch akiya properties');
  return res.json();
}

export async function createAkiya(municipalityId: string, payload: any) {
  const res = await fetch(`${API_BASE}/akiya/${municipalityId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create akiya');
  return res.json();
}

export async function updateAkiyaStatus(akiyaId: string, payload: any) {
  const res = await fetch(`${API_BASE}/akiya/property/${akiyaId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update akiya status');
  return res.json();
}

export async function fetchDemolitionPriorities(municipalityId: string, budgetYen: number = 15000000) {
  const res = await fetch(`${API_BASE}/akiya/demolition-prioritizer/${municipalityId}?budget_yen=${budgetYen}`);
  if (!res.ok) throw new Error('Failed to fetch demolition priorities');
  return res.json();
}

export async function fetchElderly(municipalityId: string, riskFilter?: string) {
  const url = riskFilter 
    ? `${API_BASE}/elderly/${municipalityId}?risk_filter=${riskFilter}`
    : `${API_BASE}/elderly/${municipalityId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch elderly residents');
  return res.json();
}

export async function fetchElderlyDetail(residentId: string) {
  const res = await fetch(`${API_BASE}/elderly/resident/${residentId}`);
  if (!res.ok) throw new Error('Failed to fetch elderly detail');
  return res.json();
}

export async function recordCheckin(residentId: string, payload: any) {
  const res = await fetch(`${API_BASE}/elderly/resident/${residentId}/checkin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to record checkin');
  return res.json();
}

export async function fetchCriticalAlerts(municipalityId: string) {
  const res = await fetch(`${API_BASE}/elderly/alerts/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch critical alerts');
  return res.json();
}

export async function fetchScorecard(municipalityId: string) {
  const res = await fetch(`${API_BASE}/migration/scorecard/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch scorecard');
  return res.json();
}

export async function simulateMigration(payload: any) {
  const res = await fetch(`${API_BASE}/migration/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to simulate migration');
  return res.json();
}

export async function fetchCaseStudies() {
  const res = await fetch(`${API_BASE}/migration/case-studies`);
  if (!res.ok) throw new Error('Failed to fetch case studies');
  return res.json();
}

export async function fetchDigitalNomadPackage(municipalityId: string) {
  const res = await fetch(`${API_BASE}/migration/digital-nomad-package/${municipalityId}`);
  if (!res.ok) throw new Error('Failed to fetch digital nomad package');
  return res.json();
}

export async function switchPersona(role: string, municipalityId?: string) {
  const res = await fetch(`${API_BASE}/auth/switch-persona`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, municipality_id: municipalityId })
  });
  if (!res.ok) throw new Error('Failed to switch persona');
  return res.json();
}
