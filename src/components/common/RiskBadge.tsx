import React from 'react';
import { RiskLevel } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showIcon = true,
  size = 'md',
}) => {
  const getColors = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900',
          dot: 'bg-rose-600',
          icon: ShieldAlert,
          label: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900',
          dot: 'bg-orange-500',
          icon: AlertTriangle,
          label: 'HIGH RISK',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
          dot: 'bg-amber-500',
          icon: AlertCircle,
          label: 'MEDIUM RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          label: 'LOW RISK',
        };
    }
  };

  const { bg, dot, icon: Icon, label } = getColors();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${bg} ${sizeClasses} transition-colors whitespace-nowrap`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      {!showIcon && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      <span>{label}</span>
      {score !== undefined && (
        <span className="font-mono opacity-80 pl-1 border-l border-current/30">
          {score}/100
        </span>
      )}
    </span>
  );
};
