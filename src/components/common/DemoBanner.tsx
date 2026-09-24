import React from 'react';
import { AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border-b border-amber-500/30 text-slate-200 text-xs px-4 py-2 flex items-center justify-between flex-wrap gap-2 sticky top-0 z-50">
      <div className="flex items-center gap-2 font-medium">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
          DEMO DATA – NOT OFFICIAL GOVERNMENT DATA
        </span>
        <span className="hidden sm:inline text-slate-300">
          AnomalyX AI Early-Warning &amp; Risk-Prioritization Platform
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Explainable AI Active
        </span>
        <span className="hidden md:flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          AI flags exceptions; human officials make final verification decisions.
        </span>
      </div>
    </div>
  );
};
