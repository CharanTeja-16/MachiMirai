import { translations, type Language } from '../i18n';
import {
  Users, Building2, DollarSign, Home, HeartHandshake,
  Compass, AlertTriangle, ShieldCheck, FileText
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  activeAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  lang,
  activeAlertCount
}) => {
  const t = translations[lang];

  const menuItems = [
    { id: 'demographics', label: t.nav_demographics, icon: Users, color: '#6366f1' },
    { id: 'shrinkage', label: t.nav_shrinkage, icon: Building2, color: '#38bdf8' },
    { id: 'fiscal', label: t.nav_fiscal, icon: DollarSign, color: '#f59e0b' },
    { id: 'akiya', label: t.nav_akiya, icon: Home, color: '#f43f5e' },
    {
      id: 'elderly',
      label: t.nav_elderly,
      icon: HeartHandshake,
      color: '#ec4899',
      badge: activeAlertCount > 0 ? activeAlertCount : null
    },
    { id: 'migration', label: t.nav_migration, icon: Compass, color: '#10b981' }
  ];

  return (
    <aside className="sidebar" style={{ padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem 0.75rem' }}>
          {lang === 'ja' ? '自治体存続意思決定メニュー' : 'Strategic Modules'}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={18} color={isActive ? item.color : '#64748b'} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="badge badge-red pulse-emergency" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>MIC / e-Stat / NIPSSR 連動</span>
        </div>
        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
          MachiMirai Autonomous v1.0.0
        </div>
      </div>
    </aside>
  );
};
