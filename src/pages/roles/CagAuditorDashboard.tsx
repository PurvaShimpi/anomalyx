import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_PROJECTS,
  INITIAL_AI_ALERTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_MEASUREMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SITE_EVIDENCE,
  db,
} from '../../server/db';
import { MetricCard } from '../../components/common/MetricCard';
import { RiskBadge } from '../../components/common/RiskBadge';
import { ProjectDetailModal } from '../../components/modals/ProjectDetailModal';
import { AlertDetailModal } from '../../components/modals/AlertDetailModal';
import { EvidencePackModal } from '../../components/modals/EvidencePackModal';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Scale,
  GitBranch,
  Layers,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  Download,
  CheckCircle2,
  Terminal,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Search,
  CreditCard,
  Users,
  History,
  FolderArchive,
  ClipboardList,
  Bell,
  User,
  Plus,
} from 'lucide-react';

export const CagAuditorDashboard: React.FC = () => {
  const { user, activeView, addToast } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [evidencePackProjectId, setEvidencePackProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const auditProjects = INITIAL_PROJECTS;
  const auditCases = db.auditCases;
  const auditLogs = INITIAL_AUDIT_LOGS;

  // Project P102 & P108 for Duplicate Works deep-dive
  const p102 = INITIAL_PROJECTS.find((p) => p.code === 'P102') || INITIAL_PROJECTS[1];
  const p108 = INITIAL_PROJECTS.find((p) => p.code === 'P108') || INITIAL_PROJECTS[4];

  return (
    <div className="space-y-6">
      {/* VIEW: DASHBOARD (Overview) */}
      {(activeView === 'dashboard' || !activeView) && (
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300">
                  Constitutional Audit Authority
                </span>
                <span className="text-xs text-slate-400 font-mono">Comptroller &amp; Auditor General of India</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {user?.fullName} – Audit &amp; Forensic Traceability Portal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Conduct end-to-end money trail tracing, inspect AI duplicate work anomalies, analyze payment-progress mismatches, and export consolidated evidence dossiers.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setEvidencePackProjectId('proj-p102')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Generate Evidence Dossier</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Audited Works"
              value={auditProjects.length}
              subtext="Total sanctions under audit"
              icon={FileText}
              variant="default"
            />
            <MetricCard
              title="Active Audit Cases"
              value={auditCases.length}
              subtext="Under statutory investigation"
              icon={Scale}
              variant="warning"
            />
            <MetricCard
              title="Payment-Progress Mismatch"
              value="1 Critical"
              subtext="P102: 92% paid vs 45% physical"
              icon={AlertTriangle}
              variant="critical"
            />
            <MetricCard
              title="Duplicate Works Flagged"
              value="91% Match"
              subtext="P102 & P108 spatial overlap"
              icon={Layers}
              variant="critical"
            />
          </div>
          {/* DUPLICATE WORKS DEEP-DIVE */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-rose-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    AI Duplicate Work Anomaly Analysis: High-Confidence Semantic &amp; Spatial Match
                  </h3>
                  <p className="text-xs text-slate-500">
                    Isolation Forest &amp; Sentence Transformers detected high semantic similarity with nearby geo-coordinates
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-xs border border-rose-300 font-mono">
                Similarity: 91% • Proximity: 0.8 km
              </span>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              {/* Project 1: P102 */}
              <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{p102.code} (Earlier Sanction)</span>
                  <RiskBadge level={p102.riskLevel} score={p102.riskScore} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p102.name}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  "{p102.description}"
                </p>
                <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sanction Amount:</span>
                    <span className="font-bold font-mono">₹{(p102.sanctionAmount / 100000).toFixed(2)} Lakh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Awarded Contractor:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{p102.contractorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">20.0768° N, 74.1084° E</span>
                  </div>
                </div>
              </div>

              {/* Project 2: P108 */}
              <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/30 dark:bg-rose-950/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{p108.code} (Subsequent Sanction)</span>
                  <RiskBadge level={p108.riskLevel} score={p108.riskScore} />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p108.name}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  "{p108.description}"
                </p>
                <div className="pt-2 border-t border-rose-200 dark:border-rose-900/60 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sanction Amount:</span>
                    <span className="font-bold font-mono">₹{(p108.sanctionAmount / 100000).toFixed(2)} Lakh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Awarded Contractor:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{p108.contractorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">20.0820° N, 74.1140° E</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auditor Findings & Actions */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-amber-400">Auditor Forensics Note: </span>
                Both projects sanction a multi-purpose community hall in Niphad Ward 4 within 800m of each other, under identical scope wording, awarded to the same vendor.
              </div>
              <button
                onClick={() => setEvidencePackProjectId('proj-p102')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shrink-0 flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Generate Joint Audit Dossier</span>
              </button>
            </div>
          </div>

          {/* VISUAL FINANCIAL TRACEABILITY CHAIN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    End-to-End Money Trail &amp; PFMS Traceability Graph
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Audit tracing from Sanction Order to Treasury Bank UTR Settlement
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">1. Sanction Order</span>
                  <div className="font-mono font-bold mt-1 text-slate-900 dark:text-white">₹35.00 Lakh</div>
                  <span className="text-[10px] text-slate-500">AS/NSK/2024/089</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">2. Work Order</span>
                  <div className="font-mono font-bold mt-1 text-slate-900 dark:text-white">₹33.50 Lakh</div>
                  <span className="text-[10px] text-slate-500">WO-PWD-NSK-2024-112</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">3. RA Bills Claimed</span>
                  <div className="font-mono font-bold mt-1 text-slate-900 dark:text-white">₹32.20 Lakh</div>
                  <span className="text-[10px] text-slate-500">INV-PATIL-088 &amp; 099</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">4. E-MB Measured</span>
                  <div className="font-mono font-bold mt-1 text-rose-600 dark:text-rose-400">₹16.00 Lakh Obs.</div>
                  <span className="text-[10px] text-rose-500 font-bold">Mismatch Flagged</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">5. PFMS Cleared</span>
                  <div className="font-mono font-bold mt-1 text-emerald-600">₹32.20 Lakh Disb.</div>
                  <span className="text-[10px] text-slate-500">UTR: MAHB24061298411</span>
                </div>
              </div>
            </div>
          </div>

          {/* STATUTORY AUDIT CASES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  CAG Statutory Audit Case Inquiries
                </h3>
                <p className="text-xs text-slate-500">Formal inspection proceedings opened under Section 13/14 of the CAG Act</p>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3">Case ID</th>
                    <th className="p-3">Target Project</th>
                    <th className="p-3">Audit Category</th>
                    <th className="p-3">Opening Date</th>
                    <th className="p-3">Lead Auditor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditCases.map((cs) => (
                    <tr key={cs.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{cs.caseNumber}</td>
                      <td className="p-3 font-semibold">{cs.projectCode} - {cs.projectName}</td>
                      <td className="p-3">{cs.primaryIssue}</td>
                      <td className="p-3 font-mono text-slate-500">{cs.createdAt.split('T')[0]}</td>
                      <td className="p-3">{cs.assignedAuditor}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {cs.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setEvidencePackProjectId(cs.projectId)}
                          className="px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Pack</span>
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

      {/* VIEW: AUDIT OVERVIEW */}
      {activeView === 'audit-overview' && (
        <div>
          <PageHeader
            title="CAG MPLADS Audit Scope & Compliance Matrix"
            subtitle="Statutory review of public expenditure adherence to Gol MPLADS guidelines"
            icon={FileText}
            badge={`${auditProjects.length} Audited Works`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              CAG MPLADS Audit Scope &amp; Compliance Matrix
            </h3>
            <p className="text-xs text-slate-500">Statutory review of public expenditure adherence to Gol MPLADS guidelines</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[720px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Work Description</th>
                  <th className="p-3">Contractor</th>
                  <th className="p-3">Sanction Amount</th>
                  <th className="p-3">Expenditure</th>
                  <th className="p-3">Audit Finding</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-amber-700">{p.code}</td>
                    <td className="p-3 font-semibold">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.contractorName}</td>
                    <td className="p-3 font-mono font-bold">₹{(p.sanctionAmount / 100000).toFixed(2)}L</td>
                    <td className="p-3 font-mono text-emerald-600 font-bold">₹{(p.expenditure / 100000).toFixed(2)}L</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.riskLevel === 'CRITICAL' ? 'Major Audit Para Issued' : 'Compliant'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-amber-50 text-amber-800 font-semibold"
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

      {/* VIEW: AUDIT CASES & CASE MANAGEMENT */}
      {(activeView === 'audit-cases' || activeView === 'case-management') && (
        <div>
          <PageHeader
            title="Statutory Audit Investigation Cases"
            subtitle="Formal inspection proceedings opened under Section 13/14 of the CAG Act"
            icon={Scale}
            badge={`${auditCases.length} Investigation Cases`}
            actions={
              <button
                onClick={() => addToast('info', 'New Case Dossier', 'Statutory audit inquiry case file opened.')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open Audit Inquiry Case</span>
              </button>
            }
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statutory Audit Investigation Cases
              </h3>
              <p className="text-xs text-slate-500">Formal inspection proceedings opened under Section 13/14 of the CAG Act</p>
            </div>
            <button
              onClick={() => addToast('info', 'New Case Dossier', 'Statutory audit inquiry case file opened.')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Open Audit Inquiry Case
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {auditCases.map((cs) => (
              <div key={cs.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-amber-700 dark:text-amber-400">{cs.caseNumber}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                      {cs.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Filed: {cs.createdAt.split('T')[0]}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cs.projectName} ({cs.projectCode})</h4>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">{cs.primaryIssue}</p>
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Assigned: {cs.assignedAuditor}</span>
                  <button
                    onClick={() => setEvidencePackProjectId(cs.projectId)}
                    className="px-3 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Download Case Evidence Dossier
                  </button>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: FINANCIAL TRACEABILITY */}
      {activeView === 'financial-traceability' && (
        <div>
          <PageHeader
            title="Financial Traceability Graph & Money Trail"
            subtitle="Unbroken provenance tracking from parliamentary sanction to ground vendor clearing"
            icon={GitBranch}
            badge="Proven Provenance"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Financial Traceability Graph &amp; Money Trail
            </h3>
            <p className="text-xs text-slate-500">Unbroken provenance tracking from parliamentary sanction to ground vendor clearing</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4">
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Stage 1: Central MPLADS Sanction</span>
                <p className="mt-1 font-mono font-bold">₹35,00,000 sanctioned under Hon'ble MP allocation (Order: AS/NSK/2024/089)</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Stage 2: District Treasury Release</span>
                <p className="mt-1 font-mono font-bold">100% funds released to PWD Division 2 Executing Agency account</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Stage 3: Contractor RA Bill Submission</span>
                <p className="mt-1 font-mono font-bold text-rose-600">₹32,20,000 claimed across 2 invoices against only 45% measured work</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Stage 4: PFMS Treasury Bank Clearing</span>
                <p className="mt-1 font-mono font-bold text-emerald-600">UTR: MAHB24061298411 settled to Patil Infrastructure Bank of Maharashtra Account</p>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: INVOICE MAPPING & DUPLICATE PAYMENTS */}
      {(activeView === 'invoice-mapping' || activeView === 'duplicate-payments') && (
        <div>
          <PageHeader
            title="Invoice-to-Payment Mapping & Duplicate Claim Detector"
            subtitle="Line-item cross matching of running account bills against verified E-MB records"
            icon={Receipt}
            badge={`${INITIAL_INVOICES.length} Claims Audited`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Invoice-to-Payment Mapping &amp; Duplicate Claim Detector
            </h3>
            <p className="text-xs text-slate-500">Line-item cross matching of running account bills against verified E-MB records</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Claim Amount</th>
                  <th className="p-3">E-MB Backed Amount</th>
                  <th className="p-3">Bank UTR</th>
                  <th className="p-3">Audit Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {INITIAL_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold">{inv.invoiceNumber}</td>
                    <td className="p-3 font-semibold">{inv.projectCode}</td>
                    <td className="p-3 font-mono font-bold">₹{inv.amountClaimed.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-blue-700">₹{(inv.amountApproved || inv.amountClaimed).toLocaleString()}</td>
                    <td className="p-3 font-mono text-slate-500">MAHB24061298411</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'PAYMENT_HELD' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inv.status === 'PAYMENT_HELD' ? 'Payment Held for Disparity' : 'Reconciled'}
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

      {/* VIEW: DUPLICATE WORKS */}
      {activeView === 'duplicate-works' && (
        <div>
          <PageHeader
            title="AI Duplicate Work Anomaly Analysis: P102 vs P108"
            subtitle="Spatial overlap and semantic duplicate work detection"
            icon={Layers}
            badge="High Anomaly Alert"
            actions={
              <button
                onClick={() => setEvidencePackProjectId('proj-p102')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Forensic Dossier</span>
              </button>
            }
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Duplicate Work Anomaly Analysis: P102 vs P108
            </h3>
            <p className="text-xs text-slate-500">Spatial overlap and semantic duplicate work detection</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
              <span className="font-mono font-bold">{p102.code} (Earlier Sanction)</span>
              <h4 className="font-bold text-sm mt-1">{p102.name}</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{p102.description}</p>
              <div className="mt-3 font-mono text-[11px] space-y-1">
                <div>Sanction: ₹{(p102.sanctionAmount / 100000).toFixed(2)} Lakh</div>
                <div>Vendor: {p102.contractorName}</div>
                <div>GPS: 20.0768° N, 74.1084° E</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20">
              <span className="font-mono font-bold">{p108.code} (Subsequent Sanction)</span>
              <h4 className="font-bold text-sm mt-1">{p108.name}</h4>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{p108.description}</p>
              <div className="mt-3 font-mono text-[11px] space-y-1">
                <div>Sanction: ₹{(p108.sanctionAmount / 100000).toFixed(2)} Lakh</div>
                <div>Vendor: {p108.contractorName}</div>
                <div>GPS: 20.0820° N, 74.1140° E</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-900 text-white text-xs flex justify-between items-center">
            <span>Result: 91% Semantic text similarity, 0.8 km distance apart. Same vendor. Double-billing risk.</span>
            <button
              onClick={() => setEvidencePackProjectId('proj-p102')}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold"
            >
              Export Forensic Dossier
            </button>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: COST ANOMALIES & PAYMENT MISMATCH */}
      {(activeView === 'cost-anomalies' || activeView === 'payment-mismatch') && (
        <div>
          <PageHeader
            title="Payment-to-Physical Progress Disparity & Cost Anomalies"
            subtitle="Statistical anomalies where payments exceed ground physical verification by >20%"
            icon={AlertTriangle}
            badge="Variance Analysis"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Payment-to-Physical Progress Disparity &amp; Cost Anomalies
            </h3>
            <p className="text-xs text-slate-500">Statistical anomalies where payments exceed ground physical verification by &gt;20%</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Project Code</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Disbursed Funds %</th>
                  <th className="p-3">Physical Work %</th>
                  <th className="p-3">Variance Gap</th>
                  <th className="p-3">CAG Determination</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditProjects.map((p) => {
                  const variance = p.financialProgressPercent - p.physicalProgressPercent;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold">{p.code}</td>
                      <td className="p-3 font-semibold">{p.name}</td>
                      <td className="p-3 font-mono font-bold text-emerald-600">{p.financialProgressPercent}%</td>
                      <td className="p-3 font-mono font-bold">{p.physicalProgressPercent}%</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={variance > 20 ? 'text-rose-600' : 'text-slate-600'}>
                          +{variance}%
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          variance > 20 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {variance > 20 ? 'Premature Payment Para' : 'Within Bounds'}
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

      {/* VIEW: CONTRACTOR RISK */}
      {activeView === 'contractor-risk' && (
        <div>
          <PageHeader
            title="Contractor Collusion & Concentration Risk Indicators"
            subtitle="Forensic examination of bidding syndicates and tender dominance"
            icon={Users}
            badge="Vendor Scrutiny"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Contractor Collusion &amp; Concentration Risk Indicators
            </h3>
            <p className="text-xs text-slate-500">Forensic examination of bidding syndicates and tender dominance</p>
          </div>

          <div className="space-y-3 text-xs">
            {['Patil Infrastructure & Works Pvt Ltd', 'Nashik Roadlines & Civil Projects'].map((v, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">{v}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Risk Score: {i === 0 ? '78/100 (Elevated)' : '32/100 (Normal)'}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  Awarded multiple adjacent works in same sub-division. Bidding margin variance &lt; 0.5% against competing tenders.
                </p>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}

      {/* VIEW: GEOGRAPHIC ANOMALIES */}
      {activeView === 'geographic-anomalies' && (
        <div>
          <PageHeader
            title="Geographic GPS Cluster Anomalies"
            subtitle="Works sanctioned with overlapping or near-identical coordinates"
            icon={MapPin}
            badge="Cluster Proximity"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Geographic GPS Cluster Anomalies
            </h3>
            <p className="text-xs text-slate-500">Works sanctioned with overlapping or near-identical coordinates</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs custom-scrollbar">
            <table className="w-full text-left min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="p-3">Cluster</th>
                  <th className="p-3">Project Codes</th>
                  <th className="p-3">GPS Proximity</th>
                  <th className="p-3">Overlap Type</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold">Niphad Ward 4</td>
                  <td className="p-3 font-mono font-bold text-rose-600">P102 &amp; P108</td>
                  <td className="p-3 font-mono">0.8 km distance</td>
                  <td className="p-3 font-bold text-rose-600">High Semantic &amp; Spatial Overlap</td>
                  <td className="p-3">
                    <button
                      onClick={() => setEvidencePackProjectId('proj-p102')}
                      className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold"
                    >
                      Audit Dossier
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: HISTORICAL ANALYSIS */}
      {activeView === 'historical-analysis' && (
        <div>
          <PageHeader
            title="Multi-Year Audit Trend & Recurrence Analysis"
            subtitle="Historical pattern analysis of MPLADS fund execution across consecutive Lok Sabha terms"
            icon={History}
            badge="Multi-Year Trends"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Multi-Year Audit Trend &amp; Recurrence Analysis
            </h3>
            <p className="text-xs text-slate-500">Historical pattern analysis of MPLADS fund execution across consecutive Lok Sabha terms</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold">FY 2024-25 (Current Period)</span>
                <span className="font-mono text-emerald-600 font-bold">₹2.85 Cr Sanctioned</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Audit findings highlight significant improvement in digital E-MB implementation, with isolated high-risk duplication in civil hall constructions.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
              <div className="flex justify-between mb-1">
                <span className="font-bold">FY 2023-24 (Prior Audit Period)</span>
                <span className="font-mono text-slate-500 font-bold">₹2.50 Cr Sanctioned</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Prior audit paras successfully settled following submission of missing physical completion certificates.
              </p>
            </div>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: EVIDENCE REPO */}
      {activeView === 'evidence-repo' && (
        <div>
          <PageHeader
            title="Court-Admissible Evidence Repository"
            subtitle="Tamper-proof digitized site photographs, GPS coordinates, and signed measurement sheets"
            icon={FolderArchive}
            badge={`${INITIAL_SITE_EVIDENCE.length} Evidence Records`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Court-Admissible Evidence Repository
            </h3>
            <p className="text-xs text-slate-500">Tamper-proof digitized site photographs, GPS coordinates, and signed measurement sheets</p>
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
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
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

      {/* VIEW: AUDIT TRAIL */}
      {activeView === 'audit-trail' && (
        <div>
          <PageHeader
            title="Immutable Cryptographic Audit Trail"
            subtitle="Every system action recorded with user identity, timestamp, and SHA-256 verification"
            icon={ClipboardList}
            badge={`${auditLogs.length} Audit Events`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Immutable Cryptographic Audit Trail
            </h3>
            <p className="text-xs text-slate-500">Every system action recorded with user identity, timestamp, and SHA-256 verification</p>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto text-xs max-h-96 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Officer / User</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Entity</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5 text-slate-400">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                    <td className="p-2.5 text-slate-800 dark:text-slate-200">{log.userName}</td>
                    <td className="p-2.5">{log.userRole}</td>
                    <td className="p-2.5 font-bold text-amber-600 dark:text-amber-400">{log.action}</td>
                    <td className="p-2.5 text-slate-500">{log.category}</td>
                    <td className="p-2.5 font-sans text-slate-600 dark:text-slate-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* VIEW: AI RISK SCORES */}
      {activeView === 'ai-risk-scores' && (
        <div>
          <PageHeader
            title="Explainable AI Risk Scores & Feature Contribution"
            subtitle="Mathematical breakdown of risk indicators generated by isolation forest anomaly models"
            icon={ShieldAlert}
            badge={`${INITIAL_AI_ALERTS.length} Alerts`}
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Explainable AI Risk Scores &amp; Feature Contribution
            </h3>
            <p className="text-xs text-slate-500">Mathematical breakdown of risk indicators generated by isolation forest anomaly models</p>
          </div>

          <div className="space-y-3 text-xs">
            {INITIAL_AI_ALERTS.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/10 cursor-pointer hover:shadow-xs"
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

      {/* VIEW: AUDIT REPORTS & EVIDENCE PACK */}
      {(activeView === 'audit-reports' || activeView === 'evidence-pack') && (
        <div>
          <PageHeader
            title="Statutory CAG Audit Report Generator & Evidence Export"
            subtitle="Formal inspection reports prepared under Article 149 of the Constitution of India"
            icon={FileText}
            badge="Statutory Reports"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Statutory CAG Audit Report Generator &amp; Evidence Export
            </h3>
            <p className="text-xs text-slate-500">Formal inspection reports prepared under Article 149 of the Constitution of India</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Formal Audit Inspection Report (AIR)</h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-3">
                Full statutory report containing Part I (Introductory), Part II A (Major Irregularities), and Part II B (Procedural Lapses).
              </p>
              <button
                onClick={() => addToast('success', 'AIR Report Generated', 'Statutory Audit Inspection Report ready for submission to Principal Accountant General.')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export Statutory AIR
              </button>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">Forensic Evidence Pack (ZIP)</h4>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mb-3">
                Download consolidated evidence dossier for Project P102 and P108 with photo logs, E-MBs, and bank statements.
              </p>
              <button
                onClick={() => setEvidencePackProjectId('proj-p102')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Open Evidence Pack Generator
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
            title="Audit Office Official Communications"
            subtitle="Notices from Principal Accountant General (Audit) Maharashtra"
            icon={Bell}
            badge="Official Communications"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Audit Office Official Communications
            </h3>
            <p className="text-xs text-slate-500">Notices from Principal Accountant General (Audit) Maharashtra</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-900 dark:text-amber-200">Audit Para Approved by PAG</span>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Special audit para on P102 (₹32.20 Lakh disbursement against 45% physical progress) approved for incorporation into the Annual Audit Report.
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
            title="Senior Audit Officer Profile & Authority"
            subtitle="Constitutional credentials under Comptroller & Auditor General's (DPC) Act, 1971"
            icon={User}
            badge="Section 13 & 14 Authority"
          />
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Senior Audit Officer Profile &amp; Authority
            </h3>
            <p className="text-xs text-slate-500">Constitutional credentials under Comptroller &amp; Auditor General's (DPC) Act, 1971</p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Officer Name:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{user?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Designation:</span>
                <span className="font-bold text-slate-900 dark:text-white">Senior Audit Officer (Civil Audit Wing)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Audit Jurisdiction:</span>
                <span className="font-bold text-slate-900 dark:text-white">O/o Principal Accountant General (Audit) Maharashtra</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Statutory Powers:</span>
                <span className="font-bold text-amber-600">Section 13 &amp; 14 CAG (DPC) Act 1971</span>
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

      {evidencePackProjectId && (
        <EvidencePackModal
          projectId={evidencePackProjectId}
          onClose={() => setEvidencePackProjectId(null)}
        />
      )}
    </div>
  );
};
