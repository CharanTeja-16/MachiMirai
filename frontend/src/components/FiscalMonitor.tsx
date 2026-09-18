import React from 'react';
import { translations, type Language } from '../i18n';
import {
  TrendingDown, AlertOctagon, DollarSign, PieChart,
  BarChart3, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid, AreaChart, Area
} from 'recharts';

interface FiscalProps {
  data: any;
  lang: Language;
}

export const FiscalMonitor: React.FC<FiscalProps> = ({ data, lang }) => {
  const t = translations[lang];

  if (!data) return <div className="gov-card">{t.loading}</div>;

  const {
    records,
    fiscal_cliff_year,
    years_to_cliff,
    total_unmitigated_deficit_20yr_yen,
    fiscal_independence_ratio,
    peer_benchmark
  } = data;

  // Format chart data (in 億円 for readable numbers)
  const chartData = (records || []).map((r: any) => ({
    year: r.fiscal_year,
    taxRev: +(r.tax_revenue_yen / 100000000).toFixed(2),
    transfers: +(r.national_transfers_yen / 100000000).toFixed(2),
    totalRev: +(r.total_revenue_yen / 100000000).toFixed(2),
    welfareExp: +(r.welfare_expenditure_yen / 100000000).toFixed(2),
    infraExp: +(r.infra_expenditure_yen / 100000000).toFixed(2),
    totalExp: +(r.total_expenditure_yen / 100000000).toFixed(2),
    netBalance: +(r.net_surplus_deficit_yen / 100000000).toFixed(2),
    isProjected: r.is_projected
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <DollarSign color="#f59e0b" size={24} />
          {t.fiscal_title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {t.fiscal_subtitle}
        </p>
      </div>

      {/* Fiscal Cliff Detection Alert Banner */}
      <div className="gov-card" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertOctagon size={26} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fef3c7' }}>
                {t.fiscal_cliff_alert}: {fiscal_cliff_year ? `${fiscal_cliff_year}年度` : '健全'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#fde68a', marginTop: '0.15rem' }}>
                現行の歳出水準を維持した場合、<strong style={{ color: '#ef4444' }}>あと {years_to_cliff} 年</strong> で経常収支が赤字へ転落します。
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>20年間累積予測赤字</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171', fontFamily: 'JetBrains Mono' }}>
                ¥{(total_unmitigated_deficit_20yr_yen / 100000000).toFixed(1)} 億円
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>財政力指数</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'JetBrains Mono' }}>
                {fiscal_independence_ratio}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: 20-Year Revenue vs Expenditure Crossover Chart */}
      <div className="gov-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              歳入・歳出の20年間推移と財政破綻交差ポイント（億円）
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              青実線（総歳入）が赤実線（総歳出）を下回るポイントが財政再建団体転落リスクゾーン
            </p>
          </div>
          <span className="badge badge-amber">
            2026年以降: 将来推計モデル
          </span>
        </div>

        <div style={{ height: '360px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}億`} />
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload || !payload.length) return null;
                  const rev = payload.find(p => p.dataKey === 'totalRev')?.value;
                  const exp = payload.find(p => p.dataKey === 'totalExp')?.value;
                  const bal = (Number(rev) - Number(exp)).toFixed(2);
                  return (
                    <div style={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>{label}年度 財政収支</div>
                      <div style={{ color: '#38bdf8' }}>総歳入: {rev} 億円</div>
                      <div style={{ color: '#ef4444' }}>総歳出: {exp} 億円</div>
                      <div style={{ color: Number(bal) >= 0 ? '#10b981' : '#f87171', fontWeight: 700, marginTop: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.2rem' }}>
                        単年度収支: {Number(bal) >= 0 ? `+${bal}` : bal} 億円
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(val) => <span style={{ color: '#cbd5e1', fontSize: '0.75rem', marginRight: '1rem' }}>{val}</span>}
              />
              <Area type="monotone" dataKey="totalRev" name="総歳入 (Revenue)" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="totalExp" name="総歳出 (Expenditure)" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExp)" />
              <Line type="monotone" dataKey="welfareExp" name="社会保障・医療扶助" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              <Line type="monotone" dataKey="taxRev" name="地方税収（独自財源）" stroke="#10b981" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Peer Town Benchmark & Sustainability Ranking */}
      <div className="gov-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <BarChart3 size={18} color="#06b6d4" />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            {t.peer_benchmark} (全国類似過疎自治体比較)
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.6rem' }}>自治体名 (Prefecture)</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>人口規模</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>財政力指数</th>
                <th style={{ padding: '0.6rem', textAlign: 'right' }}>交付税依存度</th>
                <th style={{ padding: '0.6rem', textAlign: 'center' }}>財政破綻リスク分類</th>
              </tr>
            </thead>
            <tbody>
              {peer_benchmark.map((p: any, idx: number) => {
                const riskBadge = p.risk.includes('Bankrupt') || p.risk === 'Critical'
                  ? 'badge-red'
                  : (p.risk === 'High' ? 'badge-amber' : 'badge-green');

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.6rem', fontWeight: 600, color: '#f8fafc' }}>
                      {p.name}
                    </td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                      {p.pop.toLocaleString()} 人
                    </td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', fontFamily: 'JetBrains Mono', color: p.fiscal_index < 0.3 ? '#ef4444' : '#f59e0b' }}>
                      {p.fiscal_index}
                    </td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                      {p.grant_dep}%
                    </td>
                    <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                      <span className={`badge ${riskBadge}`}>
                        {p.risk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
