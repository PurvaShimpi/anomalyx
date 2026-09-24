import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, ArrowLeft, LayoutDashboard } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-blue-100 text-blue-800 border-blue-200',
  icon: Icon,
  actions,
}) => {
  const { setActiveView } = useAuth();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs mb-5 sm:mb-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 min-w-0 max-w-full">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium cursor-pointer shrink-0 touch-manipulation"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 dark:text-white px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] truncate max-w-[180px] sm:max-w-xs">
            {title}
          </span>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 transition-colors cursor-pointer text-[11px] shrink-0 touch-manipulation py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </button>
      </div>

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug break-words">
                {title}
              </h1>
              {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
