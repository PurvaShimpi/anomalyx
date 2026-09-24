import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_PROJECTS,
  INITIAL_WORK_ORDERS,
  INITIAL_MEASUREMENTS,
  INITIAL_INVOICES,
  INITIAL_INSPECTIONS,
  INITIAL_AI_ALERTS,
  INITIAL_MATERIAL_CERTIFICATES,
  INITIAL_SITE_EVIDENCE,
  db,
} from '../../server/db';
import { MetricCard } from '../../components/common/MetricCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ProjectDetailModal } from '../../components/modals/ProjectDetailModal';
import { AlertDetailModal } from '../../components/modals/AlertDetailModal';
import { ScheduleInspectionModal } from '../../components/modals/ActionModals';
import { PageHeader } from '../../components/common/PageHeader';
import {
  FolderGit2,
  Ruler,
  Receipt,
  ShieldAlert,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  FileBadge,
  Eye,
  Plus,
  FileText,
  Coins,
  TrendingUp,
  Users,
  FileCheck2,
  ClipboardList,
  FolderArchive,
  Bell,
  User,
  Download,
  Search,
  Filter,
} from 'lucide-react';

export const PwdEngineerDashboard: React.FC = () => {
  const { user, activeView, addToast } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  // Projects under PWD division
  const divisionProjects = INITIAL_PROJECTS;
  const pendingEmbCount = INITIAL_MEASUREMENTS.filter((m) => m.verificationStatus === 'PENDING').length;
  const pendingBillsCount = INITIAL_INVOICES.filter((i) => i.status === 'SUBMITTED' || i.status === 'UNDER_VERIFICATION').length;
  const highRiskAlerts = INITIAL_AI_ALERTS.filter((a) => a.riskLevel === 'CRITICAL' || a.riskLevel === 'HIGH');

  const filteredProjects = divisionProjects.filter((p) => {
    const matchesRisk = filterRisk === 'ALL' || p.riskLevel === filterRisk;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contractorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleVerifyEmb = (embId: string, approve: boolean) => {
    const emb = INITIAL_MEASUREMENTS.find((m) => m.id === embId);
    if (emb) {
      emb.verificationStatus = approve ? 'VERIFIED' : 'REJECTED';
      emb.engineerRemarks = approve
        ? 'Verified physical dimensions on site. Approved for RA bill calculation.'
        : 'Returned: Dimensions do not match physical structure on site.';
      addToast(
        approve ? 'success' : 'warning',
        approve ? 'E-MB Verified' : 'E-MB Returned',
        `Measurement ${emb.embNumber} ${approve ? 'approved' : 'returned with remarks'}.`
      );
    }
  };

  const handleVerifyBill = (invoiceId: string, approve: boolean) => {
    const inv = INITIAL_INVOICES.find((i) => i.id === invoiceId);
    if (inv) {
      inv.status = approve ? 'APPROVED' : 'PAYMENT_HELD';
      inv.amountApproved = approve ? inv.amountClaimed : 0;
      addToast(
        approve ? 'success' : 'warning',
        approve ? 'Bill Verified by PWD' : 'Bill Held',
        `Invoice ${inv.invoiceNumber} ${approve ? 'verified and forwarded to treasury' : 'held for technical clarification'}.`
      );
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
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300">
                  Technical Authority
                </span>
                <span className="text-xs text-slate-400 font-mono">PWD Division 2, Nashik</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {user?.fullName} – Technical Verification Workspace
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conduct physical field inspections, certify E-MB entries, verify contractor invoices, and review AI anomaly flags.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowInspectionModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>File Site Inspection</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Monitored Projects"
              value={divisionProjects.length}
              subtext="Division technical oversight"
              icon={FolderGit2}
              variant="default"
            />
            <MetricCard
              title="Pending E-MB Checks"
              value={pendingEmbCount}
              subtext="Site measurements to sign"
              icon={Ruler}
              variant={pendingEmbCount > 0 ? 'warning' : 'default'}
            />
            <MetricCard
              title="Bills for Verification"
              value={pendingBillsCount}
              subtext="RA bills under technical scrutiny"
              icon={Receipt}
              variant="info"
            />
            <MetricCard
              title="AI Risk Alerts"
              value={highRiskAlerts.length}
              subtext="Require engineer field check"
              icon={ShieldAlert}
              variant="critical"
            />
          </div>
          {/* AI RISK ALERTS BANNER */}
          {highRiskAlerts.length > 0 && (
            <div className="bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Critical Technical Anomaly Early-Warning Flags ({highRiskAlerts.length})
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  Ground verification required
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {highRiskAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:shadow-sm cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{alert.projectCode}</span>
                        <RiskBadge level={alert.riskLevel} score={alert.riskScore} />
                      </div>
                      <span className="text-[10px] text-slate-400">{alert.dateDetected}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{alert.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 line-clamp-2">{alert.description}</p>
                    <div className="mt-2 text-amber-600 dark:text-amber-400 text-[10px] font-semibold flex items-center gap-1">
                      <span>Click to review contributing factors &amp; record human verification</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: E-MB MEASUREMENT VERIFICATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  E-MB Measurements Awaiting Technical Certification
                </h3>
                <p className="text-xs text-slate-500">Cross-verify quantities against site reality before certifying contractor claims</p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">E-MB No.</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Item Description</th>
                    <th className="p-3">Claimed Qty</th>
                    <th className="p-3">Measured Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {INITIAL_MEASUREMENTS.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{m.embNumber}</td>
                      <td className="p-3 font-semibold">{m.projectCode}</td>
                      <td className="p-3 max-w-xs">{m.itemDescription}</td>
                      <td className="p-3 font-mono">{m.claimedQuantity} {m.unit}</td>
                      <td className="p-3 font-bold font-mono">{m.measuredQuantity} {m.unit}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.verificationStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {m.verificationStatus === 'PENDING' ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleVerifyEmb(m.id, true)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyEmb(m.id, false)}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                            >
                              Return
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION: BILL VERIFICATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Contractor Bills Awaiting Technical Sign-Off
                </h3>
                <p className="text-xs text-slate-500">Only bills backed by verified E-MB records may be passed for payment</p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Invoice Number</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Contractor</th>
                    <th className="p-3">Amount Claimed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Technical Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {INITIAL_INVOICES.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{inv.invoiceNumber}</td>
                      <td className="p-3 font-semibold">{inv.projectCode}</td>
                      <td className="p-3">{inv.contractorName}</td>
                      <td className="p-3 font-mono font-bold">₹{inv.amountClaimed.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'PAYMENT_HELD'
                              ? 'bg-rose-100 text-rose-800'
                              : inv.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {inv.status === 'SUBMITTED' ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleVerifyBill(inv.id, true)}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                            >
                              Pass Bill
                            </button>
                            <button
                              onClick={() => handleVerifyBill(inv.id, false)}
                              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                            >
                              Hold Bill
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">{inv.status}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW: PROJECT MONITORING */}
      {activeView === 'project-monitoring' && (
        <div>
          <PageHeader
            title="Division Project Monitoring"
            subtitle="Technical supervision, physical progress tracking, and execution oversight across division civil works"
            icon={FolderGit2}
            badge={`${divisionProjects.length} Works`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Division Works Monitoring Registry
              </h3>
              <p className="text-xs text-slate-500">Live civil works under PWD Division 2, Nashik jurisdiction</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search works..."
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

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Scheme &amp; Name</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Sanction</th>
                  <th className="p-3">Physical Progress</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{p.code}</td>
                    <td className="p-3 max-w-xs">
                      <span className="font-bold block text-slate-900 dark:text-white">{p.name}</span>
                      <span className="text-[11px] text-slate-500">{p.locationAddress}, {p.constituency}</span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{p.contractorName}</td>
                    <td className="p-3 font-mono font-semibold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                        </div>
                        <span className="font-mono text-[11px]">{p.physicalProgressPercent}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <RiskBadge level={p.riskLevel} score={p.riskScore} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 text-blue-700 dark:text-blue-300 font-semibold text-[11px]"
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

      {/* VIEW: FIELD VERIFICATION & SITE INSPECTIONS */}
      {(activeView === 'field-verification' || activeView === 'site-inspections') && (
        <div>
          <PageHeader
            title="Physical Field Inspections & Site Ground Scrutiny"
            subtitle="Official physical verification records by Executive and Junior Engineers"
            icon={ClipboardCheck}
            badge={`${INITIAL_INSPECTIONS.length} Inspections`}
            actions={
              <button
                onClick={() => setShowInspectionModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>File Site Inspection</span>
              </button>
            }
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Physical Field Inspections &amp; Site Ground Scrutiny
              </h3>
              <p className="text-xs text-slate-500">Official physical verification records by Executive and Junior Engineers</p>
            </div>
            <button
              onClick={() => setShowInspectionModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              File New Site Inspection
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Report #</th>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Inspection Date</th>
                  <th className="p-3">Inspecting Official</th>
                  <th className="p-3">Observed Progress</th>
                  <th className="p-3">Site Observations</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_INSPECTIONS.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{ins.id.toUpperCase()}</td>
                    <td className="p-3 font-semibold">{ins.projectCode}</td>
                    <td className="p-3 text-slate-600">{ins.inspectionDate}</td>
                    <td className="p-3">{ins.inspectorName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{ins.physicalProgressObserved}%</td>
                    <td className="p-3 max-w-xs text-slate-600 dark:text-slate-400">{ins.observations}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ins.qualityRating}
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

      {/* VIEW: TECHNICAL SANCTIONS */}
      {activeView === 'technical-sanctions' && (
        <div>
          <PageHeader
            title="Technical Sanctions (TS) Registry"
            subtitle="Engineering estimates vetted against Maharashtra PWD Schedule of Rates (SoR)"
            icon={FileCheck2}
            badge="Technical Clearance"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Technical Sanctions (TS) Registry
            </h3>
            <p className="text-xs text-slate-500">Engineering estimates vetted against Maharashtra PWD Schedule of Rates (SoR)</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">TS Order Number</th>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Approved Estimate</th>
                  <th className="p-3">Sanctioning Authority</th>
                  <th className="p-3">SoR Revision</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {divisionProjects.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                      TS-PWD-NSK-2024-{100 + idx}
                    </td>
                    <td className="p-3 font-bold">{p.code}</td>
                    <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)} Lakh</td>
                    <td className="p-3 text-slate-600">Superintending Engineer, PWD Circle Nashik</td>
                    <td className="p-3 font-mono text-slate-500">DSR 2024-25 (Rev 2)</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        VETTED &amp; APPROVED
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

      {/* VIEW: WORK ORDERS */}
      {activeView === 'work-orders' && (
        <div>
          <PageHeader
            title="Division Civil Work Orders Registry"
            subtitle="Contract agreements executed with authorized contractors"
            icon={FileText}
            badge={`${INITIAL_WORK_ORDERS.length} Orders`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Division Civil Work Orders Registry
            </h3>
            <p className="text-xs text-slate-500">Contract agreements executed with authorized contractors</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Work Order #</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Contractor Name</th>
                  <th className="p-3">Contract Amount</th>
                  <th className="p-3">Stipulated Period</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_WORK_ORDERS.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{wo.workOrderNumber}</td>
                    <td className="p-3 font-semibold">{wo.projectCode}</td>
                    <td className="p-3">{wo.contractorName}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">₹{(wo.awardedAmount / 100000).toFixed(2)} Lakh</td>
                    <td className="p-3 text-slate-600">{wo.issueDate} to {wo.stipulatedCompletionDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {wo.status}
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

      {/* VIEW: E-MB VERIFICATION (Dedicated) */}
      {activeView === 'emb-verification' && (
        <div>
          <PageHeader
            title="Electronic Measurement Book (E-MB) Certification Desk"
            subtitle="Statutory engineering sign-off on actual physical dimensions taken on ground"
            icon={Ruler}
            badge={pendingEmbCount > 0 ? `${pendingEmbCount} Pending Verification` : 'All Verified'}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Electronic Measurement Book (E-MB) Certification Desk
              </h3>
              <p className="text-xs text-slate-500">Statutory engineering sign-off on actual physical dimensions taken on ground</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold font-mono">
              Pending Verification: {pendingEmbCount}
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">E-MB No.</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Claimed</th>
                  <th className="p-3">Measured</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Certification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_MEASUREMENTS.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold">{m.embNumber}</td>
                    <td className="p-3 font-semibold">{m.projectCode}</td>
                    <td className="p-3 max-w-xs">{m.itemDescription}</td>
                    <td className="p-3 font-mono">{m.claimedQuantity} {m.unit}</td>
                    <td className="p-3 font-bold font-mono text-blue-700">{m.measuredQuantity} {m.unit}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.verificationStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {m.verificationStatus === 'PENDING' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleVerifyEmb(m.id, true)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                          >
                            Verify
                          </button>
                          <button
                            onClick={() => handleVerifyEmb(m.id, false)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                          >
                            Return
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Certified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: BILL VERIFICATION (Dedicated) */}
      {activeView === 'bill-verification' && (
        <div>
          <PageHeader
            title="Running Account (RA) Bill Verification Queue"
            subtitle="Scrutinize contractor bills against verified E-MB quantity before passing to treasury"
            icon={Receipt}
            badge={pendingBillsCount > 0 ? `${pendingBillsCount} Bills Pending` : 'All Cleared'}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Running Account (RA) Bill Verification Queue
              </h3>
              <p className="text-xs text-slate-500">Scrutinize contractor bills against verified E-MB quantity before passing to treasury</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold font-mono">
              Pending Bills: {pendingBillsCount}
            </span>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Claimed Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Technical Sign-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold">{inv.invoiceNumber}</td>
                    <td className="p-3 font-semibold">{inv.projectCode}</td>
                    <td className="p-3">{inv.contractorName}</td>
                    <td className="p-3 font-mono font-bold">₹{inv.amountClaimed.toLocaleString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'PAYMENT_HELD'
                            ? 'bg-rose-100 text-rose-800'
                            : inv.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {inv.status === 'SUBMITTED' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handleVerifyBill(inv.id, true)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px]"
                          >
                            Pass Bill
                          </button>
                          <button
                            onClick={() => handleVerifyBill(inv.id, false)}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                          >
                            Hold Bill
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">{inv.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: MATERIAL TEST CERTIFICATES */}
      {activeView === 'certificates' && (
        <div>
          <PageHeader
            title="NABL Material Quality Test Certificates Registry"
            subtitle="Independent laboratory test verification for structural safety compliance"
            icon={FileBadge}
            badge={`${INITIAL_MATERIAL_CERTIFICATES.length} Certificates`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              NABL Material Quality Test Certificates Registry
            </h3>
            <p className="text-xs text-slate-500">Independent laboratory test verification for structural safety compliance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_MATERIAL_CERTIFICATES.map((cert) => (
              <div key={cert.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300">Batch: {cert.sampleBatchNo}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {cert.testResult}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{cert.materialType}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-2">{cert.remarks || 'Standard BIS/NABL Parameter compliance verified'}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Testing Lab: {cert.testLabName}</span>
                  <span>Test Date: {cert.testDate}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: PHYSICAL PROGRESS */}
      {activeView === 'physical-progress' && (
        <div>
          <PageHeader
            title="Physical Progress Milestones Analysis"
            subtitle="Stage-by-stage engineering completion curves and ground verification"
            icon={TrendingUp}
            badge="Progress Tracker"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Physical Progress Milestones Analysis
            </h3>
            <p className="text-xs text-slate-500">Stage-by-stage engineering completion curves</p>
          </div>

          <div className="space-y-4">
            {divisionProjects.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{p.code}</span>
                    <span className="font-bold text-sm ml-2 text-slate-900 dark:text-white">{p.name}</span>
                  </div>
                  <span className="font-bold text-blue-700 dark:text-blue-400">{p.physicalProgressPercent}% Measured Physical</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                  <span>Contractor: {p.contractorName}</span>
                  <span>Target Date: {p.expectedCompletionDate}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: FINANCIAL PROGRESS */}
      {activeView === 'financial-progress' && (
        <div>
          <PageHeader
            title="Financial Progress & Expenditure Scrutiny"
            subtitle="Comparison of funds cleared vs physical milestone achievements"
            icon={Coins}
            badge="Financial Audit"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Financial Expenditure &amp; Disbursement Scrutiny
            </h3>
            <p className="text-xs text-slate-500">Comparison of funds cleared vs physical milestone achievements</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Sanction Amount</th>
                  <th className="p-3">Disbursed Expenditure</th>
                  <th className="p-3">% Financial</th>
                  <th className="p-3">% Physical</th>
                  <th className="p-3">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {divisionProjects.map((p) => {
                  const finPercent = Math.round((p.expenditure / p.sanctionAmount) * 100);
                  const variance = finPercent - p.physicalProgressPercent;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-blue-700">{p.code}</td>
                      <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                      <td className="p-3 font-mono text-emerald-600">₹{(p.expenditure / 100000).toFixed(2)}L</td>
                      <td className="p-3 font-mono font-semibold">{finPercent}%</td>
                      <td className="p-3 font-mono font-semibold">{p.physicalProgressPercent}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          variance > 25 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {variance > 0 ? `+${variance}% Mismatch` : `${variance}% OK`}
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

      {/* VIEW: CONTRACTOR PERFORMANCE */}
      {activeView === 'contractor-perf' && (
        <div>
          <PageHeader
            title="Division Contractor Performance & Quality Track"
            subtitle="Contractor delivery history, delay tracking, and lab failure records"
            icon={Users}
            badge="Vendor Ratings"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Division Contractor Performance &amp; Quality Track
            </h3>
            <p className="text-xs text-slate-500">Contractor delivery history, delay tracking, and lab failure records</p>
          </div>

          <div className="space-y-3 text-xs">
            {['Patil Infrastructure & Works Pvt Ltd', 'Nashik Roadlines & Civil Projects', 'Deshmukh Developers & Earthmovers'].map((v, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{v}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    PWD Class A Contractor
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Active Works:</span>
                    <span className="font-bold">2 Projects</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Lab Test Compliance:</span>
                    <span className="font-bold text-emerald-600">100% Passed</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Delivery Timeliness:</span>
                    <span className="font-bold">88% on-schedule</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: AI RISK ALERTS & ANOMALY ALERTS */}
      {(activeView === 'ai-risk-alerts' || activeView === 'anomaly-alerts') && (
        <div>
          <PageHeader
            title="AI Risk & Anomaly Detection Registry"
            subtitle="Explainable AI flags requiring mandatory technical inspection by PWD"
            icon={ShieldAlert}
            badge={`${highRiskAlerts.length} Critical Alerts`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Risk &amp; Anomaly Detection Registry
            </h3>
            <p className="text-xs text-slate-500">Explainable AI flags requiring mandatory technical inspection by PWD</p>
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
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{alert.projectCode}</span>
                    <RiskBadge level={alert.riskLevel} score={alert.riskScore} />
                  </div>
                  <span className="text-slate-400 text-[11px]">{alert.dateDetected}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{alert.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">{alert.description}</p>
                <div className="mt-2 text-blue-600 dark:text-blue-400 font-semibold text-[11px]">
                  Click to inspect algorithmic factors &amp; enter verification feedback
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: EVIDENCE REPOSITORY */}
      {activeView === 'evidence' && (
        <div>
          <PageHeader
            title="Photographic Evidence & Site Geo-Database"
            subtitle="Time-stamped and coordinate-verified photographic logs from site inspections"
            icon={Camera}
            badge={`${INITIAL_SITE_EVIDENCE.length} Geo-Photos`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Photographic Evidence &amp; Site Geo-Database
            </h3>
            <p className="text-xs text-slate-500">Time-stamped and coordinate-verified photographic logs</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {INITIAL_SITE_EVIDENCE.map((ev) => (
              <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 text-xs">
                <div className="h-32 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 relative">
                  <Camera className="w-8 h-8 opacity-40" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                    {ev.geoCoordinates.lat.toFixed(4)}° N, {ev.geoCoordinates.lng.toFixed(4)}° E
                  </span>
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold">{ev.projectCode}</span>
                    <span className="text-[10px] text-slate-400">{ev.uploadDate}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {ev.stage}
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
            title="Division Technical Reports & Certification Dossiers"
            subtitle="Statutory Monthly Progress Reports (MPR) and technical audit certificates"
            icon={ClipboardList}
            badge="Official Reports"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Division Technical Reports &amp; Certification Dossiers
            </h3>
            <p className="text-xs text-slate-500">Statutory Monthly Progress Reports (MPR) and technical audit certificates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Monthly Technical Progress Report (MPR)</h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-3">
                Complete division compilation of physical completion, E-MBs checked, and pending running bills.
              </p>
              <button
                onClick={() => addToast('success', 'Report Generated', 'Division MPR exported for submission to District Collector.')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Generate Division MPR
              </button>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Anomaly Ground Verification Dossier</h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-3">
                Consolidated engineer remarks on P102 physical mismatch and spatial survey coordinates.
              </p>
              <button
                onClick={() => addToast('success', 'Dossier Downloaded', 'Technical verification findings saved.')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Verification Pack
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
            title="Official Technical Alerts & Departmental Circulars"
            subtitle="Communications from District Magistrate and Superintending Engineer"
            icon={Bell}
            badge="Circulars & Notices"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Technical Alerts &amp; Departmental Circulars
            </h3>
            <p className="text-xs text-slate-500">Communications from District Magistrate and Superintending Engineer</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-900 dark:text-rose-200">Urgent: District Collector Inquiry Directive on P102</span>
                <span className="text-[10px] text-slate-400">10:30 AM</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Collectorate directive DM/NSK/INQ/2026/015 issued. Executive Engineer instructed to carry out joint cadastral measurement of Niphad Community Hall within 14 days.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-900 dark:text-blue-200">RA Bill Submitted: INV-PATIL-2024-099</span>
                <span className="text-[10px] text-slate-400">Yesterday</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Contractor has submitted 2nd running account bill for ₹16,20,000 against verified E-MB 2024-041. Scrutiny pending.
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
            title="Executive Engineer Technical Profile"
            subtitle="Government credentials and statutory digital signature profile"
            icon={User}
            badge="Verified Official"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Executive Engineer Technical Profile
            </h3>
            <p className="text-xs text-slate-500">Government credentials and statutory digital signature profile</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Officer Name:</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{user?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Designation:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Executive Engineer (Civil)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Jurisdiction:</span>
                  <span className="font-bold text-slate-900 dark:text-white">PWD Division 2, Nashik District</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Digital Token Status:</span>
                  <span className="font-bold text-emerald-600">Active (Class 3 DSC Valid till 2027)</span>
                </div>
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

      {showInspectionModal && (
        <ScheduleInspectionModal onClose={() => setShowInspectionModal(false)} />
      )}
    </div>
  );
};
