import React, { useState } from 'react';
import { Project, RiskLevel } from '../../types';
import { INITIAL_PROJECTS, INITIAL_WORK_ORDERS, INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_MEASUREMENTS, INITIAL_INSPECTIONS, INITIAL_SITE_EVIDENCE, INITIAL_MATERIAL_CERTIFICATES } from '../../server/db';
import { RiskBadge } from '../common/RiskBadge';
import { evaluateProjectRisk } from '../../server/aiEngine';
import {
  X,
  Building2,
  Calendar,
  CreditCard,
  Ruler,
  Camera,
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  FileCheck,
  ChevronRight,
  User,
  Eye,
  Download,
} from 'lucide-react';

interface ProjectDetailModalProps {
  projectId: string;
  onClose: () => void;
  onOpenAlert?: (alertId: string) => void;
  onOpenEvidencePack?: (projectId: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  projectId,
  onClose,
  onOpenAlert,
  onOpenEvidencePack,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'financials' | 'traceability' | 'measurements' | 'invoices' | 'inspections' | 'ai-risk'
  >('overview');

  const project =
    INITIAL_PROJECTS.find((p) => p.id === projectId || p.code === projectId) || INITIAL_PROJECTS[1];
  const aiAnalysis = evaluateProjectRisk(project, INITIAL_PROJECTS);

  const workOrders = INITIAL_WORK_ORDERS.filter((w) => w.projectId === project.id);
  const invoices = INITIAL_INVOICES.filter((i) => i.projectId === project.id);
  const payments = INITIAL_PAYMENTS.filter((p) => p.projectId === project.id);
  const measurements = INITIAL_MEASUREMENTS.filter((m) => m.projectId === project.id);
  const inspections = INITIAL_INSPECTIONS.filter((i) => i.projectId === project.id);
  const evidence = INITIAL_SITE_EVIDENCE.filter((e) => e.projectId === project.id);
  const certificates = INITIAL_MATERIAL_CERTIFICATES.filter((c) => c.projectId === project.id);

  const formatLakhs = (val: number) => `₹${(val / 100000).toFixed(2)} Lakh`;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {project.code}
              </span>
              <RiskBadge level={project.riskLevel} score={project.riskScore} />
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {project.category}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {project.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{project.locationAddress} • Constituency: {project.constituency} ({project.mpName})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 touch-manipulation"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-1 overflow-x-auto text-xs font-medium custom-scrollbar">
          {[
            { id: 'overview', label: '1. Overview & Timeline' },
            { id: 'financials', label: '2. Financial Details' },
            { id: 'traceability', label: '3. Traceability Chain' },
            { id: 'measurements', label: '4. E-MB Measurements' },
            { id: 'invoices', label: '5. Bills & Payments' },
            { id: 'inspections', label: '6. Site Inspections & Evidence' },
            { id: 'ai-risk', label: '7. AI Risk Engine & Disprove' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-3 border-b-2 transition-colors whitespace-nowrap touch-manipulation ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & TIMELINE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Sanction Amount</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatLakhs(project.sanctionAmount)}
                  </div>
                  <span className="text-[10px] text-slate-500">{project.administrativeSanctionNo}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Expenditure</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {formatLakhs(project.expenditure)}
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    {project.financialProgressPercent}% utilized
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Physical Progress</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {project.physicalProgressPercent}%
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${project.physicalProgressPercent}%` }}
                    />
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Delay Metric</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {project.delayDays > 0 ? `${project.delayDays} Days` : 'On Schedule'}
                  </div>
                  <span className="text-[10px] text-rose-500 font-medium">
                    {project.delayDays > 0 ? 'Overdue deadline' : 'Milestone aligned'}
                  </span>
                </div>
              </div>

              {/* Description & Stakeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Project Scope &amp; Details
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Technical Sanction:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">{project.technicalSanctionNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Awarded Contractor:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{project.contractorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Supervising Engineer:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{project.executiveEngineer}</span>
                    </div>
                  </div>
                </div>

                {/* 12-Step Lifecycle Timeline */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Project Lifecycle Progression
                  </h4>
                  <div className="space-y-2 text-xs">
                    {[
                      { step: '1. Administrative Sanction', date: project.sanctionDate, done: true },
                      { step: '2. Technical Sanction', date: project.startDate, done: true },
                      { step: '3. Tender & Work Order', date: workOrders[0]?.issueDate || 'Done', done: true },
                      { step: '4. Physical Execution', date: `In Progress (${project.physicalProgressPercent}%)`, done: true },
                      { step: '5. E-MB Measurement Verification', date: measurements.length > 0 ? `${measurements.length} logged` : 'Pending', done: measurements.length > 0 },
                      { step: '6. Field Inspection & Geo-tagging', date: project.lastInspectionDate || 'Scheduled', done: !!project.lastInspectionDate },
                      { step: '7. Final Completion Certificate', date: project.expectedCompletionDate, done: project.status === 'COMPLETED' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${item.done ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className={item.done ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>
                            {item.step}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4">
                  Fund Disbursement Breakdown &amp; Balance
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Gross Administrative Sanction:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      ₹{project.sanctionAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Contract Awarded Value:</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      ₹{project.contractAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Total Funds Disbursed via PFMS:</span>
                    <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                      ₹{project.expenditure.toLocaleString()} ({project.financialProgressPercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 font-bold text-emerald-600">
                    <span>Available Balance:</span>
                    <span className="font-mono">₹{project.balanceAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Records Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  PFMS Treasury Transactions
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                  <table className="w-full text-left min-w-[640px]">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                      <tr>
                        <th className="p-2.5">Voucher Reference</th>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Mode</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Bank Transaction UTR</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="p-2.5 font-mono">{p.paymentRefNumber}</td>
                          <td className="p-2.5 text-slate-500">{p.paymentDate}</td>
                          <td className="p-2.5">{p.paymentMode}</td>
                          <td className="p-2.5 font-bold font-mono">₹{p.amount.toLocaleString()}</td>
                          <td className="p-2.5 font-mono text-[10px] text-slate-400">{p.bankTransactionId}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {payments.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-400">
                            No payment vouchers recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRACEABILITY CHAIN */}
          {activeTab === 'traceability' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Visual Financial Traceability Graph
                  </h4>
                  <span className="text-[10px] text-slate-400">End-to-End Audit Money Trail</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 w-full">
                    <span className="text-[10px] text-slate-400 block">1. SANCTION</span>
                    <div className="font-bold text-white mt-1">{formatLakhs(project.sanctionAmount)}</div>
                    <span className="text-[9px] text-slate-400 font-mono">AS/NSK/2024</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 md:rotate-0" />
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 w-full">
                    <span className="text-[10px] text-slate-400 block">2. WORK ORDER</span>
                    <div className="font-bold text-white mt-1">{formatLakhs(project.contractAmount)}</div>
                    <span className="text-[9px] text-slate-400 font-mono">{workOrders[0]?.workOrderNumber || 'WO-102'}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 md:rotate-0" />
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 w-full">
                    <span className="text-[10px] text-slate-400 block">3. INVOICE BILLS</span>
                    <div className="font-bold text-white mt-1">{formatLakhs(project.expenditure)}</div>
                    <span className="text-[9px] text-slate-400">{invoices.length} Bills Raised</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 md:rotate-0" />
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 w-full">
                    <span className="text-[10px] text-slate-400 block">4. E-MB ENTRY</span>
                    <div className="font-bold text-white mt-1">EMB-PWD</div>
                    <span className="text-[9px] text-slate-400">Measured Work</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-500 shrink-0 rotate-90 md:rotate-0" />
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 w-full">
                    <span className="text-[10px] text-slate-400 block">5. PFMS DISBURSEMENT</span>
                    <div className="font-bold text-emerald-400 mt-1">{formatLakhs(project.expenditure)}</div>
                    <span className="text-[9px] text-slate-400">Treasury Cleared</span>
                  </div>
                </div>
              </div>

              {project.riskScore > 60 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs">
                  <div className="flex items-center gap-2 font-bold mb-1 text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Audit Exception Detected in Traceability Chain
                  </div>
                  <p className="leading-relaxed">
                    While Step 5 (Disbursement) reflects 92% fund transfer, Step 4 (E-MB Physical Measurement) recorded an exception on Item 2 (Structural Steel Truss). 9.3 tonnes of steel claimed on Invoice #INV-PATIL-2025-099 was not verified by the field inspection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MEASUREMENTS */}
          {activeTab === 'measurements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Electronic Measurement Book (E-MB) Records
                </h4>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2.5">E-MB No.</th>
                      <th className="p-2.5">Description</th>
                      <th className="p-2.5">Claimed Qty</th>
                      <th className="p-2.5">Measured Qty</th>
                      <th className="p-2.5">Claimed Amount</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {measurements.map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 font-mono font-bold">{m.embNumber}</td>
                        <td className="p-2.5 max-w-xs">{m.itemDescription}</td>
                        <td className="p-2.5">{m.claimedQuantity} {m.unit}</td>
                        <td className="p-2.5 font-bold">{m.measuredQuantity} {m.unit}</td>
                        <td className="p-2.5 font-mono">₹{m.totalClaimedAmount.toLocaleString()}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {m.verificationStatus}
                          </span>
                        </td>
                        <td className="p-2.5 text-[11px] text-slate-500">{m.engineerRemarks || '—'}</td>
                      </tr>
                    ))}
                    {measurements.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-slate-400">
                          No E-MB measurements recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Submitted Bills &amp; Contractor Invoices
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
                <table className="w-full text-left min-w-[650px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-2.5">Invoice #</th>
                      <th className="p-2.5">Bill Date</th>
                      <th className="p-2.5">Amount Claimed</th>
                      <th className="p-2.5">Amount Approved</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Reason / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="p-2.5 font-mono font-bold">{inv.invoiceNumber}</td>
                        <td className="p-2.5 text-slate-500">{inv.billDate}</td>
                        <td className="p-2.5 font-mono font-bold">₹{inv.amountClaimed.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-emerald-600">
                          {inv.amountApproved ? `₹${inv.amountApproved.toLocaleString()}` : '—'}
                        </td>
                        <td className="p-2.5">
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
                        <td className="p-2.5 text-[11px] text-slate-500">{inv.returnedReason || 'Normal RA Bill'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: INSPECTIONS & EVIDENCE */}
          {activeTab === 'inspections' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  PWD Field Inspection Reports
                </h4>
                {inspections.map((insp) => (
                  <div key={insp.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 mb-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{insp.inspectorName} ({insp.inspectorRole})</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                          Rating: {insp.qualityRating}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono">{insp.inspectionDate}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{insp.observations}</p>
                    {insp.correctiveActionsRequired && (
                      <p className="text-rose-700 dark:text-rose-400 font-medium">
                        Corrective Action: {insp.correctiveActionsRequired}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      Geo-tag: {insp.geoTag.lat.toFixed(4)}, {insp.geoTag.lng.toFixed(4)} (Accuracy: {insp.geoTag.accuracyMeters}m)
                    </div>
                  </div>
                ))}
              </div>

              {/* Site Photos */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Geo-Tagged Photographic Evidence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evidence.map((ev) => (
                    <div key={ev.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <img
                        src={ev.photoUrl}
                        alt={ev.title}
                        className="w-full h-40 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="p-3 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">{ev.title}</div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ev.description}</p>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Stage: {ev.stage}</span>
                          <span>Verified by PWD EE</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: AI RISK ENGINE & DISPROVE */}
          {activeTab === 'ai-risk' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-bold text-amber-400">
                    AnomalyX Explainable AI Breakdown
                  </span>
                  <RiskBadge level={aiAnalysis.riskLevel} score={aiAnalysis.riskScore} />
                </div>
                <p className="text-xs text-slate-300 mb-4">
                  Governing Rule: AI results act as early-warning risk indicators to prioritize human review.
                </p>

                <div className="space-y-2 text-xs">
                  {aiAnalysis.contributingFactors.map((f, i) => (
                    <div key={i} className="flex items-start justify-between p-2.5 rounded bg-slate-800/80 border border-slate-700">
                      <div>
                        <div className="font-semibold text-white">{f.factor}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{f.details}</div>
                      </div>
                      <span className="font-mono font-bold text-amber-400 shrink-0 ml-3">
                        +{f.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What would disprove this alert? (Auditor-friendly explainability) */}
              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-900 dark:text-sky-200">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  What Would Disprove This Alert? (Auditor Verification Criteria)
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  To eliminate false positives and prevent wrongful enforcement, the alert is resolved if the following objective evidence is produced:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                  {aiAnalysis.whatWouldDisproveThisAlert.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onOpenEvidencePack?.(project.id)}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Generate Consolidated Evidence Pack
                </button>
                {project.riskScore > 60 && (
                  <button
                    onClick={() => onOpenAlert?.('alt-102-crit')}
                    className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Open Human Review Panel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
