import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  Layers,
  Search,
  Scale,
  Building,
  UserCheck,
  Cpu,
  Database,
  Cloud,
  Lock,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToSignUp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin, onGoToSignUp }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-base sm:text-xl shadow-lg shadow-amber-500/20 shrink-0">
            AX
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-white text-base sm:text-lg tracking-wider">
                ANOMALY<span className="text-amber-400">X</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                MPLADS
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              AI-Powered MPLADS Monitoring &amp; Risk Detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onGoToLogin}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 transition-colors touch-manipulation"
          >
            Officer Login
          </button>
          <button
            onClick={onGoToSignUp}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 flex items-center gap-1 sm:gap-1.5 touch-manipulation"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Next-Generation National Infrastructure Governance</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          AI-Powered MPLADS Monitoring &amp;{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">
            Risk Detection System
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Transforming MPLADS monitoring from manual and reactive verification into proactive, explainable and evidence-based risk management.
        </p>

        {/* Core Governance Principle Box */}
        <div className="mt-8 p-3 rounded-xl bg-slate-900/90 border border-slate-800 max-w-xl mx-auto text-xs text-slate-300 flex items-center gap-3 text-left">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold text-white">Responsible AI Principle: </span>
            The system acts as an early-warning prioritization engine. AI does not declare fraud or auto-blacklist. Authorized human officials make all final determinations.
          </div>
        </div>

        {/* Official Role Portals Overview */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Authorized Stakeholder Workspaces
            </p>
            <button
              onClick={onGoToLogin}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { title: 'Contractor', sub: 'Awarded Works & E-MB' },
              { title: 'PWD Engineer', sub: 'Technical Verification' },
              { title: 'Collector / DM', sub: 'District Administration' },
              { title: 'CAG Auditor', sub: 'Traceability & Dossier' },
              { title: 'Ministry / Admin', sub: 'National Oversight' },
            ].map((btn, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left"
              >
                <div className="font-bold text-xs text-white">
                  {btn.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {btn.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            The Monitoring Challenge &amp; The AnomalyX Paradigm
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Bridging the gap between physical execution on the ground and financial disbursement records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy Challenges */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 text-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Legacy Inspection Pain Points</span>
            </div>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Physical-Financial Disconnect:</strong> Funds disbursed up to 90%+ while physical work lags at 40% without early warning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Overlapping Works:</strong> Inadvertent duplication of community halls or roads sanctioned within the same village boundary.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Delayed Audit Scrutiny:</strong> Irregularities discovered years later during post-expenditure audits rather than in real-time.</span>
              </li>
            </ul>
          </div>

          {/* AnomalyX Solution */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>The AnomalyX Approach</span>
            </div>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Explainable AI Early-Warning:</strong> Highlights payment vs progress mismatch before final bill clearance.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Sentence Transformers &amp; GIS Matching:</strong> Automatically flags 85%+ semantic similarities in adjacent wards.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>Actionable Disprove Criteria:</strong> Gives auditors concrete evidence checklists ("What would disprove this alert?").</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 9-Step 'How It Works' Section (Section 35) */}
      <section className="px-6 py-16 bg-slate-900/50 border-t border-b border-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
              End-to-End Governance Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How AnomalyX Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 text-xs">
            {[
              { step: '01', title: 'MPLADS / eSAKSHI Data', desc: 'Ingestion of sanction orders, tenders, vouchers, and contractor registrations.' },
              { step: '02', title: 'Secure Data Ingestion', desc: 'Azure Event Hubs & ADLS Gen2 pipelines with cryptographic integrity checks.' },
              { step: '03', title: 'Data Cleaning & Validation', desc: 'Schema standardization, duplicate PAN/GST detection, and reference reconciliation.' },
              { step: '04', title: 'Data Processing (Spark)', desc: 'Distributed transformations and aggregate metric calculations at scale.' },
              { step: '05', title: 'AI / ML Analysis', desc: 'Isolation Forest anomaly detection + XGBoost milestone delay forecasting.' },
              { step: '06', title: 'Duplicate & NLP Detection', desc: 'Sentence Transformers comparing scope text with Haversine geospatial proximity.' },
              { step: '07', title: 'Explainable Risk Scoring', desc: '0–100 risk score breakdown (+points per factor) with non-accusatory labeling.' },
              { step: '08', title: 'Smart Alerts Center', desc: 'Role-specific early warnings delivered to Engineer, Collector, and CAG Auditor.' },
              { step: '09', title: 'Human Verification & Action', desc: 'Authorized officers conduct field inspections, review counter-evidence, and close cases.' },
            ].map((st) => (
              <div key={st.step} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="font-mono font-black text-amber-400 text-lg">{st.step}</span>
                  <h4 className="font-bold text-white mt-1 text-sm">{st.title}</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Matrix Section (Section 32) */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Right Information to the Right Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Five completely distinct operational dashboards tailored to legal mandates and responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              ROLE 1
            </span>
            <h3 className="font-bold text-white mt-2 text-sm">Contractor</h3>
            <p className="text-slate-400 text-[11px] mt-1 mb-3">Their own awarded works only</p>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ My Projects</li>
              <li>✓ Work Orders</li>
              <li>✓ E-MB Measurements</li>
              <li>✓ Bills &amp; Invoices</li>
              <li>✓ Geo-tagged Photos</li>
              <li>✓ Payment Tracking</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              ROLE 2
            </span>
            <h3 className="font-bold text-white mt-2 text-sm">PWD Engineer</h3>
            <p className="text-slate-400 text-[11px] mt-1 mb-3">Technical execution &amp; verification</p>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ Project Monitoring</li>
              <li>✓ Field Inspections</li>
              <li>✓ E-MB Verification</li>
              <li>✓ Bill Verification</li>
              <li>✓ Material Certificates</li>
              <li>✓ Anomaly Alerts</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              ROLE 3
            </span>
            <h3 className="font-bold text-white mt-2 text-sm">District Collector</h3>
            <p className="text-slate-400 text-[11px] mt-1 mb-3">District administration &amp; holds</p>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ District Overview</li>
              <li>✓ Admin Sanctions</li>
              <li>✓ Fund Utilization</li>
              <li>✓ Fund Holds</li>
              <li>✓ Inquiry Directives</li>
              <li>✓ GIS Risk Map</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              ROLE 4
            </span>
            <h3 className="font-bold text-white mt-2 text-sm">CAG Auditor</h3>
            <p className="text-slate-400 text-[11px] mt-1 mb-3">Audit, traceability &amp; dossier</p>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ Traceability Chain</li>
              <li>✓ Invoice-Pay Mapping</li>
              <li>✓ Duplicate Detection</li>
              <li>✓ Cost Anomalies</li>
              <li>✓ Evidence Packs</li>
              <li>✓ Audit Reports</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              ROLE 5
            </span>
            <h3 className="font-bold text-white mt-2 text-sm">Ministry / Admin</h3>
            <p className="text-slate-400 text-[11px] mt-1 mb-3">National policy &amp; governance</p>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>✓ Pan-India Overview</li>
              <li>✓ State Monitoring</li>
              <li>✓ National Risk Matrix</li>
              <li>✓ User Management</li>
              <li>✓ System Logs &amp; Audit</li>
              <li>✓ Threshold Config</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Removed Enterprise Cloud Architecture Specification as requested */}
    </div>
  );
};
