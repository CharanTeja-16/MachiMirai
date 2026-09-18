import React, { useState } from 'react';
import { translations, type Language } from '../i18n';
import {
  Users, AlertCircle, TrendingDown,
  Sparkles, Layers, Award
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, LineChart, Line, CartesianGrid
} from 'recharts';

interface DemographicProps {
  data: any;
  lang: Language;
  onScenarioChange: (scenario: string) => void;
  selectedScenario: string;
}

export const DemographicDashboard: React.FC<DemographicProps> = ({
  data,
  lang,
  onScenarioChange,
  selectedScenario
}) => {
  const t = translations[lang];
  const [selectedPyramidYear, setSelectedPyramidYear] = useState<number>(2026);

  if (!data) return <div className="gov-card">{t.loading}</div>;

  const {
    municipality,
    pyramid_current,
    pyramid_2036,
    pyramid_2046,
    pyramid_2056,
    projections_summary,
    countdown,
    neighborhoods,
    prefecture_comparison
  } = data;

  // Select appropriate pyramid based on year
  let activePyramid = pyramid_current;
  if (selectedPyramidYear === 2036) activePyramid = pyramid_2036;
  if (selectedPyramidYear === 2046) activePyramid = pyramid_2046;
  if (selectedPyramidYear === 2056) activePyramid = pyramid_2056;

  // Format pyramid for Recharts horizontal paired bars (male negative, female positive)
  const pyramidChartData = (activePyramid || []).map((c: any) => ({
    age: c.age_group,
    male: -Math.abs(c.male),
    female: c.female,
    maleRaw: c.male,
    femaleRaw: c.female,
    total: c.total
  }));

  const townDisplay = lang === 'en' ? (municipality.municipality_name_en || municipality.municipality_name) : municipality.municipality_name;
  const prefDisplay = lang === 'en'
    ? (municipality.prefecture.includes('(') ? municipality.prefecture.split('(')[1].replace(')', '') : municipality.prefecture)
    : municipality.prefecture.split(' ')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Scenario Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users color="#6366f1" size={24} />
            {t.demo_title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            {lang === 'ja' 
              ? `${municipality.municipality_name} (${municipality.prefecture}) — 国立社会保障・人口問題研究所(NIPSSR)準拠コーホート要因法`
              : `${townDisplay} (${prefDisplay}) — National Institute of Population and Social Security Research (NIPSSR) Model`}
          </p>
        </div>

        {/* Projection Scenario Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Sparkles size={16} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>{lang === 'ja' ? '推計条件:' : 'Scenario:'}</span>
          <button
            onClick={() => onScenarioChange('baseline')}
            className={`btn btn-sm ${selectedScenario === 'baseline' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.scenario_baseline}
          </button>
          <button
            onClick={() => onScenarioChange('optimistic')}
            className={`btn btn-sm ${selectedScenario === 'optimistic' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.scenario_optimistic}
          </button>
          <button
            onClick={() => onScenarioChange('pessimistic')}
            className={`btn btn-sm ${selectedScenario === 'pessimistic' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t.scenario_pessimistic}
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid-cols-4">
        {/* Current Population */}
        <div className="gov-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            {t.current_population} (2026)
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono' }}>
              {municipality.population_current.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{t.people_suffix}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.4rem', fontSize: '0.75rem', color: '#f43f5e' }}>
            <TrendingDown size={14} />
            <span>
              {lang === 'ja'
                ? `ピーク比 ${Math.round((municipality.population_current / municipality.population_peak) * 100)}% (${municipality.population_peak_year}年: ${municipality.population_peak.toLocaleString()}人)`
                : `${Math.round((municipality.population_current / municipality.population_peak) * 100)}% of Peak (${municipality.population_peak_year}: ${municipality.population_peak.toLocaleString()})`}
            </span>
          </div>
        </div>

        {/* Elderly Ratio (65+) */}
        <div className="gov-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            {t.elderly_ratio}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
              {municipality.elderly_ratio}%
            </span>
            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
              {lang === 'ja' ? '超高齢社会' : 'Hyper-Aging (30%+)'}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            {lang === 'ja' ? (
              <span>2056年予測: <strong style={{ color: '#f43f5e' }}>51.8%</strong> (2人に1人が高齢者)</span>
            ) : (
              <span>2056 Projected: <strong style={{ color: '#f43f5e' }}>51.8%</strong> (1 in 2 residents 65+)</span>
            )}
          </div>
        </div>

        {/* Child Ratio (0-14) */}
        <div className="gov-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            {t.child_ratio} & TFR
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
              {municipality.child_ratio}%
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>TFR: {municipality.total_fertility_rate}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            {lang === 'ja' ? (
              <span>年間出生数: <strong style={{ color: '#f8fafc' }}>約28名</strong> / 小学校統廃合ライン</span>
            ) : (
              <span>Annual Births: <strong style={{ color: '#f8fafc' }}>~28</strong> / Below School Merger Line</span>
            )}
          </div>
        </div>

        {/* Survival Risk Score */}
        <div className="gov-card">
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
            {lang === 'ja' ? '自治体存続リスク総合評価' : 'Municipal Survival Risk Score'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', fontFamily: 'JetBrains Mono' }}>
              {municipality.survival_risk_score}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ 100</span>
            <span className="badge badge-red">{lang === 'ja' ? '要対策' : 'High Risk'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.4rem' }}>
            {lang === 'ja' ? (
              <span>財政力指数: <strong style={{ color: '#fcd34d' }}>{municipality.fiscal_independence_ratio}</strong> (自立困難)</span>
            ) : (
              <span>Fiscal Independence: <strong style={{ color: '#fcd34d' }}>{municipality.fiscal_independence_ratio}</strong> (High Risk)</span>
            )}
          </div>
        </div>
      </div>

      {/* Demographic Countdown Alert Banner */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={20} color="#f87171" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fecaca' }}>
            {t.countdown_title}
          </h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
          {t.countdown_warning}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {countdown.map((cd: any) => (
            <div key={cd.threshold} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {lang === 'ja' ? `人口 ${cd.threshold.toLocaleString()}人 未満` : `Population < ${cd.threshold.toLocaleString()}`}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: cd.crossed_year ? '#f87171' : '#10b981', fontFamily: 'JetBrains Mono', marginTop: '0.2rem' }}>
                {cd.crossed_year ? (lang === 'ja' ? `${cd.crossed_year}年` : `Year ${cd.crossed_year}`) : (lang === 'ja' ? '維持' : 'Maintained')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                {cd.years_remaining ? (lang === 'ja' ? `(あと ${cd.years_remaining} 年)` : `(${cd.years_remaining} yrs remaining)`) : (lang === 'ja' ? '30年間到達せず' : '30-yr safe')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Population Pyramid & 30-Year Trend */}
      <div className="grid-cols-2">
        {/* Interactive Population Pyramid */}
        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                {t.pyramid_title}
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {t.pyramid_hint}
              </p>
            </div>

            {/* Year Selector Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '6px' }}>
              {[2026, 2036, 2046, 2056].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedPyramidYear(yr)}
                  className={`btn btn-sm ${selectedPyramidYear === yr ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                >
                  {yr}{lang === 'ja' ? '年' : ''}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '360px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={pyramidChartData}
                stackOffset="sign"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(val) => Math.abs(val).toString()}
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis
                  dataKey="age"
                  type="category"
                  stroke="#94a3b8"
                  fontSize={10}
                  width={42}
                  tickLine={false}
                />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    const mVal = Math.abs(payload[0]?.value as number || 0);
                    const fVal = payload[1]?.value as number || 0;
                    return (
                      <div style={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                          {lang === 'ja' ? `年齢階級: ${label}` : `Age Cohort: ${label}`}
                        </div>
                        <div style={{ color: '#38bdf8' }}>
                          {lang === 'ja' ? `男性: ${mVal.toLocaleString()} 人` : `Male: ${mVal.toLocaleString()}`}
                        </div>
                        <div style={{ color: '#f43f5e' }}>
                          {lang === 'ja' ? `女性: ${fVal.toLocaleString()} 人` : `Female: ${fVal.toLocaleString()}`}
                        </div>
                        <div style={{ color: '#a855f7', marginTop: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.2rem' }}>
                          {lang === 'ja' ? `合計: ${(mVal + fVal).toLocaleString()} 人` : `Total: ${(mVal + fVal).toLocaleString()}`}
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(value) => (
                    <span style={{ color: '#cbd5e1', fontSize: '0.75rem', marginRight: '1rem' }}>
                      {value === 'male' ? (lang === 'ja' ? '男性 (Male)' : 'Male') : (lang === 'ja' ? '女性 (Female)' : 'Female')}
                    </span>
                  )}
                />
                <Bar dataKey="male" name="male" fill="#38bdf8" radius={[4, 0, 0, 4]} />
                <Bar dataKey="female" name="female" fill="#f43f5e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Year Cohort Projection Line Chart */}
        <div className="gov-card">
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {lang === 'ja' ? '30年間 年齢3区分人口推移予測' : '30-Year Age Cohort Projection Forecast'}
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {lang === 'ja' 
                ? '年少(0-14)、生産年齢(15-64)、老年(65+)、後期高齢(75+)推移'
                : 'Children (0-14), Working Age (15-64), Elderly (65+), and Super-Elderly (75+)'}
            </p>
          </div>

          <div style={{ height: '360px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projections_summary} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} />
                <Tooltip
                  content={({ payload, label }) => {
                    if (!payload || !payload.length) return null;
                    return (
                      <div style={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                          {lang === 'ja' ? `${label}年 推計値` : `${label} Forecast`}
                        </div>
                        {payload.map((entry: any) => (
                          <div key={entry.name} style={{ color: entry.color }}>
                            {entry.name}: {Number(entry.value).toLocaleString()} {lang === 'ja' ? '人' : ''}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={30}
                  formatter={(val) => <span style={{ color: '#cbd5e1', fontSize: '0.75rem', marginRight: '0.8rem' }}>{val}</span>}
                />
                <Line type="monotone" dataKey="total" name={lang === 'ja' ? '総人口' : 'Total Population'} stroke="#f8fafc" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="age_15_64" name={lang === 'ja' ? '生産年齢 (15-64)' : 'Working Age (15-64)'} stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="age_65_plus" name={lang === 'ja' ? '高齢人口 (65+)' : 'Elderly (65+)'} stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="age_75_plus" name={lang === 'ja' ? '後期高齢 (75+)' : 'Super-Elderly (75+)'} stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="age_0_14" name={lang === 'ja' ? '年少人口 (0-14)' : 'Children (0-14)'} stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Neighborhood (Chōchō) Breakdown Table & Comparison Mode */}
      <div className="grid-cols-2">
        {/* Neighborhood Table */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={18} color="#06b6d4" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {t.neighborhood_breakdown}
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>{lang === 'ja' ? '集落・町丁名' : 'Neighborhood (Chōchō)'}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>{lang === 'ja' ? '人口' : 'Population'}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>{lang === 'ja' ? '高齢化率' : 'Elderly %'}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>{lang === 'ja' ? '独居高齢' : 'Single Elderly'}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>{lang === 'ja' ? '5年増減' : '5-Yr Change'}</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>{lang === 'ja' ? '都市計画区分' : 'Zoning Policy'}</th>
                </tr>
              </thead>
              <tbody>
                {neighborhoods.map((n: any) => {
                  const eRatio = Math.round((n.age_65_plus / n.total_population) * 100);
                  const zoneBadge = n.compact_zone_status === 'maintain'
                    ? 'badge-green'
                    : (n.compact_zone_status === 'consolidate' ? 'badge-amber' : 'badge-red');
                  const zoneText = n.compact_zone_status === 'maintain'
                    ? (lang === 'ja' ? '維持・拠点' : 'Maintain Core')
                    : (n.compact_zone_status === 'consolidate' ? (lang === 'ja' ? '集約誘導' : 'Consolidate') : (lang === 'ja' ? '段階的退役' : 'Phase Out'));

                  return (
                    <tr key={n.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600, color: '#f8fafc' }}>
                        {n.neighborhood_name}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        {n.total_population.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'JetBrains Mono', color: eRatio > 40 ? '#f59e0b' : '#cbd5e1' }}>
                        {eRatio}%
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        {n.single_elderly_households} {t.households_suffix}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontFamily: 'JetBrains Mono', color: n.change_5yr_pct < 0 ? '#f43f5e' : '#10b981' }}>
                        {n.change_5yr_pct}%
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span className={`badge ${zoneBadge}`}>
                          {zoneText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benchmarking Comparison Mode */}
        <div className="gov-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Award size={18} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {lang === 'ja' ? '自治体ベンチマーク比較 (Peer Comparison Mode)' : 'Municipal Benchmark Comparison (Peer Analysis)'}
            </h2>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1rem' }}>
            {lang === 'ja' 
              ? '対象自治体と県平均、全国平均の主要指標格差分析'
              : 'Key demographic metric gap analysis vs prefecture and national benchmarks'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                metric: lang === 'ja' ? '高齢化率 (65歳以上)' : 'Elderly Ratio (65+)',
                townVal: `${prefecture_comparison.town.elderly_ratio}%`,
                prefVal: `${prefecture_comparison.prefecture.elderly_ratio}%`,
                natVal: `${prefecture_comparison.national.elderly_ratio}%`,
                status: 'bad'
              },
              {
                metric: lang === 'ja' ? '合計特殊出生率 (TFR)' : 'Total Fertility Rate (TFR)',
                townVal: `${prefecture_comparison.town.tfr}`,
                prefVal: `${prefecture_comparison.prefecture.tfr}`,
                natVal: `${prefecture_comparison.national.tfr}`,
                status: 'neutral'
              },
              {
                metric: lang === 'ja' ? '年間人口減少率' : 'Annual Population Decline',
                townVal: `${prefecture_comparison.town.annual_decline_pct}%`,
                prefVal: `${prefecture_comparison.prefecture.annual_decline_pct}%`,
                natVal: `${prefecture_comparison.national.annual_decline_pct}%`,
                status: 'bad'
              },
              {
                metric: lang === 'ja' ? '年少人口比率 (0-14歳)' : 'Child Ratio (0-14)',
                townVal: `${prefecture_comparison.town.child_ratio}%`,
                prefVal: `${prefecture_comparison.prefecture.child_ratio}%`,
                natVal: `${prefecture_comparison.national.child_ratio}%`,
                status: 'bad'
              }
            ].map((row, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{row.metric}</span>
                  <span className={`badge ${row.status === 'bad' ? 'badge-red' : 'badge-amber'}`}>
                    {row.status === 'bad' ? (lang === 'ja' ? '全国乖離大' : 'Significant Gap') : (lang === 'ja' ? '平均水準' : 'Average')}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{lang === 'ja' ? '当自治体' : 'This Town'}</div>
                    <div style={{ fontWeight: 800, color: '#f87171', fontFamily: 'JetBrains Mono' }}>{row.townVal}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{lang === 'ja' ? '県平均' : 'Prefecture Avg'}</div>
                    <div style={{ fontWeight: 600, color: '#cbd5e1', fontFamily: 'JetBrains Mono' }}>{row.prefVal}</div>
                  </div>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>{lang === 'ja' ? '全国平均' : 'National Avg'}</div>
                    <div style={{ fontWeight: 600, color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>{row.natVal}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
