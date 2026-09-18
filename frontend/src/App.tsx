import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DemographicDashboard } from './components/DemographicDashboard';
import { ShrinkagePlanner } from './components/ShrinkagePlanner';
import { FiscalMonitor } from './components/FiscalMonitor';
import { AkiyaManager } from './components/AkiyaManager';
import { ElderlyNetwork } from './components/ElderlyNetwork';
import { MigrationToolkit } from './components/MigrationToolkit';
import { translations, type Language } from './i18n';
import * as api from './api';

export function App() {
  const [lang, setLang] = useState<Language>('ja');
  const [currentTab, setCurrentTab] = useState<string>('demographics');
  const [currentRole, setCurrentRole] = useState<string>('mayor');

  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selectedMuniId, setSelectedMuniId] = useState<string>('');
  const [selectedScenario, setSelectedScenario] = useState<string>('baseline');

  // Module state
  const [demoData, setDemoData] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [compactPlan, setCompactPlan] = useState<any>(null);
  const [fiscalData, setFiscalData] = useState<any>(null);
  const [akiyaList, setAkiyaList] = useState<any[]>([]);
  const [demolitionPriorities, setDemolitionPriorities] = useState<any>(null);
  const [elderlyList, setElderlyList] = useState<any[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<any>(null);
  const [scorecard, setScorecard] = useState<any[]>([]);
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [nomadPackage, setNomadPackage] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Initial Municipalities fetch
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const munis = await api.fetchMunicipalities();
        setMunicipalities(munis);
        if (munis && munis.length > 0) {
          // Default to Minamiaso
          const minamiaso = munis.find((m: any) => m.municipality_code === '43428') || munis[0];
          setSelectedMuniId(minamiaso.id);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Failed to connect to MachiMirai backend API.');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // 2. Load all data when selected municipality changes
  useEffect(() => {
    if (!selectedMuniId) return;

    async function loadTownData() {
      try {
        const [
          demo,
          facs,
          scens,
          cPlan,
          fisc,
          aks,
          priors,
          elds,
          alerts,
          scCard,
          cases,
          nomad
        ] = await Promise.all([
          api.fetchDemographicDashboard(selectedMuniId, selectedScenario),
          api.fetchFacilities(selectedMuniId),
          api.fetchScenarios(selectedMuniId),
          api.fetchCompactCityPlan(selectedMuniId),
          api.fetchFiscalForecast(selectedMuniId),
          api.fetchAkiya(selectedMuniId),
          api.fetchDemolitionPriorities(selectedMuniId),
          api.fetchElderly(selectedMuniId),
          api.fetchCriticalAlerts(selectedMuniId),
          api.fetchScorecard(selectedMuniId),
          api.fetchCaseStudies(),
          api.fetchDigitalNomadPackage(selectedMuniId)
        ]);

        setDemoData(demo);
        setFacilities(facs);
        setScenarios(scens);
        setCompactPlan(cPlan);
        setFiscalData(fisc);
        setAkiyaList(aks);
        setDemolitionPriorities(priors);
        setElderlyList(elds);
        setCriticalAlerts(alerts);
        setScorecard(scCard);
        setCaseStudies(cases);
        setNomadPackage(nomad);
      } catch (err: any) {
        console.error(err);
      }
    }

    loadTownData();
  }, [selectedMuniId]);

  // Handle Scenario Change in Demographic view
  const handleScenarioChange = async (scenario: string) => {
    setSelectedScenario(scenario);
    if (!selectedMuniId) return;
    try {
      const demo = await api.fetchDemographicDashboard(selectedMuniId, scenario);
      setDemoData(demo);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Persona Switch
  const handleRoleChange = async (role: string) => {
    setCurrentRole(role);
    try {
      await api.switchPersona(role, selectedMuniId);
    } catch (err) {
      console.error(err);
    }
  };

  // Shrinkage Simulation Handler
  const handleShrinkageSimulate = async (payload: any) => {
    const res = await api.simulateConsolidation(selectedMuniId, payload);
    const updatedScenarios = await api.fetchScenarios(selectedMuniId);
    setScenarios(updatedScenarios);
    return res;
  };

  // Akiya Handlers
  const handleAkiyaStatusUpdate = async (id: string, payload: any) => {
    await api.updateAkiyaStatus(id, payload);
    const updated = await api.fetchAkiya(selectedMuniId);
    setAkiyaList(updated);
  };

  const handleRegisterAkiya = async (payload: any) => {
    await api.createAkiya(selectedMuniId, payload);
    const updated = await api.fetchAkiya(selectedMuniId);
    setAkiyaList(updated);
  };

  const handleAkiyaBudgetChange = async (budget: number) => {
    const res = await api.fetchDemolitionPriorities(selectedMuniId, budget);
    setDemolitionPriorities(res);
  };

  // Elderly Handlers
  const handleElderlyCheckin = async (residentId: string, payload: any) => {
    await api.recordCheckin(residentId, payload);
    const updatedList = await api.fetchElderly(selectedMuniId);
    const updatedAlerts = await api.fetchCriticalAlerts(selectedMuniId);
    setElderlyList(updatedList);
    setCriticalAlerts(updatedAlerts);
  };

  const handleFetchElderlyDetail = async (residentId: string) => {
    return await api.fetchElderlyDetail(residentId);
  };

  // Migration Handlers
  const handleMigrationSimulate = async (payload: any) => {
    return await api.simulateMigration(payload);
  };

  const activeAlertCount = criticalAlerts?.active_emergency_count || 0;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        lang={lang}
        activeAlertCount={activeAlertCount}
      />

      {/* Main View Area */}
      <div className="main-content">
        <Navbar
          lang={lang}
          setLang={setLang}
          currentMuniId={selectedMuniId}
          onMuniChange={setSelectedMuniId}
          municipalities={municipalities}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeAlertCount={activeAlertCount}
        />

        <main className="content-area">
          {isLoading ? (
            <div className="gov-card" style={{ textAlign: 'center', padding: '3rem' }}>
              {translations[lang].loading}
            </div>
          ) : errorMsg ? (
            <div className="gov-card" style={{ border: '1px solid #ef4444', color: '#fca5a5' }}>
              {errorMsg}
            </div>
          ) : (
            <>
              {currentTab === 'demographics' && (
                <DemographicDashboard
                  data={demoData}
                  lang={lang}
                  onScenarioChange={handleScenarioChange}
                  selectedScenario={selectedScenario}
                />
              )}

              {currentTab === 'shrinkage' && (
                <ShrinkagePlanner
                  municipalityId={selectedMuniId}
                  facilities={facilities}
                  scenarios={scenarios}
                  compactPlan={compactPlan}
                  lang={lang}
                  onSimulate={handleShrinkageSimulate}
                />
              )}

              {currentTab === 'fiscal' && (
                <FiscalMonitor
                  data={fiscalData}
                  lang={lang}
                />
              )}

              {currentTab === 'akiya' && (
                <AkiyaManager
                  municipalityId={selectedMuniId}
                  akiyaList={akiyaList}
                  priorities={demolitionPriorities}
                  lang={lang}
                  onStatusUpdate={handleAkiyaStatusUpdate}
                  onRegisterAkiya={handleRegisterAkiya}
                  onBudgetChange={handleAkiyaBudgetChange}
                />
              )}

              {currentTab === 'elderly' && (
                <ElderlyNetwork
                  municipalityId={selectedMuniId}
                  residents={elderlyList}
                  alerts={criticalAlerts}
                  lang={lang}
                  onCheckin={handleElderlyCheckin}
                  onFetchDetail={handleFetchElderlyDetail}
                />
              )}

              {currentTab === 'migration' && (
                <MigrationToolkit
                  scorecard={scorecard}
                  caseStudies={caseStudies}
                  nomadPackage={nomadPackage}
                  lang={lang}
                  onSimulate={handleMigrationSimulate}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
