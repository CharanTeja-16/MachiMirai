import React, { useState } from 'react';
import { translations, type Language } from '../i18n';
import {
  Compass, Calculator, BookOpen, Laptop,
  ArrowRight, Users, CheckCircle2, TrendingUp, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Tooltip, Legend
} from 'recharts';

interface MigrationProps {
  scorecard: any[];
  caseStudies: any[];
  nomadPackage: any;
  lang: Language;
  onSimulate: (payload: any) => Promise<any>;
}

export const MigrationToolkit: React.FC<MigrationProps> = ({
  scorecard,
  caseStudies,
  nomadPackage,
  lang,
  onSimulate
}) => {
  const t = translations[lang];

  const [investCategory, setInvestCategory] = useState<string>('childcare');
  const [investAmountYen, setInvestAmountYen] = useState<number>(45000000);
  const [simResult, setSimResult] = useState<any>({
    investment_category: 'childcare',
    investment_yen: 45000000,
    families_attracted: 20,
    adults_working: 36,
    children_enrolled: 28,
    annual_local_tax_gain_yen: 19880000,
    ten_year_cumulative_tax_yen: 198800000,
    ten_year_net_roi_pct: 341.8,
    payback_years: 2.3
  });
  const [isSimulating, setIsSimulating] = useState(false);

  // Format scorecard data for Recharts Radar
  const radarData = (scorecard || []).map((s) => ({
    subject: lang === 'ja' ? s.dimension : s.dimension_en,
    score: s.score,
    pref: s.prefecture_avg,
    national: s.national_benchmark
  }));

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await onSimulate({
        investment_category: investCategory,
        investment_yen: investAmountYen
      });
      setSimResult(res);
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
          <Compass color="#10b981" size={24} />
          {t.migration_title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {t.migration_subtitle}
        </p>
      </div>

      {/* Row 1: Radar Chart Scorecard & Investment ROI Simulator */}
      <div className="grid-cols-2">
        {/* Town Attractiveness Radar */}
        <div className="gov-card">
          <div style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {t.radar_title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {lang === 'en'
                ? 'Gap analysis across 7 key lifestyle indicators (Minamiaso vs. Prefectural Avg vs. National Benchmark)'
                : '若年・子育て世代が重視する7指標のギャップ分析（当町 vs 県平均 vs 全国標準）'}
            </p>
          </div>

          <div style={{ height: '340px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={9} />
                <Radar name={lang === 'en' ? 'Minamiaso (Current)' : '当自治体 (Minamiaso)'} dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Radar name={lang === 'en' ? 'Prefectural Average' : '県平均 (Prefecture Avg)'} dataKey="pref" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                <Radar name={lang === 'en' ? 'National Benchmark' : '全国標準 (National Bench)'} dataKey="national" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(v) => <span style={{ color: '#cbd5e1', fontSize: '0.75rem', marginRight: '0.75rem' }}>{v}</span>}
                />
                <Tooltip contentStyle={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.2)', fontSize: '11px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Public Investment ROI Simulator */}
        <div className="gov-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calculator size={18} color="#10b981" />
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {t.investment_simulator} {lang === 'en' ? '(ROI & Fiscal Yield Forecast)' : '(公費投資対効果試算)'}
              </h2>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
              {lang === 'en'
                ? 'Mathematical modeling of future local tax yield and family migration driven by targeted municipal budget allocation in childcare, housing grants, or coworking hubs.'
                : '「子育て・空き家改修・サテライト拠点」への予算投入がもたらす将来税収・移住人口を数理モデリング。'}
            </p>

            {/* Inputs: Category and Amount Slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>{t.select_investment_category}:</label>
                <select
                  value={investCategory}
                  onChange={(e) => setInvestCategory(e.target.value)}
                  style={{ width: '100%', background: '#0e1424', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', padding: '0.4rem', fontSize: '0.8rem', marginTop: '0.2rem' }}
                >
                  <option value="childcare">
                    {lang === 'en' ? 'Childcare & Zero Waiting List Subsidy Package' : '子育て・待機児童ゼロ助成パッケージ (Childcare Package)'}
                  </option>
                  <option value="housing_grant">
                    {lang === 'en' ? 'Akiya Bank Renovation Grants & Settlement Stipend' : '空き家バンク改修補助＆定住奨励金 (Akiya Housing Grants)'}
                  </option>
                  <option value="remote_hub">
                    {lang === 'en' ? 'Fiber-Optic Infrastructure & Satellite Coworking Hub' : '光回線＆サテライトオフィス共創拠点 (Remote Coworking Hub)'}
                  </option>
                  <option value="agricultural_start">
                    {lang === 'en' ? 'Highland Agribusiness & Smart Agri-Incubation' : '高冷地スマート農業・起業インキュベーション (Agribusiness Start)'}
                  </option>
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                  <span>{t.investment_amount}:</span>
                  <span style={{ color: '#10b981', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                    ¥{(investAmountYen / 10000).toLocaleString()} {lang === 'en' ? 'M' : '万円'}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000000}
                  max={100000000}
                  step={5000000}
                  value={investAmountYen}
                  onChange={(e) => setInvestAmountYen(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="btn btn-primary btn-sm"
                style={{ alignSelf: 'flex-end', marginTop: '0.2rem' }}
              >
                {isSimulating ? (lang === 'en' ? 'Simulating...' : '計算中...') : (lang === 'en' ? 'Run ROI Simulation' : '効果シミュレーション実行')}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {simResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t.attracted_families}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                  ~{simResult.families_attracted} {lang === 'en' ? 'Households' : '世帯'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  {lang === 'en'
                    ? `Children: +${simResult.children_enrolled} / Working Adults: +${simResult.adults_working}`
                    : `児童: +${simResult.children_enrolled}名 / 就業者: +${simResult.adults_working}名`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t.ten_year_tax_return}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                  ¥{(simResult.ten_year_cumulative_tax_yen / 100000000).toFixed(2)} {lang === 'en' ? 'Billion' : '億円'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#6ee7b7' }}>
                  {lang === 'en' ? 'Local Tax + Transfer Grants Yield' : '地方税収＋交付金加算'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{t.net_roi}</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                  +{simResult.ten_year_net_roi_pct}%
                </div>
                <div style={{ fontSize: '0.68rem', color: '#fcd34d' }}>
                  {lang === 'en' ? '10-Year Cumulative ROI' : '10年次純利益率'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  {lang === 'en' ? 'Payback Period' : '公費投資回収年数'}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#cbd5e1', fontFamily: 'JetBrains Mono' }}>
                  {simResult.payback_years} {lang === 'en' ? 'Years' : '年'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  {lang === 'en' ? 'Fiscal breakeven horizon' : '税収単年黒字化ライン'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Success Case Studies Library & Digital Nomad Package */}
      <div className="grid-cols-2">
        {/* Case Studies */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <BookOpen size={18} color="#a855f7" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {t.case_studies_title}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {caseStudies.map((cs, idx) => {
              const isEnglish = lang === 'en';
              const townName = isEnglish
                ? (cs.town_name === '神山町' ? 'Kamiyama Town' : (cs.town_name === '海士町' ? 'Ama Town' : (cs.town_name === '南阿蘇村' ? 'Minamiaso Village' : cs.town_name)))
                : cs.town_name;
              const prefName = isEnglish
                ? (cs.prefecture === '徳島県' ? 'Tokushima' : (cs.prefecture === '島根県' ? 'Shimane' : (cs.prefecture === '熊本県' ? 'Kumamoto' : cs.prefecture)))
                : cs.prefecture;
              const title = isEnglish
                ? (idx === 0
                    ? 'Satellite Office Influx & Creative Depopulation'
                    : (idx === 1
                        ? 'Island High School Magnet & Youth Immigrants'
                        : 'Aso Caldera Digital Nomad & Agribusiness Hub'))
                : cs.title;
              const summary = isEnglish
                ? (idx === 0
                    ? 'Attracted 16 IT ventures and remote tech workers by laying high-speed optical fiber into traditional rural homes and repurposing abandoned farmhouses into modern coworking spaces.'
                    : (idx === 1
                        ? 'Reformed the sole local high school with experiential maritime education, drawing over 100 mainland students annually and catalyzing family relocation.'
                        : 'Capitalized on pristine spring water and mountain vistas to launch agricultural incubation grants and nomadic creative workspaces.'))
                : cs.summary;
              const lessons = isEnglish
                ? (idx === 0
                    ? 'Pair ultra-fast broadband with Akiya bank to attract remote tech professionals without heavy municipal expenditure.'
                    : (idx === 1
                        ? 'Distinctive educational curricula create sustainable immigration magnets for families.'
                        : 'Combine geothermal nature assets with flexible housing subsidies to capture young lifestyle migrants.'))
                : cs.applicable_lessons;

              return (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc' }}>
                      {townName} ({prefName})
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                      {lang === 'en' ? 'Net Inflow Achieved' : '人口社会増達成'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                    {summary}
                  </p>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.4rem' }}>
                    💡 <strong>{lang === 'en' ? 'Takeaway:' : '示唆:'}</strong> {lessons}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital Nomad Package */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Laptop size={18} color="#06b6d4" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {t.digital_nomad_title}
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            {lang === 'en'
              ? (nomadPackage?.tagline_en || 'Decentralized remote-work sanctuary surrounded by Mount Aso springs and alpine nature, purpose-built for creators and tech nomads.')
              : (nomadPackage?.tagline || '阿蘇の湧水と大自然に囲まれた、次世代クリエイターのための分散型ワークステーション')}
          </p>

          {/* Perks list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {nomadPackage?.perks?.map((pk: any, idx: number) => {
              const perkTitle = lang === 'en'
                ? (idx === 0 ? 'Fiber-Optic Gigabit Workstation' : (idx === 1 ? 'Thermal Onsen & Nature Co-living' : 'Community Concierge Support'))
                : pk.title;
              const perkDesc = lang === 'en'
                ? (idx === 0 ? 'Complimentary 1Gbps fiber internet in all designated coworking satellite hubs' : (idx === 1 ? 'Subsidized monthly access passes to natural geothermal hot spring baths' : 'Direct liaison support for local paperwork, schooling, and land acquisition'))
                : pk.description;

              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#f8fafc' }}>{perkTitle}</strong>
                    <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>{perkDesc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subsidies badges */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
              {lang === 'en' ? 'Settlement Incentive & Relocation Grants Package:' : '定住促進・給付金パッケージ:'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {nomadPackage?.subsidies?.map((sb: any, sIdx: number) => {
                const subName = lang === 'en'
                  ? (sIdx === 0 ? 'Remote Worker Relocation Subsidy' : (sIdx === 1 ? 'Akiya Renovation Assistance' : 'Childcare Relocation Grant'))
                  : sb.name;
                const subAmount = lang === 'en'
                  ? (sIdx === 0 ? '¥1,000,000 / household' : (sIdx === 1 ? 'Up to ¥2,000,000' : '¥500,000 / child'))
                  : sb.amount;

                return (
                  <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: '#cbd5e1' }}>• {subName}</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{subAmount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
