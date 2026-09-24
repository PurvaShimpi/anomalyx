import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_PROJECTS,
  INITIAL_AI_ALERTS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  db,
} from '../../server/db';
import { MetricCard } from '../../components/common/MetricCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ProjectDetailModal } from '../../components/modals/ProjectDetailModal';
import { AlertDetailModal } from '../../components/modals/AlertDetailModal';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Globe2,
  Building2,
  ShieldAlert,
  Sliders,
  Users,
  Terminal,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Activity,
  Layers,
  MapPin,
  FolderGit2,
  Coins,
  Scale,
  History,
  CreditCard,
  TrendingUp,
  FileSearch,
  FileText,
  Bell,
  User,
  Download,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, activeView, addToast } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Threshold Sliders state
  const [mismatchThreshold, setMismatchThreshold] = useState(30);
  const [duplicateThreshold, setDuplicateThreshold] = useState(85);
  const [delayThresholdDays, setDelayThresholdDays] = useState(60);

  const projects = INITIAL_PROJECTS;
  const totalSanctioned = projects.reduce((sum, p) => sum + p.sanctionAmount, 0);
  const totalExpenditure = projects.reduce((sum, p) => sum + p.expenditure, 0);
  const nationalUtilization = ((totalExpenditure / totalSanctioned) * 100).toFixed(1);

  const criticalCount = projects.filter((p) => p.riskLevel === 'CRITICAL').length;
  const highCount = projects.filter((p) => p.riskLevel === 'HIGH').length;
  const mediumCount = projects.filter((p) => p.riskLevel === 'MEDIUM').length;
  const lowCount = projects.filter((p) => p.riskLevel === 'LOW').length;

  const filteredProjects = projects.filter((p) => {
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesQuery;
  });

  const handleSaveThresholds = () => {
    addToast(
      'success',
      'AI Parameters Updated',
      `Mismatch: ${mismatchThreshold}%, Duplicate: ${duplicateThreshold}%, Delay: ${delayThresholdDays}d.`
    );
  };

  return (
    <div className="space-y-6">
      {/* VIEW: DASHBOARD (Overview) */}
      {(activeView === 'dashboard' || !activeView) && (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300">
                  National Ministry Command
                </span>
                <span className="text-xs text-slate-400 font-mono">Ministry of Statistics &amp; Programme Implementation (MoSPI)</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {user?.fullName} – National MPLADS Administration
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pan-India infrastructure performance monitoring, state-level allocations, national AI risk modeling, and role provisioning.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Azure ML Pipeline: Live</span>
              </span>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Sanctioned Works (National)"
              value={projects.length}
              subtext={`₹${(totalSanctioned / 10000000).toFixed(2)} Cr approved`}
              icon={Globe2}
              variant="default"
            />
            <MetricCard
              title="National Expenditure"
              value={`₹${(totalExpenditure / 10000000).toFixed(2)} Cr`}
              subtext={`${nationalUtilization}% national utilization`}
              icon={Building2}
              variant="info"
            />
            <MetricCard
              title="Critical Anomalies"
              value={criticalCount}
              subtext="Immediate inquiry recommended"
              icon={ShieldAlert}
              variant="critical"
            />
            <MetricCard
              title="System Registered Users"
              value={INITIAL_USERS.length}
              subtext="Contractors, EEs, DMs, Auditors"
              icon={Users}
              variant="success"
            />
          </div>
          {/* NATIONAL AI RISK DISTRIBUTION MATRIX */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  National AI Risk Classification Breakdown
                </h3>
                <p className="text-xs text-slate-500">Distribution of projects across calibrated risk score tiers</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">Total: {projects.length} works</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                <span className="text-[11px] font-bold uppercase text-rose-700 dark:text-rose-300">Critical (75-100)</span>
                <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{criticalCount}</div>
                <span className="text-[10px] text-slate-500">{((criticalCount / projects.length) * 100).toFixed(0)}% of works</span>
              </div>
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
                <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">High (50-74)</span>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{highCount}</div>
                <span className="text-[10px] text-slate-500">{((highCount / projects.length) * 100).toFixed(0)}% of works</span>
              </div>
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                <span className="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-300">Medium (25-49)</span>
                <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{mediumCount}</div>
                <span className="text-[10px] text-slate-500">{((mediumCount / projects.length) * 100).toFixed(0)}% of works</span>
              </div>
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Low (0-24)</span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{lowCount}</div>
                <span className="text-[10px] text-slate-500">{((lowCount / projects.length) * 100).toFixed(0)}% of works</span>
              </div>
            </div>
          </div>

          {/* NATIONAL AI THRESHOLD CALIBRATION TUNER */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    National AI Risk Engine Sensitivity &amp; Parameter Calibration
                  </h3>
                  <p className="text-xs text-slate-500">Tune trigger sensitivity for machine learning anomaly detection models nationwide</p>
                </div>
              </div>
              <button
                onClick={handleSaveThresholds}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
              >
                Apply Parameters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between font-bold mb-2">
                  <span>Payment-Progress Gap Trigger</span>
                  <span className="text-indigo-600 font-mono">{mismatchThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={50}
                  value={mismatchThreshold}
                  onChange={(e) => setMismatchThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-500 block mt-2">Flags when disbursed funds outpace ground progress by &gt;{mismatchThreshold}%</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between font-bold mb-2">
                  <span>Duplicate Works Semantic Match</span>
                  <span className="text-indigo-600 font-mono">{duplicateThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={95}
                  value={duplicateThreshold}
                  onChange={(e) => setDuplicateThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-500 block mt-2">NLP embedding cosine similarity threshold for work descriptions</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between font-bold mb-2">
                  <span>Delayed Works Tolerance</span>
                  <span className="text-indigo-600 font-mono">{delayThresholdDays} Days</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  value={delayThresholdDays}
                  onChange={(e) => setDelayThresholdDays(Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-[10px] text-slate-500 block mt-2">Permissible timeline overrun before critical flag issuance</span>
              </div>
            </div>
          </div>

          {/* NATIONAL WORKS MONITORING DATABASE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  National Works Monitoring Database
                </h3>
                <p className="text-xs text-slate-500">Query sanctions across all states, districts, and risk indicators</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter works..."
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs w-48"
                  />
                </div>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium"
                >
                  <option value="ALL">All Risk Tiers</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High Only</option>
                  <option value="MEDIUM">Medium Only</option>
                  <option value="LOW">Low Only</option>
                </select>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
              <table className="w-full text-left min-w-[760px]">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Project Title</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Sanction Amount</th>
                    <th className="p-3">Physical %</th>
                    <th className="p-3">Financial %</th>
                    <th className="p-3">Risk Assessment</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{p.code}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">{p.name}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{p.district}</td>
                      <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                      <td className="p-3 font-medium">{p.physicalProgressPercent}%</td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{p.financialProgressPercent}%</td>
                      <td className="p-3">
                        <RiskBadge level={p.riskLevel} score={p.riskScore} />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedProjectId(p.id)}
                          className="px-2.5 py-1 rounded bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-semibold hover:bg-slate-800"
                        >
                          Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW: NATIONAL OVERVIEW & STATE MONITORING */}
      {(activeView === 'national-overview' || activeView === 'state-monitoring') && (
        <div>
          <PageHeader
            title="Pan-India State-Wise MPLADS Allocation & Performance"
            subtitle="Comparative fund utilization across State Nodal Departments"
            icon={Globe2}
            badge="National Overview"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Pan-India State-Wise MPLADS Allocation &amp; Performance
            </h3>
            <p className="text-xs text-slate-500">Comparative fund utilization across State Nodal Departments</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">State / UT</th>
                  <th className="p-3">Districts</th>
                  <th className="p-3">Total Sanctions</th>
                  <th className="p-3">Expenditure</th>
                  <th className="p-3">Avg Physical %</th>
                  <th className="p-3">Utilization Rate</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { state: 'Maharashtra', dist: 36, sanc: '₹145.20 Cr', exp: '₹118.50 Cr', phy: '78%', util: '81.6%', stat: 'Normal' },
                  { state: 'Karnataka', dist: 31, sanc: '₹120.00 Cr', exp: '₹94.20 Cr', phy: '72%', util: '78.5%', stat: 'Normal' },
                  { state: 'Gujarat', dist: 33, sanc: '₹110.50 Cr', exp: '₹92.00 Cr', phy: '81%', util: '83.2%', stat: 'Normal' },
                  { state: 'Tamil Nadu', dist: 38, sanc: '₹135.00 Cr', exp: '₹112.10 Cr', phy: '80%', util: '83.0%', stat: 'Normal' },
                  { state: 'Uttar Pradesh', dist: 75, sanc: '₹280.00 Cr', exp: '₹198.40 Cr', phy: '66%', util: '70.8%', stat: 'Attention' },
                ].map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{s.state}</td>
                    <td className="p-3">{s.dist}</td>
                    <td className="p-3 font-mono font-bold">{s.sanc}</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">{s.exp}</td>
                    <td className="p-3 font-mono">{s.phy}</td>
                    <td className="p-3 font-mono font-bold text-blue-600">{s.util}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.stat === 'Attention' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {s.stat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: DISTRICT MONITORING */}
      {activeView === 'district-monitoring' && (
        <div>
          <PageHeader
            title="District Nodal Performance Benchmark"
            subtitle="Ranking of district magistrate nodal performance and anomaly resolution speed"
            icon={Building2}
            badge="District Benchmarking"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              District Nodal Performance Benchmark
            </h3>
            <p className="text-xs text-slate-500">Ranking of district magistrate nodal performance and anomaly resolution speed</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              { district: 'Nashik', state: 'Maharashtra', activeWorks: 5, riskScore: 'Elevated (P102 flagged)', utilization: '79%' },
              { district: 'Pune', state: 'Maharashtra', activeWorks: 12, riskScore: 'Low (Clean audit)', utilization: '88%' },
              { district: 'Nagpur', state: 'Maharashtra', activeWorks: 8, riskScore: 'Low', utilization: '84%' },
              { district: 'Mumbai Suburban', state: 'Maharashtra', activeWorks: 15, riskScore: 'Medium', utilization: '76%' },
              { district: 'Thane', state: 'Maharashtra', activeWorks: 9, riskScore: 'Low', utilization: '82%' },
            ].map((d, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{d.district}</span>
                <span className="text-[11px] text-slate-400 block">{d.state}</span>
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between"><span>Active Works:</span><span className="font-bold">{d.activeWorks}</span></div>
                  <div className="flex justify-between"><span>Risk Rating:</span><span className="font-bold text-rose-600">{d.riskScore}</span></div>
                  <div className="flex justify-between"><span>Utilization:</span><span className="font-bold text-emerald-600">{d.utilization}</span></div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: PROJECT MONITORING */}
      {activeView === 'project-monitoring' && (
        <div>
          <PageHeader
            title="National Works Monitoring Database"
            subtitle="Complete national repository of all developmental projects across constituencies"
            icon={FolderGit2}
            badge={`${filteredProjects.length} Projects`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                National Works Monitoring Database
              </h3>
              <p className="text-xs text-slate-500">Complete national repository of all projects</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search works..."
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Sanction</th>
                  <th className="p-3">Physical %</th>
                  <th className="p-3">Risk Assessment</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold">{p.code}</td>
                    <td className="p-3 font-semibold max-w-xs truncate">{p.name}</td>
                    <td className="p-3">{p.district}</td>
                    <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                    <td className="p-3 font-medium">{p.physicalProgressPercent}%</td>
                    <td className="p-3"><RiskBadge level={p.riskLevel} score={p.riskScore} /></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-2.5 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: FUND ANALYTICS & FINANCIAL ANALYTICS */}
      {(activeView === 'fund-analytics' || activeView === 'financial-analytics') && (
        <div>
          <PageHeader
            title="National Fund Analytics & Treasury Expenditure Flows"
            subtitle="Ministry of Finance central allocation vs state treasury releases"
            icon={Coins}
            badge="Treasury Flows"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National Fund Analytics &amp; Treasury Expenditure Flows
            </h3>
            <p className="text-xs text-slate-500">Ministry of Finance central allocation vs state treasury releases</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-slate-500 block">Annual Parliamentary Allotment</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹3,920.00 Cr</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-slate-500 block">Released to District Nodal Accounts</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">₹3,140.00 Cr</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-slate-500 block">Vendor PFMS Clearing Velocity</span>
              <div className="text-xl font-bold text-blue-600 mt-1">94.2% On-Time</div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: AI RISK OVERVIEW & ANOMALY DETECTION */}
      {(activeView === 'ai-risk-overview' || activeView === 'anomaly-detection') && (
        <div>
          <PageHeader
            title="Live National Anomaly Detection Stream"
            subtitle="Unsupervised machine learning flags generated by Isolation Forest and NLP models"
            icon={ShieldAlert}
            badge={`${INITIAL_AI_ALERTS.length} Active Alerts`}
            actions={
              <button
                onClick={() => addToast('info', 'Model Refreshed', 'Isolation forest retrained across 48,000 national records.')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retrain Model</span>
              </button>
            }
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live National Anomaly Detection Stream
              </h3>
              <p className="text-xs text-slate-500">Unsupervised machine learning flags generated by Isolation Forest and NLP models</p>
            </div>
            <button
              onClick={() => addToast('info', 'Model Refreshed', 'Isolation forest retrained across 48,000 national records.')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retrain Model
            </button>
          </div>

          <div className="space-y-3">
            {INITIAL_AI_ALERTS.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10 cursor-pointer hover:shadow-xs text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{alert.projectCode}</span>
                    <RiskBadge level={alert.riskLevel} score={alert.riskScore} />
                  </div>
                  <span className="text-slate-400">{alert.dateDetected}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 mt-1">{alert.description}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: HIGH RISK & DELAYED PROJECTS */}
      {(activeView === 'high-risk-projects' || activeView === 'delayed-projects') && (
        <div>
          <PageHeader
            title="National High-Risk & Overdue Projects Queue"
            subtitle="Works subject to central ministry oversight or administrative inquiry"
            icon={AlertTriangle}
            badge="Priority Oversight"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National High-Risk &amp; Overdue Projects Queue
            </h3>
            <p className="text-xs text-slate-500">Works subject to central ministry oversight or administrative inquiry</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Sanction</th>
                  <th className="p-3">Physical %</th>
                  <th className="p-3">Risk Tier</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {projects.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-rose-600">{p.code}</td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3">{p.contractorName}</td>
                    <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                    <td className="p-3 font-mono">{p.physicalProgressPercent}%</td>
                    <td className="p-3"><RiskBadge level={p.riskLevel} score={p.riskScore} /></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-2.5 py-1 rounded bg-slate-900 text-white font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: CONTRACTOR RISK & GEOGRAPHIC RISK MAP */}
      {(activeView === 'contractor-risk' || activeView === 'geographic-risk-map') && (
        <div>
          <PageHeader
            title="National Spatial GIS Map & Vendor Concentration"
            subtitle="Cross-state spatial risk mapping and vendor de-duplication"
            icon={MapPin}
            badge="Spatial GIS Visualizer"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National Spatial GIS Map &amp; Vendor Concentration
            </h3>
            <p className="text-xs text-slate-500">Cross-state spatial risk mapping and vendor de-duplication</p>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl text-center text-xs">
            <MapPin className="w-10 h-10 text-rose-500 mx-auto mb-3 animate-bounce" />
            <h4 className="font-bold text-sm">National GIS Cluster Engine</h4>
            <p className="text-slate-400 mt-1 max-w-md mx-auto">
              Pan-India satellite coordinate validation active. High-risk cluster detected in Nashik Division (0.8km overlapping work descriptions).
            </p>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: PROGRESS ANALYTICS & AUDIT MONITORING */}
      {(activeView === 'progress-analytics' || activeView === 'audit-monitoring') && (
        <div>
          <PageHeader
            title="Physical Milestone Completion & CAG Audit Monitoring"
            subtitle="Stage breakdown and statutory audit settlement tracker"
            icon={TrendingUp}
            badge="Milestones & CAG Audit"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Physical Milestone Completion &amp; CAG Audit Monitoring
            </h3>
            <p className="text-xs text-slate-500">Stage breakdown and statutory audit settlement tracker</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm mb-2">Stage Completion Curve</h4>
              <div className="space-y-2">
                <div><span>Foundation Stage:</span><span className="float-right font-bold">100% Passed</span></div>
                <div><span>Superstructure Stage:</span><span className="float-right font-bold">68% Ongoing</span></div>
                <div><span>Finishing &amp; Handover:</span><span className="float-right font-bold">35% Certified</span></div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm mb-2">CAG Audit Paras Resolution</h4>
              <div className="space-y-2">
                <div><span>Total Paras Raised:</span><span className="float-right font-bold">4 Paras</span></div>
                <div><span>Under Inquiry:</span><span className="float-right font-bold text-amber-600">2 Active</span></div>
                <div><span>Settled:</span><span className="float-right font-bold text-emerald-600">2 Settled</span></div>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: USER MANAGEMENT & ROLE MANAGEMENT */}
      {(activeView === 'user-management' || activeView === 'role-management') && (
        <div>
          <PageHeader
            title="National User Management & RBAC Access Controls"
            subtitle="Authorized personnel across Government agencies, contractors, and audit offices"
            icon={Users}
            badge={`${INITIAL_USERS.length} Registered Users`}
            actions={
              <button
                onClick={() => addToast('info', 'User Provisioning', 'New official account creation form ready.')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision New User</span>
              </button>
            }
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                National User Management &amp; RBAC Access Controls
              </h3>
              <p className="text-xs text-slate-500">Authorized personnel across Government agencies, contractors, and audit offices</p>
            </div>
            <button
              onClick={() => addToast('info', 'User Provisioning', 'New official account creation form ready.')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Provision New User
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Official Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department / Org</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{u.fullName}</td>
                    <td className="p-3 font-mono text-slate-500">{u.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.organization || u.department || 'MoSPI'}</td>
                    <td className="p-3">{u.district ? `${u.district}, ${u.state}` : 'National'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: SYSTEM CONFIG */}
      {activeView === 'system-config' && (
        <div>
          <PageHeader
            title="System Configuration & Technical Infrastructure"
            subtitle="Core parameters, database synchronization, and security posture"
            icon={Sliders}
            badge="Infrastructure Healthy"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              System Configuration &amp; Technical Infrastructure
            </h3>
            <p className="text-xs text-slate-500">Core parameters, database synchronization, and security posture</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">Database Cluster Synchronization</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Healthy</span>
              </div>
              <p className="text-slate-500 text-[11px]">Primary production cluster syncing with state secondary nodes at 100ms latency.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">Cryptographic Ledger Hashing</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">SHA-256 Verified</span>
              </div>
              <p className="text-slate-500 text-[11px]">All transactions, bills, and inspections immutably hashed and verifiable by CAG.</p>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: REPORTS */}
      {activeView === 'reports' && (
        <div>
          <PageHeader
            title="National Reports & Parliament Submissions"
            subtitle="Statutory MPLADS Annual Performance Compendiums"
            icon={FileText}
            badge="Parliament Dossiers"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National Reports &amp; Parliament Submissions
            </h3>
            <p className="text-xs text-slate-500">Statutory MPLADS Annual Performance Compendiums</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm mb-1">National Annual Performance Compendium</h4>
              <p className="text-slate-500 mb-3">Consolidated report on works sanctioned across all 543 Lok Sabha constituencies.</p>
              <button
                onClick={() => addToast('success', 'Report Exported', 'National Compendium exported for parliamentary submission.')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Annual Compendium
              </button>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: NOTIFICATIONS */}
      {activeView === 'notifications' && (
        <div>
          <PageHeader
            title="National Broadcast Notices & Policy Circulars"
            subtitle="Directives from Cabinet Secretariat and MoSPI"
            icon={Bell}
            badge="Official Circulars"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National Broadcast Notices &amp; Policy Circulars
            </h3>
            <p className="text-xs text-slate-500">Directives from Cabinet Secretariat and MoSPI</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-blue-900 dark:text-blue-200">Mandatory E-MB Integration Directive</span>
                <span className="text-slate-400 text-[10px]">Active</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">All state executing agencies must mandate digital E-MB sign-off prior to passing RA bills.</p>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: SYSTEM LOGS */}
      {activeView === 'system-logs' && (
        <div>
          <PageHeader
            title="National Cryptographic Audit Log Ledger"
            subtitle="Immutable trace of all administrative, financial, and technical actions"
            icon={Terminal}
            badge={`${INITIAL_AUDIT_LOGS.length} Logged Events`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National Cryptographic Audit Log Ledger
            </h3>
            <p className="text-xs text-slate-500">Immutable trace of all administrative, financial, and technical actions</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs max-h-96 overflow-y-auto font-mono text-[11px] custom-scrollbar">
            <table className="w-full text-left min-w-[620px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_AUDIT_LOGS.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5 text-slate-400">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                    <td className="p-2.5 text-slate-900 dark:text-white font-bold">{log.userName}</td>
                    <td className="p-2.5">{log.userRole}</td>
                    <td className="p-2.5 font-bold text-indigo-600">{log.action}</td>
                    <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: PROFILE */}
      {activeView === 'profile' && (
        <div>
          <PageHeader
            title="National Administrator Profile"
            subtitle="Government credentials and statutory system administration rights"
            icon={User}
            badge="Super Administrator"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              National Administrator Profile
            </h3>
            <p className="text-xs text-slate-500">Government credentials and statutory system administration rights</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Officer Name:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{user?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Designation:</span>
                <span className="font-bold text-slate-900 dark:text-white">Joint Secretary (MPLADS Division), MoSPI</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Administration Scope:</span>
                <span className="font-bold text-slate-900 dark:text-white">Pan-India Central System Command</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Access Privileges:</span>
                <span className="font-bold text-rose-600">Super Administrator (Full System Authority)</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          onOpenAlert={(altId) => setSelectedAlertId(altId)}
        />
      )}

      {selectedAlertId && (
        <AlertDetailModal
          alertId={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
        />
      )}
    </div>
  );
};
