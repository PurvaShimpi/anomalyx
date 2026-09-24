import React, { useState } from 'react';
import { AIAlert } from '../../types';
import { INITIAL_AI_ALERTS, db } from '../../server/db';
import { RiskBadge } from '../common/RiskBadge';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  Calendar,
  UserCheck,
  Send,
} from 'lucide-react';

interface AlertDetailModalProps {
  alertId: string;
  onClose: () => void;
  onAlertUpdated?: () => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alertId,
  onClose,
  onAlertUpdated,
}) => {
  const { user, role, addToast } = useAuth();
  const alert = INITIAL_AI_ALERTS.find((a) => a.id === alertId) || INITIAL_AI_ALERTS[0];

  const [decision, setDecision] = useState<
    'VERIFIED_ANOMALY' | 'FALSE_POSITIVE' | 'MORE_EVIDENCE_NEEDED' | 'ESCALATED'
  >(alert.humanDecision || 'VERIFIED_ANOMALY');
  const [remarks, setRemarks] = useState<string>(
    alert.reviewRemarks ||
      'Verified physical progress mismatch against latest PWD Division site measurements.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDecision = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert.humanDecision = decision;
      alert.reviewRemarks = remarks;
      alert.reviewedBy = `${user?.fullName} (${user?.designation || role})`;
      alert.reviewedAt = new Date().toISOString();

      if (decision === 'VERIFIED_ANOMALY') alert.status = 'VERIFIED';
      else if (decision === 'FALSE_POSITIVE') alert.status = 'FALSE_POSITIVE';
      else if (decision === 'ESCALATED') alert.status = 'ESCALATED';
      else alert.status = 'UNDER_REVIEW';

      db.addAuditLog(
        user?.id || 'auditor',
        user?.fullName || 'Official',
        role as any,
        'ALERT_REVIEWED',
        'AI_ALERT',
        `Recorded human decision for alert ${alert.alertCode}: ${decision}. Remarks: ${remarks}`
      );

      setIsSubmitting(false);
      addToast('success', 'Human Verification Recorded', `Decision '${decision.replace('_', ' ')}' saved.`);
      onAlertUpdated?.();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                {alert.alertCode}
              </span>
              <RiskBadge level={alert.riskLevel} score={alert.riskScore} />
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {alert.alertType.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
              {alert.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Project: <span className="font-semibold text-slate-800 dark:text-slate-200">{alert.projectCode} – {alert.projectName}</span> • {alert.district} District
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* AI Observation */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">
              AI Detection Summary
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {alert.description}
            </p>
          </div>

          {/* Contributing Factors */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2.5">
              Contributing Risk Factors (Explainable AI)
            </h4>
            <div className="space-y-2">
              {alert.contributingFactors.map((f, i) => (
                <div key={i} className="flex items-start justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{f.factor}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{f.details}</div>
                  </div>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-3">
                    +{f.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Evidence */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
              Linked Supporting Evidence
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400">
              {alert.supportingEvidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
          </div>

          {/* What would disprove this alert? */}
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              What Would Disprove This Alert? (Objective Counter-Evidence)
            </div>
            <p className="text-emerald-800/80 dark:text-emerald-400 text-[11px] mb-2">
              The AI platform provides verifiable conditions under which this flag should be cleared by the authority:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-emerald-950 dark:text-emerald-200 text-[11px]">
              {alert.disproveCriteria.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Human Verification Form */}
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Authorized Human Verification Workflow
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
              AI flags anomalies as risk indicators only. As an authorized officer, record your official determination below:
            </p>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { id: 'VERIFIED_ANOMALY', label: 'Verified Anomaly', color: 'border-rose-300 text-rose-800' },
                { id: 'FALSE_POSITIVE', label: 'False Positive', color: 'border-emerald-300 text-emerald-800' },
                { id: 'MORE_EVIDENCE_NEEDED', label: 'More Evidence Needed', color: 'border-amber-300 text-amber-800' },
                { id: 'ESCALATED', label: 'Escalate to Collector', color: 'border-purple-300 text-purple-800' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDecision(opt.id as any)}
                  className={`p-2.5 sm:p-2 rounded-lg border text-center font-semibold text-xs transition-all touch-manipulation ${
                    decision === opt.id
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Verification Remarks &amp; Direction:
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter technical or administrative justification..."
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Reviewer: <span className="font-bold text-slate-800 dark:text-slate-200">{user?.fullName}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleSaveDecision}
              className="px-4 py-2 sm:py-1.5 rounded-lg bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 shadow-sm touch-manipulation"
            >
              <Send className="w-3.5 h-3.5" />
              {isSubmitting ? 'Recording...' : 'Submit Human Decision'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
