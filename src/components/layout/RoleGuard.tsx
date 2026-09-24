import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldX, ArrowRight } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, role, setActiveView } = useAuth();

  if (!user || !role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 mx-auto mb-4">
            <ShieldX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            You do not have permission to access this dashboard. The requested resource requires authorized credentials for{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {allowedRoles.map((r) => r.replace('_', ' ')).join(' or ')}
            </span>.
          </p>
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <span>Return to My Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
