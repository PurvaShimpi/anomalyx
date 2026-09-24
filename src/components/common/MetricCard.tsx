import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'info';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
          border: 'border-rose-200 dark:border-rose-900/60',
          hover: 'hover:border-rose-300',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-900/60',
          hover: 'hover:border-amber-300',
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-900/60',
          hover: 'hover:border-emerald-300',
        };
      case 'info':
        return {
          iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
          border: 'border-sky-200 dark:border-sky-900/60',
          hover: 'hover:border-sky-300',
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-800',
          hover: 'hover:border-slate-300 dark:hover:border-slate-700',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl border ${styles.border} ${
        onClick ? `cursor-pointer ${styles.hover} transition-all duration-200 hover:shadow-sm` : ''
      } p-5 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};
