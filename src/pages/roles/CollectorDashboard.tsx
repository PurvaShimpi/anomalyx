import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_PROJECTS,
  INITIAL_AI_ALERTS,
  INITIAL_SITE_EVIDENCE,
  db,
} from '../../server/db';
import { MetricCard } from '../../components/common/MetricCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ProjectDetailModal } from '../../components/modals/ProjectDetailModal';
import { AlertDetailModal } from '../../components/modals/AlertDetailModal';
import { InquiryDirectiveModal } from '../../components/modals/ActionModals';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Building2,
  Coins,
  ShieldAlert,
  Scale,
  MapPin,
  AlertTriangle,
  Lock,
  Unlock,
  FileSearch,
  Plus,
  ArrowUpRight,
  Filter,
  FileText,
  CreditCard,
  TrendingUp,
  History,
  Users,
  FolderArchive,
  Bell,
  User,
  Search,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const CollectorDashboard: React.FC = () => {
  const { user, activeView, addToast } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedMapProject, setSelectedMapProject] = useState<string>('proj-p102');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const districtProjects = INITIAL_PROJECTS;
  const totalSanctioned = districtProjects.reduce((sum, p) => sum + p.sanctionAmount, 0);
  const totalExpenditure = districtProjects.reduce((sum, p) => sum + p.expenditure, 0);
  const avgUtilization = ((totalExpenditure / totalSanctioned) * 100).toFixed(1);
  const highRiskProjects = districtProjects.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH');
  const inquiryDirectives = db.inquiryDirectives;

  const filteredProjects = districtProjects.filter((p) => {
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.locationAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleToggleFundHold = (projId: string, currentHeld: boolean) => {
    const proj = INITIAL_PROJECTS.find((p) => p.id === projId);
    if (proj) {
      if (currentHeld) {
        proj.status = 'IN_PROGRESS';
        addToast('success', 'Fund Hold Released', `Treasury disbursements resumed for ${proj.code}.`);
      } else {
        proj.status = 'ON_HOLD';
        addToast('warning', 'Disbursements Frozen', `Administrative fund hold placed on ${proj.code}.`);
      }
    }
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
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300">
                  District Nodal Authority
                </span>
                <span className="text-xs text-slate-400 font-mono">Office of the District Magistrate, Nashik</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {user?.fullName} – District Monitoring &amp; Sanctions
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oversee administrative sanctions, monitor MPLADS fund utilization across constituencies, place fund holds, and issue statutory inquiry directives.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowInquiryModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Scale className="w-4 h-4" />
                <span>Issue Inquiry Directive</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Sanctions (District)"
              value={`₹${(totalSanctioned / 10000000).toFixed(2)} Cr`}
              subtext={`${districtProjects.length} sanctioned developmental works`}
              icon={Building2}
              variant="default"
            />
            <MetricCard
              title="Funds Disbursed"
              value={`₹${(totalExpenditure / 10000000).toFixed(2)} Cr`}
              subtext={`${avgUtilization}% expenditure rate`}
              icon={Coins}
              variant="success"
            />
            <MetricCard
              title="High/Critical Risk Works"
              value={highRiskProjects.length}
              subtext="Require executive scrutiny"
              icon={ShieldAlert}
              variant="critical"
            />
            <MetricCard
              title="Active Inquiry Directives"
              value={inquiryDirectives.length}
              subtext="Under SDM / EE probe"
              icon={FileSearch}
              variant="warning"
            />
          </div>
          {/* CRITICAL ATTENTION BANNER: HIGH RISK PROJECTS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Projects Flagged with Elevated Risk
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Prioritized by AI risk indicators. The Collector may freeze further fund disbursements or order an SDM inquiry.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {highRiskProjects.map((p) => {
                const isHeld = p.status === 'ON_HOLD';
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{p.code}</span>
                        <RiskBadge level={p.riskLevel} score={p.riskScore} />
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-medium">
                          {p.constituency}
                        </span>
                        {isHeld && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-600 text-white font-bold">
                            DISBURSEMENT FROZEN
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Contractor: <span className="font-medium text-slate-800 dark:text-slate-200">{p.contractorName}</span> •
                        Physical Progress: <span className="font-bold text-slate-900 dark:text-white">{p.physicalProgressPercent}%</span> vs
                        Funds Disbursed: <span className="font-bold text-rose-600">{p.financialProgressPercent}%</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 font-semibold"
                      >
                        View Project
                      </button>
                      <button
                        onClick={() => handleToggleFundHold(p.id, isHeld)}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${
                          isHeld
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {isHeld ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{isHeld ? 'Release Fund Hold' : 'Freeze Funds'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE INQUIRY DIRECTIVES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Administrative Inquiry Directives
                </h3>
                <p className="text-xs text-slate-500">Statutory probes assigned to Sub-Divisional Magistrates and Superintending Engineers</p>
              </div>
              <button
                onClick={() => setShowInquiryModal(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue Directive
              </button>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Directive #</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Assigned Investigating Authority</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Deadline</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inquiryDirectives.map((dir) => (
                    <tr key={dir.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-400">{dir.directiveNumber}</td>
                      <td className="p-3 font-semibold">{dir.projectCode}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{dir.assignedAuthority}</td>
                      <td className="p-3 text-slate-500">{dir.issueDate}</td>
                      <td className="p-3 text-rose-600 font-semibold">{dir.deadlineDate}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {dir.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW: DISTRICT OVERVIEW */}
      {activeView === 'district-overview' && (
        <div>
          <PageHeader
            title="Taluka & Constituency-Wise MPLADS Allocation Breakdown"
            subtitle="Distribution of sanctions, fund releases, and physical completions across Nashik District"
            icon={Building2}
            badge="District Overview"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Taluka &amp; Constituency-Wise MPLADS Allocation Breakdown
            </h3>
            <p className="text-xs text-slate-500">Distribution of sanctions, fund releases, and physical completions across Nashik District</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              { taluka: 'Nashik (Urban & Central)', works: 3, sanctioned: '₹1.05 Cr', spent: '₹0.78 Cr', rate: '74%', status: 'Normal' },
              { taluka: 'Niphad (Rural)', works: 2, sanctioned: '₹0.70 Cr', spent: '₹0.64 Cr', rate: '91%', status: 'Elevated Risk' },
              { taluka: 'Dindori (Tribal Area)', works: 1, sanctioned: '₹0.40 Cr', spent: '₹0.20 Cr', rate: '50%', status: 'Normal' },
              { taluka: 'Sinnar', works: 1, sanctioned: '₹0.35 Cr', spent: '₹0.15 Cr', rate: '42%', status: 'Normal' },
              { taluka: 'Malegaon', works: 1, sanctioned: '₹0.50 Cr', spent: '₹0.38 Cr', rate: '76%', status: 'Normal' },
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{t.taluka}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    t.status === 'Elevated Risk' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between"><span>Active Works:</span><span className="font-bold">{t.works}</span></div>
                  <div className="flex justify-between"><span>Sanctioned:</span><span className="font-bold">{t.sanctioned}</span></div>
                  <div className="flex justify-between"><span>Expenditure:</span><span className="font-bold">{t.spent}</span></div>
                  <div className="flex justify-between"><span>Utilization:</span><span className="font-bold text-emerald-600">{t.rate}</span></div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: ADMINISTRATIVE SANCTIONS */}
      {activeView === 'admin-sanctions' && (
        <div>
          <PageHeader
            title="Official Administrative Sanctions (AS) Orders"
            subtitle="Statutory sanction orders issued by the District Magistrate upon Hon'ble MP recommendation"
            icon={FileText}
            badge={`${districtProjects.length} Sanctioned Works`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Administrative Sanction (AS) Orders
            </h3>
            <p className="text-xs text-slate-500">Orders issued by the District Magistrate upon Hon'ble MP recommendation</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Sanction Order #</th>
                  <th className="p-3">Work Name</th>
                  <th className="p-3">Constituency</th>
                  <th className="p-3">Sanctioned Cost</th>
                  <th className="p-3">Implementing Agency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {districtProjects.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-purple-700 dark:text-purple-400">
                      AS/NSK/MPLADS/2024/0{80 + idx}
                    </td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3">{p.constituency}</td>
                    <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)} Lakh</td>
                    <td className="p-3">Executive Engineer, PWD Div 2</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        SANCTIONED
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

      {/* VIEW: PROJECT MONITORING */}
      {activeView === 'project-monitoring' && (
        <div>
          <PageHeader
            title="District Development Projects Repository"
            subtitle="Comprehensive register of all sanctioned developmental works under district jurisdiction"
            icon={Building2}
            badge={`${districtProjects.length} Works`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                District Development Projects Repository
              </h3>
              <p className="text-xs text-slate-500">Comprehensive register of all sanctioned developmental works</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-950"
                />
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-950"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Name &amp; Location</th>
                  <th className="p-3">Sanction Amount</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Progress (Phy vs Fin)</th>
                  <th className="p-3">Risk Tier</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-purple-700">{p.code}</td>
                    <td className="p-3 max-w-xs">
                      <span className="font-bold block text-slate-900 dark:text-white">{p.name}</span>
                      <span className="text-[11px] text-slate-500">{p.locationAddress}, {p.constituency}</span>
                    </td>
                    <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{p.contractorName}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span>Physical: {p.physicalProgressPercent}%</span>
                          <span className="text-emerald-600 font-bold">Disbursed: {p.financialProgressPercent}%</span>
                        </div>
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 text-purple-700 dark:text-purple-300 font-semibold text-[11px]"
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

      {/* VIEW: FUND UTILIZATION & FINANCIAL PROGRESS */}
      {(activeView === 'fund-utilization' || activeView === 'financial-progress') && (
        <div>
          <PageHeader
            title="District Fund Utilization & Treasury Release Ledger"
            subtitle="Expenditure certification, treasury releases, and Utilization Certificate (UC) records"
            icon={Coins}
            badge={`${avgUtilization}% Avg Utilization`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              District Fund Utilization &amp; Treasury Release Ledger
            </h3>
            <p className="text-xs text-slate-500">Expenditure certification and Utilization Certificate (UC) records</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-slate-500 block">Total Treasury Sanctions</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹{(totalSanctioned / 10000000).toFixed(2)} Cr</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-slate-500 block">Total Disbursed to Vendors</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">₹{(totalExpenditure / 10000000).toFixed(2)} Cr</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-slate-500 block">Unspent Balance in Treasury</span>
              <div className="text-xl font-bold text-blue-600 mt-1">₹{((totalSanctioned - totalExpenditure) / 10000000).toFixed(2)} Cr</div>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Sanction Amount</th>
                  <th className="p-3">Disbursed</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Utilization %</th>
                  <th className="p-3">UC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {districtProjects.map((p) => {
                  const util = Math.round((p.expenditure / p.sanctionAmount) * 100);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{p.code}</td>
                      <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">₹{(p.expenditure / 100000).toFixed(2)}L</td>
                      <td className="p-3 font-mono text-slate-500">₹{((p.sanctionAmount - p.expenditure) / 100000).toFixed(2)}L</td>
                      <td className="p-3 font-mono font-bold">{util}%</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          SUBMITTED
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
      )}

      {/* VIEW: PHYSICAL PROGRESS */}
      {activeView === 'physical-progress' && (
        <div>
          <PageHeader
            title="District Works Physical Progress Milestones"
            subtitle="Stage-by-stage engineering completion monitored across all executing agencies"
            icon={TrendingUp}
            badge="Milestones Track"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              District Works Physical Progress Milestones
            </h3>
            <p className="text-xs text-slate-500">Stage-by-stage engineering completion monitored across all executing agencies</p>
          </div>

          <div className="space-y-4">
            {districtProjects.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{p.code}</span>
                    <span className="font-bold text-sm ml-2 text-slate-900 dark:text-white">{p.name}</span>
                  </div>
                  <span className="font-bold text-purple-700 dark:text-purple-400">{p.physicalProgressPercent}% Measured Ground Progress</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>Location: {p.locationAddress} • Contractor: {p.contractorName}</span>
                  <span>Target Completion: {p.expectedCompletionDate}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: HIGH RISK PROJECTS & FUND HOLDS */}
      {(activeView === 'high-risk-projects' || activeView === 'fund-holds') && (
        <div>
          <PageHeader
            title="Executive Fund Disbursement Controls & Risk Interventions"
            subtitle="Administrative authority to freeze treasury releases on high-risk projects"
            icon={Lock}
            badge={`${highRiskProjects.length} Risk Flagged Works`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Executive Fund Disbursement Controls &amp; Risk Interventions
            </h3>
            <p className="text-xs text-slate-500">Administrative authority to freeze treasury releases on high-risk projects</p>
          </div>

          <div className="space-y-3 text-xs">
            {highRiskProjects.map((p) => {
              const isHeld = p.status === 'ON_HOLD';
              return (
                <div key={p.id} className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{p.code}</span>
                      <RiskBadge level={p.riskLevel} score={p.riskScore} />
                      {isHeld && (
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">
                          DISBURSEMENT FROZEN
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">
                      Physical: {p.physicalProgressPercent}% | Disbursed: {p.financialProgressPercent}% | Reason: Disparity &amp; semantic overlap
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleFundHold(p.id, isHeld)}
                      className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 ${
                        isHeld ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isHeld ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{isHeld ? 'Release Fund Hold' : 'Freeze Funds'}</span>
                    </button>
                    <button
                      onClick={() => setShowInquiryModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold flex items-center gap-1.5"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Order Inquiry</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: AI RISK DASHBOARD & ANOMALY ALERTS */}
      {(activeView === 'ai-risk-dashboard' || activeView === 'anomaly-alerts') && (
        <div>
          <PageHeader
            title="AI Risk Prioritization & Anomaly Analysis"
            subtitle="Algorithmic risk factors explaining why specific works are prioritized for executive action"
            icon={ShieldAlert}
            badge={`${INITIAL_AI_ALERTS.length} Alerts`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Risk Prioritization &amp; Anomaly Analysis
            </h3>
            <p className="text-xs text-slate-500">Algorithmic risk factors explaining why specific works are prioritized for executive action</p>
          </div>

          <div className="space-y-3">
            {INITIAL_AI_ALERTS.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10 cursor-pointer hover:shadow-xs transition-all text-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold">{alert.projectCode}</span>
                    <RiskBadge level={alert.riskLevel} score={alert.riskScore} />
                  </div>
                  <span className="text-slate-400 text-[11px]">{alert.dateDetected}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">{alert.description}</p>
                <div className="mt-2 text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                  Click to inspect algorithmic factors &amp; view human verification notes
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: DELAYED WORKS */}
      {activeView === 'delayed-works' && (
        <div>
          <PageHeader
            title="Delayed & Time-Overrun Works Registry"
            subtitle="Projects exceeding stipulated contractual completion deadlines"
            icon={AlertTriangle}
            badge="Overdue Works"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Delayed &amp; Time-Overrun Works Registry
            </h3>
            <p className="text-xs text-slate-500">Projects exceeding stipulated contractual completion deadlines</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Stipulated Target</th>
                  <th className="p-3">Days Overdue</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {districtProjects.filter((p) => p.delayDays > 0 || p.riskLevel === 'CRITICAL').map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-purple-700">{p.code}</td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3">{p.contractorName}</td>
                    <td className="p-3 text-slate-600">{p.expectedCompletionDate}</td>
                    <td className="p-3 font-mono font-bold text-rose-600">84 Days</td>
                    <td className="p-3">
                      <button
                        onClick={() => addToast('warning', 'Notice Issued', `Show-cause notice generated for contractor ${p.contractorName}`)}
                        className="px-2.5 py-1 rounded bg-rose-100 text-rose-800 font-bold hover:bg-rose-200"
                      >
                        Issue Show-Cause
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

      {/* VIEW: INQUIRY DIRECTIVES */}
      {activeView === 'inquiry-directives' && (
        <div>
          <PageHeader
            title="Statutory Inquiry Directives & Action Orders"
            subtitle="Executive directives issued to Sub-Divisional Magistrates and Superintending Engineers"
            icon={Scale}
            badge={`${inquiryDirectives.length} Active Directives`}
            actions={
              <button
                onClick={() => setShowInquiryModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Inquiry Directive</span>
              </button>
            }
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statutory Inquiry Directives &amp; Action Orders
              </h3>
              <p className="text-xs text-slate-500">Executive directives issued to Sub-Divisional Magistrates and Superintending Engineers</p>
            </div>
            <button
              onClick={() => setShowInquiryModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue New Inquiry Directive
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Directive Number</th>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Investigating Authority</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Submission Deadline</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inquiryDirectives.map((dir) => (
                  <tr key={dir.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-purple-700">{dir.directiveNumber}</td>
                    <td className="p-3 font-semibold">{dir.projectCode}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{dir.assignedAuthority}</td>
                    <td className="p-3 text-slate-500">{dir.issueDate}</td>
                    <td className="p-3 text-rose-600 font-semibold">{dir.deadlineDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {dir.status}
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

      {/* VIEW: CONTRACTOR RISK */}
      {activeView === 'contractor-risk' && (
        <div>
          <PageHeader
            title="District Vendor Concentration & Risk Profiles"
            subtitle="Monitoring vendor allocation share and contractor default records"
            icon={Users}
            badge="Vendor Scrutiny"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              District Vendor Concentration &amp; Risk Profiles
            </h3>
            <p className="text-xs text-slate-500">Monitoring vendor allocation share and contractor default records</p>
          </div>

          <div className="space-y-3 text-xs">
            {['Patil Infrastructure & Works Pvt Ltd', 'Nashik Roadlines & Civil Projects', 'Deshmukh Developers & Earthmovers'].map((v, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{v}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                    Contractor Share: {i === 0 ? '42% of District Works' : '28% of District Works'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <div><span className="text-slate-400 block">Total Contracts:</span><span className="font-bold">₹1.15 Cr</span></div>
                  <div><span className="text-slate-400 block">Active Directives:</span><span className="font-bold text-rose-600">{i === 0 ? '1 Inquiry Active' : 'None'}</span></div>
                  <div><span className="text-slate-400 block">Status:</span><span className="font-bold text-emerald-600">Eligible</span></div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: GEOGRAPHIC MAP */}
      {activeView === 'geographic-map' && (
        <div>
          <PageHeader
            title="Geographic Risk Distribution (District GIS Map)"
            subtitle="Interactive spatial view of sanctioned MPLADS works color-coded by AI risk classification"
            icon={MapPin}
            badge="GIS Tracking"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Geographic Risk Distribution (District GIS Map)
            </h3>
            <p className="text-xs text-slate-500">Interactive spatial view of sanctioned MPLADS works color-coded by AI risk classification</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-slate-900 rounded-xl p-4 border border-slate-800 text-white min-h-[340px] flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-mono font-bold bg-slate-800/80 px-2.5 py-1 rounded">
                  Nashik District Geo-Spatial Visualizer
                </span>
                <span className="text-xs font-mono text-emerald-400">GPS Sensor Feed: Synchronized</span>
              </div>

              <div className="relative my-8 flex items-center justify-center">
                <div className="w-full max-w-md h-48 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center relative bg-slate-950/40">
                  <div className="text-center text-xs text-slate-500">
                    <MapPin className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
                    <span>20.0768° N, 74.1084° E (Niphad Cluster)</span>
                    <span className="block font-bold text-rose-400 mt-1">High-Risk Anomaly Pin: P102 &amp; P108</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 z-10">
                <span>Projection: WGS 84 / UTM Zone 43N</span>
                <span>Spatial Anomaly Cluster: Niphad (0.8km overlap)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">District Project Pins:</span>
              {districtProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedMapProject(p.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedMapProject === p.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold">{p.code}</span>
                    <RiskBadge level={p.riskLevel} score={p.riskScore} />
                  </div>
                  <h5 className="font-bold mt-1 text-slate-900 dark:text-white truncate">{p.name}</h5>
                  <p className="text-slate-500 text-[10px] mt-0.5">{p.locationAddress}</p>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: EVIDENCE */}
      {activeView === 'evidence' && (
        <div>
          <PageHeader
            title="District Photographic & Documentary Evidence Vault"
            subtitle="Verified field evidence supporting administrative determinations"
            icon={FileSearch}
            badge={`${INITIAL_SITE_EVIDENCE.length} Evidence Records`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              District Photographic &amp; Documentary Evidence Vault
            </h3>
            <p className="text-xs text-slate-500">Verified field evidence supporting administrative determinations</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {INITIAL_SITE_EVIDENCE.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 text-xs">
                <div className="h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 relative">
                  <MapPin className="w-8 h-8 opacity-40" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    {ev.geoCoordinates.lat.toFixed(4)}° N, {ev.geoCoordinates.lng.toFixed(4)}° E
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold">{ev.projectCode}</span>
                    <span className="text-[10px] text-slate-400">{ev.uploadDate}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    Stage: {ev.stage}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 line-clamp-2">
                    {ev.description || ev.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: REPORTS */}
      {activeView === 'reports' && (
        <div>
          <PageHeader
            title="Statutory District Reports & Executive Dossiers"
            subtitle="District progress reporting to Ministry of Statistics & Programme Implementation (MoSPI)"
            icon={FileText}
            badge="District Reports"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Statutory District Reports &amp; Executive Dossiers
            </h3>
            <p className="text-xs text-slate-500">District progress reporting to Ministry of Statistics &amp; Programme Implementation (MoSPI)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">District Monthly Progress Report (MPR)</h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-3">
                Comprehensive district progress covering sanctioned works, releases, physical stages, and UC status.
              </p>
              <button
                onClick={() => addToast('success', 'District MPR Exported', 'Report downloaded for transmission to Ministry.')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export District MPR
              </button>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Administrative Action Brief on Flagged Works</h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-3">
                Summary of fund holds and SDM inquiry orders on P102 and P108.
              </p>
              <button
                onClick={() => addToast('success', 'Action Brief Generated', 'Brief prepared with full audit notes.')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Action Brief
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
            title="Collectorate Official Communications"
            subtitle="Notices from MoSPI, CAG Audit Office, and Field Engineers"
            icon={Bell}
            badge="Official Communications"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Collectorate Official Communications
            </h3>
            <p className="text-xs text-slate-500">Notices from MoSPI, CAG Audit Office, and Field Engineers</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-purple-900 dark:text-purple-200">SDM Niphad Submitted Interim Inspection Report</span>
                <span className="text-[10px] text-slate-400">11:00 AM</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Inquiry directive DM/NSK/INQ/2026/015 interim report received: Site measurements show 45% physical completion vs 92% funds disbursed.
              </p>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: PROFILE */}
      {activeView === 'profile' && (
        <div>
          <PageHeader
            title="District Magistrate Nodal Profile"
            subtitle="Government credentials and statutory administrative sign-off authority"
            icon={User}
            badge="District Nodal Authority"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              District Magistrate Nodal Profile
            </h3>
            <p className="text-xs text-slate-500">Government credentials and statutory administrative sign-off authority</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Officer Name:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{user?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Designation:</span>
                <span className="font-bold text-slate-900 dark:text-white">District Magistrate &amp; District Collector (IAS)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Jurisdiction:</span>
                <span className="font-bold text-slate-900 dark:text-white">Nashik District, Government of Maharashtra</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Authority Level:</span>
                <span className="font-bold text-emerald-600">Nodal Officer (Full Administrative Sanction Power)</span>
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

      {showInquiryModal && (
        <InquiryDirectiveModal onClose={() => setShowInquiryModal(false)} />
      )}
    </div>
  );
};
