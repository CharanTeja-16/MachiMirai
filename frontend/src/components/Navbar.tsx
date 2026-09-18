import { translations, type Language } from '../i18n';
import { MapPin, UserCheck, Globe, AlertTriangle, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
  currentMuniId: string;
  onMuniChange: (id: string) => void;
  municipalities: any[];
  currentRole: string;
  onRoleChange: (role: string) => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  currentMuniId,
  onMuniChange,
  municipalities,
  currentRole,
  onRoleChange,
  activeAlertCount
}) => {
  const t = translations[lang];

  return (
    <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#0e1424', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Brand & Tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>
            町
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                {t.app_title}
              </span>
              <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                GovTech JP
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              {t.app_subtitle}
            </div>
          </div>
        </div>

        {/* Municipality Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <MapPin size={16} color="#38bdf8" />
          <select
            value={currentMuniId}
            onChange={(e) => onMuniChange(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {municipalities.map((m) => {
              const prefName = lang === 'en' 
                ? (m.prefecture.includes('(') ? m.prefecture.split('(')[1].replace(')', '') : m.prefecture)
                : m.prefecture.split(' ')[0];
              const townName = lang === 'en' ? (m.municipality_name_en || m.municipality_name) : m.municipality_name;
              return (
                <option key={m.id} value={m.id} style={{ background: '#0e1424', color: '#f8fafc' }}>
                  {townName} ({prefName})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Right Controls: Persona Switcher, Alerts, Language Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Active Emergency Alert Badge */}
        {activeAlertCount > 0 ? (
          <div className="badge badge-red pulse-emergency" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', cursor: 'pointer' }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span>{activeAlertCount} {t.active_alerts}</span>
          </div>
        ) : (
          <div className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem' }}>
            <ShieldCheck size={15} color="#10b981" />
            <span>{lang === 'ja' ? '安否異常なし (正常)' : 'All Welfare Clear'}</span>
          </div>
        )}

        {/* Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.12)', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <UserCheck size={16} color="#818cf8" />
          <span style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 500 }}>
            {lang === 'ja' ? '権限:' : 'Role:'}
          </span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{ background: 'transparent', color: '#f8fafc', border: 'none', outline: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="mayor" style={{ background: '#0e1424', color: '#f8fafc' }}>
              {t.persona_mayor}
            </option>
            <option value="prefectural_planner" style={{ background: '#0e1424', color: '#f8fafc' }}>
              {t.persona_planner}
            </option>
            <option value="welfare_coordinator" style={{ background: '#0e1424', color: '#f8fafc' }}>
              {t.persona_welfare}
            </option>
            <option value="citizen" style={{ background: '#0e1424', color: '#f8fafc' }}>
              {t.persona_citizen}
            </option>
          </select>
        </div>

        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}
          title="Switch Language / 言語切替"
        >
          <Globe size={14} />
          <span>{lang === 'ja' ? 'English (EN)' : '日本語 (JA)'}</span>
        </button>
      </div>
    </header>
  );
};
