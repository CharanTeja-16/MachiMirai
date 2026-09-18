import React, { useState, useEffect, useRef } from 'react';
import { translations, type Language } from '../i18n';
import {
  Building2, Sliders, CheckCircle, Clock,
  ArrowRight, Shield, Zap, TrendingUp
} from 'lucide-react';
import L from 'leaflet';

interface ShrinkageProps {
  municipalityId: string;
  facilities: any[];
  scenarios: any[];
  compactPlan: any;
  lang: Language;
  onSimulate: (payload: any) => Promise<any>;
}

export const ShrinkagePlanner: React.FC<ShrinkageProps> = ({
  municipalityId,
  facilities,
  scenarios,
  compactPlan,
  lang,
  onSimulate
}) => {
  const t = translations[lang];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [activeSimulationResult, setActiveSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Custom Simulator state: selected facility to close/repurpose
  const [customClosedFacilityId, setCustomClosedFacilityId] = useState<string>('');
  const [customRepurposeFacilityId, setCustomRepurposeFacilityId] = useState<string>('');

  const activeScenario = activeSimulationResult || (scenarios && scenarios[selectedScenarioIndex]) || {
    annual_savings_yen: 42000000,
    transition_cost_yen: 15000000,
    student_travel_time_delta_min: 5.2,
    hospital_30min_coverage_pct: 94.5,
    repurposed_plan: 'コミュニティ共創ラボ＋防災倉庫'
  };

  // Initialize Leaflet GIS Map for Facilities
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const defaultLat = facilities[0]?.latitude || 32.82;
    const defaultLon = facilities[0]?.longitude || 131.01;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLon],
      zoom: 12,
      attributionControl: false
    });

    // Dark styled tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    // Plot Public Facilities with distinctive icons and popups
    facilities.forEach((fac) => {
      const isCandidate = fac.consolidation_candidate;
      const color = isCandidate ? '#f43f5e' : (fac.facility_type.includes('hospital') ? '#38bdf8' : '#10b981');

      const marker = L.circleMarker([fac.latitude, fac.longitude], {
        radius: isCandidate ? 9 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; padding: 4px;">
          <strong style="color: #60a5fa;">${fac.facility_name}</strong><br/>
          区分: ${fac.facility_type}<br/>
          年間維持費: ¥${(fac.annual_maintenance_cost_yen / 10000).toLocaleString()} 万円<br/>
          稼働率: ${fac.current_utilization_pct}% (築${fac.age_years}年)<br/>
          状態: <strong>${fac.condition}</strong><br/>
          ${isCandidate ? '<span style="color: #f87171; font-weight: bold;">⚠️ 統廃合検討対象</span>' : '<span style="color: #4ade80;">✅ 存続推奨施設</span>'}
        </div>
      `);
    });

    // Plot compact city zone buffers
    if (compactPlan?.neighborhood_zones) {
      compactPlan.neighborhood_zones.forEach((nz: any) => {
        const zoneColor = nz.status === 'maintain' ? '#10b981' : (nz.status === 'consolidate' ? '#f59e0b' : '#ef4444');
        L.circle([nz.lat, nz.lon], {
          radius: 1200,
          fillColor: zoneColor,
          color: zoneColor,
          weight: 1,
          opacity: 0.6,
          fillOpacity: 0.12
        }).addTo(map);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [facilities, compactPlan]);

  const handleRunCustomSimulation = async () => {
    if (!customClosedFacilityId && !customRepurposeFacilityId) return;
    setIsSimulating(true);

    const actions = [];
    if (customClosedFacilityId) {
      actions.push({ facility_id: customClosedFacilityId, action: 'close' });
    }
    if (customRepurposeFacilityId) {
      actions.push({ facility_id: customRepurposeFacilityId, action: 'repurpose', repurpose_theme: 'リモートワーク共創サテライト' });
    }

    try {
      const res = await onSimulate({
        name: 'カスタム再編シミュレーション (Custom Plan)',
        description: 'ユーザー指定施設による即時インパクト試算',
        actions
      });
      setActiveSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Building2 color="#38bdf8" size={24} />
          {t.shrinkage_title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {t.shrinkage_subtitle}
        </p>
      </div>

      {/* Row 1: GIS Map & Facility Inventory KPIs */}
      <div className="grid-cols-2">
        {/* Leaflet GIS Facility Map */}
        <div className="gov-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {t.facility_inventory}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f43f5e' }}>
                ● 統廃合候補
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#38bdf8' }}>
                ● 医療機関
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#10b981' }}>
                ● 存続施設
              </span>
            </div>
          </div>

          <div
            ref={mapContainerRef}
            style={{ height: '380px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Consolidation Simulator Controls & Instant KPIs */}
        <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sliders size={18} color="#f59e0b" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {t.consolidation_simulator}
              </h2>
            </div>

            {/* Pre-configured Scenarios Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {scenarios.map((sc, idx) => (
                <div
                  key={sc.id}
                  onClick={() => {
                    setSelectedScenarioIndex(idx);
                    setActiveSimulationResult(null);
                  }}
                  className={`gov-card-interactive`}
                  style={{
                    background: selectedScenarioIndex === idx && !activeSimulationResult ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                    border: selectedScenarioIndex === idx && !activeSimulationResult ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                    {sc.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {sc.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Interactive Simulator Selection */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.5rem' }}>
                ユーザー任意シミュレーション (Interactive Custom Test):
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select
                  value={customClosedFacilityId}
                  onChange={(e) => setCustomClosedFacilityId(e.target.value)}
                  style={{ flex: 1, minWidth: '160px', background: '#0e1424', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}
                >
                  <option value="">閉館・統合施設を選択...</option>
                  {facilities.filter((f) => f.consolidation_candidate).map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.facility_name} (¥{(f.annual_maintenance_cost_yen/10000).toLocaleString()}万/年)
                    </option>
                  ))}
                </select>

                <select
                  value={customRepurposeFacilityId}
                  onChange={(e) => setCustomRepurposeFacilityId(e.target.value)}
                  style={{ flex: 1, minWidth: '160px', background: '#0e1424', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}
                >
                  <option value="">民間・共創転用施設を選択...</option>
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.facility_name} (転用・賃貸)
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRunCustomSimulation}
                  disabled={isSimulating}
                  className="btn btn-primary btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {isSimulating ? '試算中...' : '即時試算実行'}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time KPI Impact Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.annual_savings}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                +¥{(activeScenario.annual_savings_yen / 10000).toLocaleString()} 万円
              </div>
              <div style={{ fontSize: '0.68rem', color: '#6ee7b7' }}>毎年度の固定経費削減</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.transition_cost}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fcd34d', fontFamily: 'JetBrains Mono' }}>
                ¥{(activeScenario.transition_cost_yen / 10000).toLocaleString()} 万円
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>初年度単発投資 (解体・改修)</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.travel_time_delta}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#cbd5e1', fontFamily: 'JetBrains Mono' }}>
                +{activeScenario.student_travel_time_delta_min} 分
              </div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>スクールバス運行で対応可</div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.hospital_coverage}</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                {activeScenario.hospital_30min_coverage_pct}%
              </div>
              <div style={{ fontSize: '0.68rem', color: '#7dd3fc' }}>救急医療アクセス圏維持</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: 10-Year Smart Shrinkage Action Roadmap */}
      <div className="gov-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Clock size={18} color="#a855f7" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            {t.ten_year_roadmap}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {compactPlan?.roadmap ? (
            compactPlan.roadmap.map((step: any, idx: number) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                    {step.phase}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                    ¥{(Math.abs(step.cost_impact_yen) / 10000).toLocaleString()}万円 削減
                  </span>
                </div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {step.title}
                </h3>
                <ul style={{ paddingLeft: '1.1rem', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {step.actions.map((act: string, aIdx: number) => (
                    <li key={aIdx}>{act}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div style={{ color: '#94a3b8' }}>ロードマップ読み込み中...</div>
          )}
        </div>
      </div>
    </div>
  );
};
