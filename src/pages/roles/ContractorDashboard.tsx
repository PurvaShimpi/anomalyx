import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_PROJECTS, INITIAL_WORK_ORDERS, INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_MEASUREMENTS, INITIAL_SITE_EVIDENCE, INITIAL_MATERIAL_CERTIFICATES, db } from '../../server/db';
import { MetricCard } from '../../components/common/MetricCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ProjectDetailModal } from '../../components/modals/ProjectDetailModal';
import { NewInvoiceModal, UploadEvidenceModal } from '../../components/modals/ActionModals';
import { PageHeader } from '../../components/common/PageHeader';
import {
  FolderGit2,
  FileCheck2,
  Receipt,
  CreditCard,
  Ruler,
  Camera,
  Plus,
  TrendingUp,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  FileBadge,
  Bell,
  User,
} from 'lucide-react';

export const ContractorDashboard: React.FC = () => {
  const { user, activeView, setActiveView } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Contractor-specific data filter (only their assigned works!)
  const myProjects = INITIAL_PROJECTS.filter((p) => p.contractorName.includes('Patil'));
  const myProjectIds = myProjects.map((p) => p.id);

  const myWorkOrders = INITIAL_WORK_ORDERS.filter((w) => myProjectIds.includes(w.projectId));
  const myInvoices = INITIAL_INVOICES.filter((i) => myProjectIds.includes(i.projectId));
  const myPayments = INITIAL_PAYMENTS.filter((p) => myProjectIds.includes(p.projectId));
  const myMeasurements = INITIAL_MEASUREMENTS.filter((m) => myProjectIds.includes(m.projectId));
  const myEvidence = INITIAL_SITE_EVIDENCE.filter((e) => myProjectIds.includes(e.projectId));
  const myCertificates = INITIAL_MATERIAL_CERTIFICATES.filter((c) => myProjectIds.includes(c.projectId));

  const totalContractVal = myProjects.reduce((sum, p) => sum + p.contractAmount, 0);
  const totalDisbursed = myProjects.reduce((sum, p) => sum + p.expenditure, 0);
  const pendingBillsCount = myInvoices.filter((i) => i.status === 'SUBMITTED').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions - Shown only on Dashboard Overview */}
      {(activeView === 'dashboard' || !activeView) && (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  Contractor Workspace
                </span>
                <span className="text-xs text-slate-400 font-mono">GSTIN: 27AABCP8841M1ZM</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {user?.fullName} – Awarded Works Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your awarded MPLADS projects, submit RA invoices, log E-MB entries, and upload geo-tagged photo evidence.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Bill (RA)</span>
              </button>
              <button
                onClick={() => setShowEvidenceModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Upload Evidence</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Awarded Projects"
              value={myProjects.length}
              subtext="Active civil contracts"
              icon={FolderGit2}
              variant="default"
            />
            <MetricCard
              title="Total Contract Value"
              value={`₹${(totalContractVal / 100000).toFixed(2)}L`}
              subtext="Awarded tender values"
              icon={FileCheck2}
              variant="info"
            />
            <MetricCard
              title="Total Payments Received"
              value={`₹${(totalDisbursed / 100000).toFixed(2)}L`}
              subtext="Treasury cleared vouchers"
              icon={CreditCard}
              variant="success"
            />
            <MetricCard
              title="Bills Under Verification"
              value={pendingBillsCount}
              subtext="Pending PWD EE sign-off"
              icon={Receipt}
              variant={pendingBillsCount > 0 ? 'warning' : 'default'}
            />
          </div>
        </>
      )}

      {/* Main Content Area based on sidebar or tabs */}
      <div className="space-y-6">
        {/* SECTION: MY PROJECTS */}
        {(activeView === 'dashboard' || activeView === 'my-projects' || !activeView) && (
          <div>
            {activeView === 'my-projects' && (
              <PageHeader
                title="My Awarded Projects"
                subtitle="Civil engineering contracts officially assigned to your registered firm"
                icon={FolderGit2}
                badge={`${myProjects.length} Works`}
              />
            )}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeView === 'my-projects' ? 'Active Projects Directory' : 'My Awarded Projects Overview'}
                  </h3>
                  <p className="text-xs text-slate-500">Works officially assigned to your registered company</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                          {p.code}
                        </span>
                        <RiskBadge level={p.riskLevel} score={p.riskScore} />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 font-mono">
                        ₹{(p.contractAmount / 100000).toFixed(2)}L
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">
                      {p.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {p.description}
                    </p>

                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-500">Physical Progress:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{p.physicalProgressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Supervising EE: {p.executiveEngineer}</span>
                        <span>Target: {p.expectedCompletionDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: E-MB MEASUREMENTS */}
        {(activeView === 'dashboard' || activeView === 'measurements') && (
          <div>
            {activeView === 'measurements' && (
              <PageHeader
                title="Electronic Measurement Book (E-MB) Log"
                subtitle="Official site measurements entered for engineering scrutiny and billing approval"
                icon={Ruler}
                badge="Statutory E-MB"
              />
            )}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeView === 'measurements' ? 'E-MB Entries & Measurement Verification' : 'Recent E-MB Measurement Entries'}
                  </h3>
                  <p className="text-xs text-slate-500">Official site measurements entered for billing approval</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                <table className="w-full text-left min-w-[650px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">E-MB Reference</th>
                      <th className="p-3">Project</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Claimed Qty</th>
                      <th className="p-3">Measured Qty</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myMeasurements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold">{m.embNumber}</td>
                        <td className="p-3 font-semibold">{m.projectCode}</td>
                        <td className="p-3">{m.itemDescription}</td>
                        <td className="p-3">{m.claimedQuantity} {m.unit}</td>
                        <td className="p-3 font-bold">{m.measuredQuantity} {m.unit}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.verificationStatus}
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

        {/* SECTION: BILLS & INVOICES */}
        {(activeView === 'dashboard' || activeView === 'invoices') && (
          <div>
            {activeView === 'invoices' && (
              <PageHeader
                title="Running Account (RA) Bills & Invoices"
                subtitle="Track contractor claims, departmental approvals, and treasury disbursement vouchers"
                icon={Receipt}
                badge={`${myInvoices.length} Bills`}
                actions={
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit New Bill</span>
                  </button>
                }
              />
            )}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Running Account (RA) Bills &amp; Payment Status
                  </h3>
                  <p className="text-xs text-slate-500">Track claim submissions and treasury payment releases</p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Submit New Bill
                </button>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                <table className="w-full text-left min-w-[650px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Project</th>
                      <th className="p-3">Claim Date</th>
                      <th className="p-3">Amount Claimed</th>
                      <th className="p-3">Amount Approved</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold">{inv.invoiceNumber}</td>
                        <td className="p-3 font-semibold">{inv.projectCode}</td>
                        <td className="p-3 text-slate-500">{inv.billDate}</td>
                        <td className="p-3 font-mono font-bold">₹{inv.amountClaimed.toLocaleString()}</td>
                        <td className="p-3 font-mono text-emerald-600">
                          {inv.amountApproved ? `₹${inv.amountApproved.toLocaleString()}` : '—'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'PAYMENT_HELD'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inv.status}
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

        {/* SECTION: AWARDED WORK ORDERS */}
        {(activeView === 'work-orders') && (
          <div>
            <PageHeader
              title="Awarded Work Orders (Official Agreements)"
              subtitle="Formal PWD contracts issued under approved MPLADS administrative sanctions"
              icon={FileCheck2}
              badge={`${myWorkOrders.length} Orders`}
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Awarded Work Orders &amp; Executed Agreements
                  </h3>
                  <p className="text-xs text-slate-500">Formal PWD contracts issued under approved MPLADS administrative sanctions</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">Work Order #</th>
                      <th className="p-3">Project Code &amp; Scope</th>
                      <th className="p-3">Agreement Date</th>
                      <th className="p-3">Stipulated Completion</th>
                      <th className="p-3">Contract Value</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myWorkOrders.map((wo) => (
                      <tr key={wo.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{wo.workOrderNumber}</td>
                        <td className="p-3">
                          <span className="font-bold block">{wo.projectCode}</span>
                          <span className="text-[11px] text-slate-500">{wo.scopeOfWork}</span>
                        </td>
                        <td className="p-3 text-slate-600">{wo.issueDate}</td>
                        <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{wo.stipulatedCompletionDate}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600">₹{(wo.awardedAmount / 100000).toFixed(2)} Lakh</td>
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

        {/* SECTION: MATERIAL TEST CERTIFICATES */}
        {(activeView === 'certificates') && (
          <div>
            <PageHeader
              title="Material Test & Quality Certificates"
              subtitle="NABL accredited lab quality certificates submitted for technical approval"
              icon={FileBadge}
              badge={`${myCertificates.length} Certificates`}
              actions={
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Test Certificate</span>
                </button>
              }
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Material Test &amp; Quality Certificates
                  </h3>
                  <p className="text-xs text-slate-500">NABL accredited lab quality certificates submitted for technical approval</p>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Upload Test Certificate
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCertificates.map((cert) => (
                  <div key={cert.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-blue-800 dark:text-blue-300">Batch: {cert.sampleBatchNo}</span>
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

        {/* SECTION: SITE EVIDENCE & GEO-TAGGED PHOTOS */}
        {(activeView === 'site-evidence') && (
          <div>
            <PageHeader
              title="Geo-Tagged Photographic Evidence"
              subtitle="Tamper-evident timestamped photos from project sites required for stage verification"
              icon={Camera}
              badge={`${myEvidence.length} Photos`}
              actions={
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Upload New Photo</span>
                </button>
              }
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Geo-Tagged Photographic Evidence
                  </h3>
                  <p className="text-xs text-slate-500">Tamper-evident timestamped photos from project sites</p>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Upload New Photo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myEvidence.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 text-xs">
                    <div className="h-36 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 relative">
                      <Camera className="w-8 h-8 opacity-40" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                        {ev.geoCoordinates.lat.toFixed(4)}° N, {ev.geoCoordinates.lng.toFixed(4)}° E
                      </span>
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{ev.projectCode}</span>
                        <span className="text-[10px] text-slate-400">{ev.uploadDate}</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Stage: {ev.stage}
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-2 line-clamp-2">
                        {ev.description || ev.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: WORK PROGRESS */}
        {(activeView === 'work-progress') && (
          <div>
            <PageHeader
              title="Physical Execution Progress & Milestones"
              subtitle="Live progress tracking against stipulated contractual milestones"
              icon={TrendingUp}
              badge="Execution Milestones"
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Physical Execution Progress &amp; Milestone Track
                  </h3>
                  <p className="text-xs text-slate-500">Live progress tracking against stipulated contractual milestones</p>
                </div>
              </div>

              <div className="space-y-4">
                {myProjects.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{p.code}</span>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">Target Completion: {p.expectedCompletionDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600">{p.physicalProgressPercent}% Completed</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mb-3">
                      <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${p.physicalProgressPercent}%` }} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Sanctioned:</span>
                        <span className="font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Contract:</span>
                        <span className="font-bold">₹{(p.contractAmount / 100000).toFixed(2)}L</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Disbursed:</span>
                        <span className="font-bold text-emerald-600">₹{(p.expenditure / 100000).toFixed(2)}L</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Supervising EE:</span>
                        <span className="font-bold">{p.executiveEngineer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: PAYMENTS */}
        {(activeView === 'payments') && (
          <div>
            <PageHeader
              title="Treasury PFMS Payment Disbursements"
              subtitle="Direct treasury electronic fund transfers credited to registered vendor bank account"
              icon={CreditCard}
              badge={`${myPayments.length} Vouchers`}
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Treasury PFMS Payment Disbursements
                  </h3>
                  <p className="text-xs text-slate-500">Direct treasury transfers credited to registered vendor bank account</p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">Voucher #</th>
                      <th className="p-3">PFMS UTR Number</th>
                      <th className="p-3">Disbursement Date</th>
                      <th className="p-3">Amount Cleared</th>
                      <th className="p-3">Beneficiary Bank</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {myPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-blue-700 dark:text-blue-400">{pay.paymentRefNumber}</td>
                        <td className="p-3 font-mono font-semibold">{pay.bankTransactionId || 'MAHB24061298411'}</td>
                        <td className="p-3 text-slate-600">{pay.paymentDate}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600">₹{pay.amount.toLocaleString()}</td>
                        <td className="p-3 text-slate-600">{pay.paymentMode}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {pay.status}
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

        {/* SECTION: NOTIFICATIONS */}
        {(activeView === 'notifications') && (
          <div>
            <PageHeader
              title="Official Department Notifications & Circulars"
              subtitle="Notices and inspection schedules from Executive Engineer (PWD) and District Planning Office"
              icon={Bell}
              badge="Official Circulars"
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Department Notifications &amp; Circulars
                </h3>
                <p className="text-xs text-slate-500">Notices from Executive Engineer (PWD) and District Planning Office</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-900 dark:text-blue-200">E-MB Verification Scheduled for P102</span>
                    <span className="text-[10px] text-slate-400">Today, 10:30 AM</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Executive Engineer Shri R. K. Sonawane has certified E-MB-2024-041. Running Account bill is forwarded for financial scrutiny.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-900 dark:text-amber-200">Mandatory NABL Cube Test Submission</span>
                    <span className="text-[10px] text-slate-400">Yesterday</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Contractors are required to upload 28-day concrete compressive test reports before submission of 2nd RA bill.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: HELP & GUIDELINES */}
        {(activeView === 'help') && (
          <div>
            <PageHeader
              title="Contractor Operating Guidelines & Protocol Manual"
              subtitle="Statutory MPLADS compliance requirements for executing civil contracts"
              icon={HelpCircle}
              badge="Compliance Manual"
            />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Contractor Operating Guidelines &amp; Protocol Manual
                </h3>
                <p className="text-xs text-slate-500">Statutory MPLADS compliance requirements for executing civil contracts</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">1. Electronic Measurement Book (E-MB) Protocol</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    All site measurements must be recorded digitally with geo-coordinates. The Supervising Junior Engineer and Executive Engineer will physically verify dimensions prior to bill preparation.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">2. Running Account (RA) Bill Checklist</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ensure the bill contains: Verified E-MB page reference, NABL Material Test Certificate, geo-tagged photos of current construction stage, and GST compliance tax invoice.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">3. Helpdesk &amp; Technical Grievances</h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    For technical billing or portal queries, contact the District Planning Cell, Collectorate Nashik at mplads.support@mah.gov.in or 0253-2578900.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
        />
      )}

      {/* Quick Action Modals */}
      {showInvoiceModal && (
        <NewInvoiceModal onClose={() => setShowInvoiceModal(false)} />
      )}
      {showEvidenceModal && (
        <UploadEvidenceModal onClose={() => setShowEvidenceModal(false)} />
      )}
    </div>
  );
};
