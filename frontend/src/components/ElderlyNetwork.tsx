import React, { useState } from 'react';
import { translations, type Language } from '../i18n';
import {
  HeartHandshake, AlertCircle, Radio, Clock, Phone,
  User, CheckCircle, Activity, ChevronRight, Droplets, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface ElderlyProps {
  municipalityId: string;
  residents: any[];
  alerts: any;
  lang: Language;
  onCheckin: (residentId: string, payload: any) => Promise<void>;
  onFetchDetail: (residentId: string) => Promise<any>;
}

export const ElderlyNetwork: React.FC<ElderlyProps> = ({
  municipalityId,
  residents,
  alerts,
  lang,
  onCheckin,
  onFetchDetail
}) => {
  const t = translations[lang];

  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [residentDetail, setResidentDetail] = useState<any>(null);
  const [volunteerName, setVolunteerName] = useState('鈴木 恵子 (Welfare Coordinator)');
  const [checkinNotes, setCheckinNotes] = useState('対面で健康状態を確認。会話し表情明るい。');
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false);

  const activeAlertsList = alerts?.critical_alerts || [];

  const handleSelectResident = async (res: any) => {
    setSelectedResident(res);
    try {
      const detail = await onFetchDetail(res.id);
      setResidentDetail(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResident) return;
    setIsSubmittingCheckin(true);

    try {
      await onCheckin(selectedResident.id, {
        volunteer_name: volunteerName,
        notes: checkinNotes,
        health_status: 'stable'
      });
      // Refresh local detail
      const updated = await onFetchDetail(selectedResident.id);
      setResidentDetail(updated);
      setSelectedResident(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingCheckin(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <HeartHandshake color="#ec4899" size={24} />
          {t.elderly_title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {t.elderly_subtitle}
        </p>
      </div>

      {/* Critical 24h Inactivity Alerts Feed */}
      {activeAlertsList.length > 0 && (
        <div className="gov-card pulse-emergency" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)', border: '1px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <AlertCircle size={22} color="#ef4444" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fecaca' }}>
              【緊急警報】24時間無活動検知 — 孤独死未然防止プロトコル発令中 ({activeAlertsList.length}件)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {activeAlertsList.map((alert: any) => (
              <div
                key={alert.resident_id}
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                      {alert.resident_name}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>({alert.age}歳)</span>
                    <span className="badge badge-red" style={{ fontSize: '0.65rem' }}>
                      {alert.hours_silent}時間 無反応
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    住所: {alert.address}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                    緊急連絡: {alert.emergency_contact}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const r = residents.find(x => x.id === alert.resident_id);
                    if (r) handleSelectResident(r);
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  駆けつけ記録
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 1: Resident Registry Table & Detail/Telemetry Panel */}
      <div className="grid-cols-2">
        {/* Residents Table */}
        <div className="gov-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              {t.registered_residents} ({residents.length}名)
            </h2>
            <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
              SLA基準: 24時間以内検知
            </span>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '420px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: '0.5rem' }}>氏名 / 年齢</th>
                  <th style={{ padding: '0.5rem' }}>自立度</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>最終活動</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>リスク</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => {
                  const isSilentAlert = r.hours_since_activity >= 24;
                  const riskBadge = r.risk_level === 'critical' || isSilentAlert
                    ? 'badge-red'
                    : (r.risk_level === 'high' ? 'badge-amber' : 'badge-green');

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: selectedResident?.id === r.id ? 'rgba(99, 102, 241, 0.12)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{r.resident_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{r.age}歳・{r.address}</div>
                      </td>
                      <td style={{ padding: '0.5rem', color: '#cbd5e1' }}>
                        {r.mobility_level === 'independent' ? '自立' : (r.mobility_level === 'assisted' ? '要支援' : '車椅子/寝たきり')}
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center', fontFamily: 'JetBrains Mono', color: isSilentAlert ? '#f43f5e' : '#cbd5e1' }}>
                        {r.hours_since_activity}時間前
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span className={`badge ${riskBadge}`}>
                          {isSilentAlert ? '要確認' : r.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleSelectResident(r)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resident Detail & IoT Telemetry & Checkin Form */}
        <div className="gov-card">
          {selectedResident ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User color="#818cf8" size={20} />
                    {selectedResident.resident_name} ({selectedResident.age}歳)
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    住所: {selectedResident.address} | 担当民生委員: {selectedResident.assigned_volunteer || '未割当'}
                  </p>
                </div>
                <span className={`badge ${selectedResident.hours_since_activity >= 24 ? 'badge-red' : 'badge-green'}`}>
                  {selectedResident.hours_since_activity >= 24 ? '24h無反応アラート' : '安否正常'}
                </span>
              </div>

              {/* Health conditions & Emergency Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ color: '#94a3b8', marginBottom: '0.2rem' }}>既往症・健康リスク:</div>
                  <div style={{ color: '#cbd5e1' }}>
                    {selectedResident.health_conditions?.join(', ') || '特記事項なし'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem', borderRadius: '6px' }}>
                  <div style={{ color: '#94a3b8', marginBottom: '0.2rem' }}>緊急連絡先 (家族・親族):</div>
                  <div style={{ color: '#cbd5e1' }}>
                    {selectedResident.emergency_contact_name} ({selectedResident.emergency_contact_phone})
                  </div>
                </div>
              </div>

              {/* IoT Water/Electricity Sensor Telemetry Sparkline */}
              {residentDetail?.telemetry && (
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Activity size={15} color="#38bdf8" />
                    水道・電力スマートメーター直近活動推移 (IoT Telemetry):
                  </div>
                  <div style={{ height: '140px', width: '100%', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '0.4rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={residentDetail.telemetry.slice(-10).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="timestamp" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip contentStyle={{ background: '#0e1424', border: '1px solid rgba(255,255,255,0.2)', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="value" name="測定値" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Record Checkin Action Form */}
              <form onSubmit={handleCheckinSubmit} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>
                  {t.checkin_now} (見守り完了ログ記録):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    required
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="確認者氏名"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  />
                  <input
                    type="text"
                    required
                    value={checkinNotes}
                    onChange={(e) => setCheckinNotes(e.target.value)}
                    placeholder="状況メモ・特記事項"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingCheckin}
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-end', marginTop: '0.2rem' }}
                >
                  {isSubmittingCheckin ? '記録中...' : '安否確認ログを登録（警報解除）'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
              左側の台帳から対象高齢者を選択してください。IoTセンサーログと見守り記録が表示されます。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
