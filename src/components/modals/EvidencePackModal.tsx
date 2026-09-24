import React from 'react';
import { INITIAL_PROJECTS, INITIAL_WORK_ORDERS, INITIAL_INVOICES, INITIAL_PAYMENTS, INITIAL_MEASUREMENTS, INITIAL_INSPECTIONS, INITIAL_SITE_EVIDENCE } from '../../server/db';
import { evaluateProjectRisk } from '../../server/aiEngine';
import { X, Printer, Download, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Building } from 'lucide-react';

interface EvidencePackModalProps {
  projectId: string;
  onClose: () => void;
}

export const EvidencePackModal: React.FC<EvidencePackModalProps> = ({ projectId, onClose }) => {
  const project =
    INITIAL_PROJECTS.find((p) => p.id === projectId || p.code === projectId) || INITIAL_PROJECTS[1];
  const aiAnalysis = evaluateProjectRisk(project, INITIAL_PROJECTS);
  const workOrders = INITIAL_WORK_ORDERS.filter((w) => w.projectId === project.id);
  const invoices = INITIAL_INVOICES.filter((i) => i.projectId === project.id);
  const payments = INITIAL_PAYMENTS.filter((p) => p.projectId === project.id);
  const measurements = INITIAL_MEASUREMENTS.filter((m) => m.projectId === project.id);
  const inspections = INITIAL_INSPECTIONS.filter((i) => i.projectId === project.id);
  const evidence = INITIAL_SITE_EVIDENCE.filter((e) => e.projectId === project.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white text-slate-900 border border-slate-300 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:p-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                CAG DOSSIER
              </span>
              <span className="text-xs font-mono text-slate-500">
                REF: CAG/EVID-PACK/{project.code}/2026
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">
              Consolidated Audit Evidence Package
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Content Body */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs leading-relaxed font-sans print:p-4">
          {/* Official Letterhead */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="text-sm font-extrabold uppercase tracking-widest text-slate-800">
              OFFICE OF THE PRINCIPAL DIRECTOR OF AUDIT
            </div>
            <div className="text-xs font-bold text-slate-600">
              COMPTROLLER &amp; AUDITOR GENERAL OF INDIA
            </div>
            <div className="text-[10px] text-slate-500 uppercase mt-0.5">
              MPLADS Field Investigation Cell • Maharashtra State Division
            </div>
            <div className="inline-block mt-2 px-3 py-1 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-bold border border-amber-300">
              DEMO DATA – NOT OFFICIAL GOVERNMENT DATA
            </div>
          </div>

          {/* Project Summary Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Project Code</span>
              <div className="font-mono font-bold text-sm">{project.code}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">District &amp; State</span>
              <div className="font-semibold text-sm">{project.district}, {project.state}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Sanction Amount</span>
              <div className="font-mono font-bold text-sm">₹{project.sanctionAmount.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Disbursed</span>
              <div className="font-mono font-bold text-rose-700 text-sm">₹{project.expenditure.toLocaleString()} (92%)</div>
            </div>
          </div>

          {/* AI Early Warning Alert Summary */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
            <div className="font-bold text-rose-950 text-xs mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              AI Risk Prioritization Flag: {project.riskScore}/100 ({project.riskLevel} RISK)
            </div>
            <p className="text-rose-900 text-[11px]">
              This case was prioritized by AnomalyX due to a significant mismatch between financial disbursements (92%) and observed physical completion (45%), alongside semantic duplication indicators with adjacent project P108.
            </p>
          </div>

          {/* 1. Administrative & Technical Sanction Record */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 border-b pb-1">
              1. Sanction &amp; Procurement Authorization
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500">Administrative Sanction:</span>
                <div className="font-mono font-bold">{project.administrativeSanctionNo}</div>
                <div className="text-[10px] text-slate-500 mt-1">Date: {project.sanctionDate} | Authority: District Collector</div>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500">Technical Sanction:</span>
                <div className="font-mono font-bold">{project.technicalSanctionNo}</div>
                <div className="text-[10px] text-slate-500 mt-1">Date: {project.startDate} | Authority: Executive Engineer PWD</div>
              </div>
            </div>
          </div>

          {/* 2. Measurement Records (E-MB) */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 border-b pb-1">
              2. Physical Measurements (E-MB Extracts)
            </h4>
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">E-MB No.</th>
                    <th className="p-2">Item Description</th>
                    <th className="p-2">Claimed</th>
                    <th className="p-2">Observed</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {measurements.map((m) => (
                    <tr key={m.id}>
                      <td className="p-2 font-mono">{m.embNumber}</td>
                      <td className="p-2">{m.itemDescription}</td>
                      <td className="p-2 font-mono">{m.claimedQuantity} {m.unit}</td>
                      <td className="p-2 font-mono font-bold">{m.measuredQuantity} {m.unit}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-900">
                          {m.verificationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Disbursement Trace */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-2 border-b pb-1">
              3. Disbursed Treasury Vouchers (PFMS Trace)
            </h4>
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full text-left min-w-[480px]">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">Voucher No</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Bank UTR Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="p-2 font-mono">{p.paymentRefNumber}</td>
                      <td className="p-2">{p.paymentDate}</td>
                      <td className="p-2 font-mono font-bold">₹{p.amount.toLocaleString()}</td>
                      <td className="p-2 font-mono text-[10px]">{p.bankTransactionId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Disprove Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2">
              4. Auditor Verification &amp; Disprove Criteria
            </h4>
            <p className="text-[11px] text-slate-600 mb-2">
              Prior to issuing a formal surcharge notice, verify whether the following counter-evidence has been provided:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-700">
              {project.disproveChecklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          {/* Official Sign-off Box */}
          <div className="pt-6 border-t-2 border-slate-800 flex justify-between items-end">
            <div>
              <div className="text-[10px] text-slate-400">Generated by AnomalyX Audit Engine</div>
              <div className="text-[10px] text-slate-500 font-mono">Date: {new Date().toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-dashed border-slate-400 w-48 mb-1"></div>
              <div className="text-xs font-bold text-slate-900">Arunabh Sengupta</div>
              <div className="text-[10px] text-slate-500">Principal Director of Audit (CAG)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
