import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
      id="toast-container"
    >
      {toasts.map((toast) => {
        // Distinct color styling for each pop-up message type
        let borderClass = 'border-sky-500/70 bg-slate-950/95 shadow-sky-950/40';
        let accentGlow = 'bg-sky-400';
        let titleColor = 'text-sky-400';
        let messageColor = 'text-sky-200';
        let badgeBg = 'bg-sky-950/90 border-sky-500/60 text-sky-300';
        let closeColor = 'text-sky-400 hover:text-sky-200 hover:bg-sky-950/60';
        let badgeLabel = 'SYSTEM NOTICE';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />;
        let customPopupClass = 'toast-popup-info';

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/70 bg-slate-950/95 shadow-emerald-950/40';
          accentGlow = 'bg-emerald-400';
          titleColor = 'text-emerald-400';
          messageColor = 'text-emerald-200';
          badgeBg = 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300';
          closeColor = 'text-emerald-400 hover:text-emerald-200 hover:bg-emerald-950/60';
          badgeLabel = 'SUCCESS';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />;
          customPopupClass = 'toast-popup-success';
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-500/70 bg-slate-950/95 shadow-rose-950/40';
          accentGlow = 'bg-rose-400';
          titleColor = 'text-rose-400';
          messageColor = 'text-rose-200';
          badgeBg = 'bg-rose-950/90 border-rose-500/60 text-rose-300';
          closeColor = 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/60';
          badgeLabel = 'ALERT / ERROR';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />;
          customPopupClass = 'toast-popup-error';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/70 bg-slate-950/95 shadow-amber-950/40';
          accentGlow = 'bg-amber-400';
          titleColor = 'text-amber-400';
          messageColor = 'text-amber-200';
          badgeBg = 'bg-amber-950/90 border-amber-500/60 text-amber-300';
          closeColor = 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/60';
          badgeLabel = 'ATTENTION';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />;
          customPopupClass = 'toast-popup-warning';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative shadow-2xl rounded-2xl border-2 p-4 flex items-start gap-3.5 transition-all duration-200 backdrop-blur-md overflow-hidden ${borderClass} ${customPopupClass}`}
            role="alert"
          >
            {/* Left glowing accent stripe */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentGlow}`} />

            {/* Icon */}
            <div className="pl-1 shrink-0">
              {icon}
            </div>

            {/* Content with specific text colors */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeBg}`}>
                  {badgeLabel}
                </span>
                <h4 className={`text-sm font-bold leading-tight toast-title ${titleColor}`}>
                  {toast.title}
                </h4>
              </div>
              <p className={`text-xs leading-relaxed toast-desc font-medium ${messageColor}`}>
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className={`p-1.5 rounded-lg transition-colors shrink-0 ${closeColor}`}
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
