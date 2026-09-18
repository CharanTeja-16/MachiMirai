import React, { useState, useEffect, useRef } from 'react';
import { translations, type Language } from '../i18n';
import {
  Home, AlertTriangle, Hammer, Filter,
  PhoneCall, CheckCircle2, DollarSign, PlusCircle, Flame, Bug
} from 'lucide-react';
import L from 'leaflet';

interface AkiyaProps {
  municipalityId: string;
  akiyaList: any[];
  priorities: any;
  lang: Language;
  onStatusUpdate: (id: string, payload: any) => Promise<void>;
  onRegisterAkiya: (payload: any) => Promise<void>;
  onBudgetChange: (budget: number) => Promise<void>;
}

export const AkiyaManager: React.FC<AkiyaProps> = ({
  municipalityId,
  akiyaList,
  priorities,
  lang,
  onStatusUpdate,
  onRegisterAkiya,
  onBudgetChange
}) => {
  const t = translations[lang];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [budgetSliderVal, setBudgetSliderVal] = useState<number>(15000000);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // New Akiya Form state
  const [newAddress, setNewAddress] = useState('');
  const [newCondition, setNewCondition] = useState('needs_repair');
  const [newFloorArea, setNewFloorArea] = useState(120);
  const [newBuildingAge, setNewBuildingAge] = useState(45);
  const [newFireRisk, setNewFireRisk] = useState(50);
  const [newCollapseRisk, setNewCollapseRisk] = useState(50);
  const [newPestRisk, setNewPestRisk] = useState(50);

  const filteredAkiya = akiyaList.filter((a) => {
    if (conditionFilter === 'all') return true;
    if (conditionFilter === 'dangerous') return a.condition === 'dangerous' || a.condition === 'ruins';
    if (conditionFilter === 'habitable') return a.condition === 'habitable';
    return true;
  });

  // Initialize Leaflet GIS Map for Akiya
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const defaultLat = akiyaList[0]?.latitude || 32.82;
    const defaultLon = akiyaList[0]?.longitude || 131.01;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLon],
      zoom: 12,
      attributionControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    filteredAkiya.forEach((ak) => {
      const isDangerous = ak.condition === 'dangerous' || ak.condition === 'ruins';
      const color = isDangerous ? '#ef4444' : (ak.condition === 'needs_repair' ? '#f59e0b' : '#10b981');

      const marker = L.circleMarker([ak.latitude, ak.longitude], {
        radius: isDangerous ? 9 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      const ageLabel = lang === 'en' ? `Age: ${ak.building_age_years} yrs` : `築${ak.building_age_years}年`;
      const conditionLabel = lang === 'en' ? 'Condition' : '状態';
      const riskLabel = lang === 'en' ? 'Risk Score' : '総合リスク';
      const actionLabel = lang === 'en' ? 'Action' : '推奨アクション';
      const ownerLabel = lang === 'en' ? 'Owner Status' : '所有者状況';
      const costLabel = lang === 'en' ? 'Est. Demolition' : '推定解体費';
      const costUnit = lang === 'en' ? 'M' : '万円';

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #f8fafc; padding: 4px; max-width: 220px;">
          <strong style="color: #60a5fa;">${ak.address}</strong><br/>
          ${ageLabel} (${ak.floor_area_sqm}㎡)<br/>
          ${conditionLabel}: <strong>${ak.condition}</strong> (${riskLabel}: ${ak.risk_score})<br/>
          ${actionLabel}: <span style="color: #38bdf8;">${ak.proposed_action}</span><br/>
          ${ownerLabel}: <strong>${ak.owner_status}</strong><br/>
          ${costLabel}: ¥${(ak.estimated_demolition_cost_yen/10000).toLocaleString()} ${costUnit}
        </div>
      `);
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [filteredAkiya, lang]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress) return;

    // Calculate sample offset coordinates around town center
    const lat = 32.82 + (Math.random() - 0.5) * 0.04;
    const lon = 131.01 + (Math.random() - 0.5) * 0.06;

    await onRegisterAkiya({
      address: newAddress,
      latitude: lat,
      longitude: lon,
      building_age_years: Number(newBuildingAge),
      floor_area_sqm: Number(newFloorArea),
      condition: newCondition,
      fire_risk: Number(newFireRisk),
      collapse_risk: Number(newCollapseRisk),
      pest_risk: Number(newPestRisk),
      owner_known: true,
      proposed_action: newCondition === 'ruins' ? 'demolition' : 'renovation'
    });

    setShowRegisterModal(false);
    setNewAddress('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Home color="#f43f5e" size={24} />
            {t.akiya_title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            {t.akiya_subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={15} />
            <span>{t.register_new_akiya}</span>
          </button>
        </div>
      </div>

      {/* Row 1: GIS Map & Filter Controls */}
      <div className="grid-cols-2">
        {/* Leaflet GIS Map */}
        <div className="gov-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {lang === 'en' ? 'Akiya Distribution & Hazard Level GIS Map' : '空き家分布・危険度判定GISマップ'}
            </h2>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <button
                onClick={() => setConditionFilter('all')}
                className={`btn btn-sm ${conditionFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                {t.filter_all}
              </button>
              <button
                onClick={() => setConditionFilter('dangerous')}
                className={`btn btn-sm ${conditionFilter === 'dangerous' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                {t.filter_dangerous}
              </button>
              <button
                onClick={() => setConditionFilter('habitable')}
                className={`btn btn-sm ${conditionFilter === 'habitable' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                {t.filter_habitable}
              </button>
            </div>
          </div>

          <div
            ref={mapContainerRef}
            style={{ height: '360px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Demolition Prioritizer & Budget Optimizer */}
        <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Hammer size={18} color="#ef4444" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {t.demolition_optimizer} {lang === 'en' ? '(Demolition Subsidy Allocation)' : '(解体助成予算最適配分)'}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              {lang === 'en'
                ? 'Mathematical knapsack optimization prioritizing severe hazard properties (collapse/fire risks) to maximize town safety within municipal subsidy budget.'
                : '特定空家（倒壊・火災リスク危険度）と解体費用を数理最適化し、予算内で最大のリスク低減効果を得られる優先順位を自動算出。'}
            </p>

            {/* Budget Slider */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.4rem' }}>
                <span>{lang === 'en' ? 'Municipal Subsidy Budget Cap:' : '自治体解体補助予算枠:'}</span>
                <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                  ¥{(budgetSliderVal / 10000).toLocaleString()} {lang === 'en' ? 'M' : '万円'}
                </span>
              </div>
              <input
                type="range"
                min={5000000}
                max={30000000}
                step={1000000}
                value={budgetSliderVal}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBudgetSliderVal(val);
                  onBudgetChange(val);
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            {/* Allocation Results */}
            {priorities && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{lang === 'en' ? 'Eligible Funded' : '予算採択可能物件'}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                    {priorities.properties_funded_within_budget} / {priorities.total_dangerous_properties} {lang === 'en' ? 'units' : '棟'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{lang === 'en' ? 'Allocated Cost' : '配分済み解体総額'}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
                    ¥{(priorities.total_cost_allocated_yen / 10000).toLocaleString()}{lang === 'en' ? 'M' : '万'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{lang === 'en' ? 'Budget Remaining' : '予算残額'}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                    ¥{(priorities.budget_remaining_yen / 10000).toLocaleString()}{lang === 'en' ? 'M' : '万'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Funded Demolition Priority List */}
          <div style={{ overflowY: 'auto', maxHeight: '160px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {priorities?.priority_ranked_properties?.map((p: any, idx: number) => {
              const isFunded = idx < (priorities.properties_funded_within_budget || 0);
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    background: isFunded ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255,255,255,0.02)',
                    border: isFunded ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    fontSize: '0.75rem'
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: isFunded ? '#fca5a5' : '#94a3b8', marginRight: '0.5rem' }}>
                      #{idx + 1}
                    </span>
                    <span style={{ color: '#f8fafc', fontWeight: 500 }}>{p.address}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ color: '#f87171', fontWeight: 700 }}>
                      {lang === 'en' ? `Risk ${p.risk_score} pts` : `リスク ${p.risk_score}点`}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', color: '#cbd5e1' }}>
                      ¥{(p.estimated_demolition_cost_yen / 10000).toLocaleString()}{lang === 'en' ? 'M' : '万'}
                    </span>
                    <span className={`badge ${isFunded ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                      {isFunded ? (lang === 'en' ? 'Funded' : '採択') : (lang === 'en' ? 'Deferred' : '次期繰延')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Property Cards & Owner Outreach Board */}
      <div className="gov-card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
          {lang === 'en' ? 'Akiya Registry, Owner Negotiations & AI Action Recommendations' : '空き家一覧・所有者交渉状況 & AI利活用提案'}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredAkiya.map((ak) => {
            const riskColor = ak.risk_score >= 75 ? '#f43f5e' : (ak.risk_score >= 45 ? '#f59e0b' : '#10b981');
            return (
              <div
                key={ak.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Photo & Risk Tag */}
                <div style={{ position: 'relative', height: '140px', width: '100%', background: '#1e293b' }}>
                  <img
                    src={ak.photo_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'}
                    alt="Akiya"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: riskColor, border: `1px solid ${riskColor}` }}>
                    {lang === 'en' ? `Risk: ${ak.risk_score} pts` : `総合リスク: ${ak.risk_score}点`}
                  </div>
                  <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', color: '#f8fafc' }}>
                    {lang === 'en' ? `Age ${ak.building_age_years} yrs (${ak.floor_area_sqm}㎡)` : `築${ak.building_age_years}年 (${ak.floor_area_sqm}㎡)`}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{ak.address}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                        {lang === 'en'
                          ? `AI: ${ak.proposed_action === 'demolition' ? 'Demolition & Land Clearance' : (ak.proposed_action === 'renovation' ? 'Traditional Folk-House Renovation' : 'Coworking / Community Hub')}`
                          : `AI提案: ${ak.proposed_action === 'demolition' ? '優先解体・更地化' : (ak.proposed_action === 'renovation' ? '古民家移住リノベ' : 'コワーキング/地域共創')}`}
                      </span>
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                        {lang === 'en' ? `Condition: ${ak.condition}` : `状態: ${ak.condition}`}
                      </span>
                    </div>

                    {/* Sub-risks */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.6rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Flame size={13} color="#f87171" /> {lang === 'en' ? 'Fire' : '火災'}: {ak.fire_risk}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <AlertTriangle size={13} color="#fbbf24" /> {lang === 'en' ? 'Collapse' : '倒壊'}: {ak.collapse_risk}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Bug size={13} color="#a3e635" /> {lang === 'en' ? 'Pest' : '害獣'}: {ak.pest_risk}
                      </span>
                    </div>
                  </div>

                  {/* Owner Status Selector */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{lang === 'en' ? 'Owner Outreach:' : '所有者対応:'}</span>
                    <select
                      value={ak.owner_status}
                      onChange={(e) => onStatusUpdate(ak.id, { owner_status: e.target.value, owner_contacted: true })}
                      style={{ background: '#0e1424', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontSize: '0.72rem', padding: '0.2rem 0.4rem' }}
                    >
                      <option value="uncontacted">{lang === 'en' ? 'Uncontacted' : '未連絡 (Uncontacted)'}</option>
                      <option value="negotiating">{lang === 'en' ? 'Negotiating' : '交渉中 (Negotiating)'}</option>
                      <option value="agreement_reached">{lang === 'en' ? 'Agreement Reached' : '合意成立 (Agreed)'}</option>
                      <option value="unresponsive">{lang === 'en' ? 'Unresponsive' : '応答なし (Unresponsive)'}</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Register New Akiya Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div className="gov-card" style={{ maxWidth: '500px', width: '100%', background: '#0e1424', border: '1px solid rgba(255,255,255,0.2)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem' }}>
              {lang === 'en' ? 'Register New Vacant Property (GIS Registry)' : '新規空き家物件登録 (GIS・リスク台帳)'}
            </h2>
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{lang === 'en' ? 'Address / Location:' : '所在地・住所:'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'e.g., 120 Hisaishi, Minamiaso' : '例: 南阿蘇村久石120番地'}
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.2rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{lang === 'en' ? 'Condition:' : '物件状態:'}</label>
                  <select
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    style={{ width: '100%', background: '#0e1424', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.2rem' }}
                  >
                    <option value="habitable">{lang === 'en' ? 'Habitable' : '居住可能 (Habitable)'}</option>
                    <option value="needs_repair">{lang === 'en' ? 'Needs Repair' : '要修繕 (Needs repair)'}</option>
                    <option value="dangerous">{lang === 'en' ? 'Dangerous' : '危険 (Dangerous)'}</option>
                    <option value="ruins">{lang === 'en' ? 'Ruins / Collapsing' : '倒壊・廃屋 (Ruins)'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{lang === 'en' ? 'Building Age (Years):' : '築年数 (年):'}</label>
                  <input
                    type="number"
                    value={newBuildingAge}
                    onChange={(e) => setNewBuildingAge(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.2rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#f87171' }}>{lang === 'en' ? 'Fire Risk (0-100):' : '火災リスク (0-100):'}</label>
                  <input
                    type="number"
                    value={newFireRisk}
                    onChange={(e) => setNewFireRisk(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#fbbf24' }}>{lang === 'en' ? 'Collapse Risk (0-100):' : '倒壊リスク (0-100):'}</label>
                  <input
                    type="number"
                    value={newCollapseRisk}
                    onChange={(e) => setNewCollapseRisk(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#a3e635' }}>{lang === 'en' ? 'Pest Hazard (0-100):' : '害獣リスク (0-100):'}</label>
                  <input
                    type="number"
                    value={newPestRisk}
                    onChange={(e) => setNewPestRisk(Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  {lang === 'en' ? 'Cancel' : 'キャンセル'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  {lang === 'en' ? 'Register Property' : '登録完了'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

