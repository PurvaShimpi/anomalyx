import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  FolderGit2,
  FileCheck2,
  Ruler,
  Receipt,
  FileBadge,
  Camera,
  TrendingUp,
  CreditCard,
  Bell,
  User,
  HelpCircle,
  LogOut,
  MapPin,
  ClipboardList,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Building2,
  Users,
  Compass,
  FileSearch,
  Scale,
  GitBranch,
  Coins,
  History,
  FolderArchive,
  DownloadCloud,
  Sliders,
  Terminal,
  Layers,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { role, activeView, setActiveView, logout, user, setIsVerificationModalOpen } = useAuth();
  const isFullyVerified = !!(user?.isEmailVerified && user?.isMobileVerified);

  const getNavItems = (): NavItem[] => {
    switch (role) {
      case UserRole.CONTRACTOR:
        return [
          { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
          { id: 'my-projects', label: '2. My Projects', icon: FolderGit2, badge: '3' },
          { id: 'work-orders', label: '3. Awarded Work Orders', icon: FileCheck2 },
          { id: 'measurements', label: '4. E-MB / Measurements', icon: Ruler, badge: '1' },
          { id: 'invoices', label: '5. Bills & Invoices', icon: Receipt },
          { id: 'certificates', label: '6. Material Test Certificates', icon: FileBadge },
          { id: 'site-evidence', label: '7. Site Evidence', icon: Camera },
          { id: 'work-progress', label: '8. Work Progress', icon: TrendingUp },
          { id: 'payments', label: '9. Payments', icon: CreditCard },
          { id: 'notifications', label: '10. Notifications', icon: Bell },
          { id: 'profile', label: '11. Profile', icon: User },
          { id: 'help', label: '12. Help & Guidelines', icon: HelpCircle },
        ];

      case UserRole.PWD_ENGINEER:
        return [
          { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
          { id: 'project-monitoring', label: '2. Project Monitoring', icon: FolderGit2 },
          { id: 'field-verification', label: '3. Field Verification', icon: MapPin, badge: 'Priority', badgeColor: 'bg-rose-100 text-rose-800' },
          { id: 'technical-sanctions', label: '4. Technical Sanctions', icon: FileCheck2 },
          { id: 'work-orders', label: '5. Work Orders', icon: ClipboardList },
          { id: 'emb-verification', label: '6. E-MB Verification', icon: Ruler, badge: '1', badgeColor: 'bg-amber-100 text-amber-800' },
          { id: 'bill-verification', label: '7. Bill Verification', icon: Receipt },
          { id: 'certificates', label: '8. Material Test Certificates', icon: FileBadge },
          { id: 'site-inspections', label: '9. Site Inspections', icon: Camera },
          { id: 'physical-progress', label: '10. Physical Progress', icon: TrendingUp },
          { id: 'financial-progress', label: '11. Financial Progress', icon: Coins },
          { id: 'contractor-perf', label: '12. Contractor Performance', icon: Users },
          { id: 'ai-risk-alerts', label: '13. AI Risk Alerts', icon: ShieldAlert, badge: '2', badgeColor: 'bg-rose-100 text-rose-800' },
          { id: 'anomaly-alerts', label: '14. Anomaly Alerts', icon: AlertTriangle },
          { id: 'evidence', label: '15. Evidence Repository', icon: FolderArchive },
          { id: 'reports', label: '16. Reports', icon: FileText },
          { id: 'notifications', label: '17. Notifications', icon: Bell },
          { id: 'profile', label: '18. Profile', icon: User },
        ];

      case UserRole.COLLECTOR:
        return [
          { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
          { id: 'district-overview', label: '2. District Overview', icon: Building2 },
          { id: 'admin-sanctions', label: '3. Administrative Sanctions', icon: FileCheck2 },
          { id: 'project-monitoring', label: '4. Project Monitoring', icon: FolderGit2 },
          { id: 'fund-utilization', label: '5. Fund Utilization', icon: Coins },
          { id: 'financial-progress', label: '6. Financial Progress', icon: CreditCard },
          { id: 'physical-progress', label: '7. Physical Progress', icon: TrendingUp },
          { id: 'high-risk-projects', label: '8. High-Risk Projects', icon: ShieldAlert, badge: 'Critical', badgeColor: 'bg-rose-100 text-rose-800' },
          { id: 'ai-risk-dashboard', label: '9. AI Risk Dashboard', icon: Compass },
          { id: 'anomaly-alerts', label: '10. Anomaly Alerts', icon: AlertTriangle },
          { id: 'delayed-works', label: '11. Delayed Works', icon: History },
          { id: 'fund-holds', label: '12. Fund Holds', icon: Scale },
          { id: 'inquiry-directives', label: '13. Inquiry Directives', icon: FileSearch, badge: 'Active' },
          { id: 'contractor-risk', label: '14. Contractor Risk', icon: Users },
          { id: 'geographic-map', label: '15. Geographic Map', icon: MapPin },
          { id: 'evidence', label: '16. Evidence Repository', icon: FolderArchive },
          { id: 'reports', label: '17. Reports', icon: FileText },
          { id: 'notifications', label: '18. Notifications', icon: Bell },
          { id: 'profile', label: '19. Profile', icon: User },
        ];

      case UserRole.CAG_AUDITOR:
        return [
          { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
          { id: 'audit-overview', label: '2. Audit Overview', icon: FileSearch },
          { id: 'audit-cases', label: '3. Audit Cases', icon: Scale, badge: '2 Open', badgeColor: 'bg-rose-100 text-rose-800' },
          { id: 'financial-traceability', label: '4. Financial Traceability', icon: GitBranch, badge: 'Visual' },
          { id: 'invoice-mapping', label: '5. Invoice-Payment Mapping', icon: Receipt },
          { id: 'duplicate-payments', label: '6. Duplicate Payments', icon: CreditCard },
          { id: 'duplicate-works', label: '7. Duplicate Works', icon: Layers, badge: '91% Match', badgeColor: 'bg-rose-100 text-rose-800' },
          { id: 'cost-anomalies', label: '8. Cost Anomalies', icon: TrendingUp },
          { id: 'payment-mismatch', label: '9. Payment-Progress Mismatch', icon: AlertTriangle },
          { id: 'contractor-risk', label: '10. Contractor Risk Indicators', icon: Users },
          { id: 'geographic-anomalies', label: '11. Geographic Anomalies', icon: MapPin },
          { id: 'historical-analysis', label: '12. Historical Analysis', icon: History },
          { id: 'evidence-repo', label: '13. Evidence Repository', icon: FolderArchive },
          { id: 'audit-trail', label: '14. Audit Trail', icon: Terminal },
          { id: 'ai-risk-scores', label: '15. AI Risk Scores', icon: ShieldAlert },
          { id: 'audit-reports', label: '16. Generate Audit Report', icon: FileText },
          { id: 'evidence-pack', label: '17. Export Evidence Pack', icon: DownloadCloud },
          { id: 'case-management', label: '18. Case Management', icon: ClipboardList },
          { id: 'notifications', label: '19. Notifications', icon: Bell },
          { id: 'profile', label: '20. Profile', icon: User },
        ];

      case UserRole.ADMIN:
      default:
        return [
          { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
          { id: 'national-overview', label: '2. National Overview', icon: Globe2 },
          { id: 'state-monitoring', label: '3. State Monitoring', icon: Building2 },
          { id: 'district-monitoring', label: '4. District Monitoring', icon: MapPin },
          { id: 'project-monitoring', label: '5. Project Monitoring', icon: FolderGit2 },
          { id: 'fund-analytics', label: '6. Fund Analytics', icon: Coins },
          { id: 'ai-risk-overview', label: '7. AI Risk Overview', icon: ShieldAlert },
          { id: 'anomaly-detection', label: '8. Anomaly Detection', icon: AlertTriangle, badge: 'Live' },
          { id: 'high-risk-projects', label: '9. High-Risk Projects', icon: Scale },
          { id: 'delayed-projects', label: '10. Delayed Projects', icon: History },
          { id: 'contractor-risk', label: '11. Contractor Risk', icon: Users },
          { id: 'geographic-risk-map', label: '12. Geographic Risk Map', icon: MapPin },
          { id: 'financial-analytics', label: '13. Financial Analytics', icon: CreditCard },
          { id: 'progress-analytics', label: '14. Physical Progress Analytics', icon: TrendingUp },
          { id: 'audit-monitoring', label: '15. Audit Monitoring', icon: FileSearch },
          { id: 'user-management', label: '16. User Management', icon: Users },
          { id: 'role-management', label: '17. Role Management', icon: Sliders },
          { id: 'system-config', label: '18. System Configuration', icon: Sliders },
          { id: 'reports', label: '19. Reports', icon: FileText },
          { id: 'notifications', label: '20. Notifications', icon: Bell },
          { id: 'system-logs', label: '21. System Logs', icon: Terminal },
          { id: 'profile', label: '22. Profile', icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900/60 text-blue-300 border border-blue-700 flex items-center justify-center font-black text-sm">
              AX
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                {role ? role.replace('_', ' ') : 'WORKSPACE'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">MPLADS Active Session</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 touch-manipulation min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close navigation drawer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Status Banner in Sidebar */}
        <div className="px-3 pt-3">
          <div
            onClick={() => setIsVerificationModalOpen(true)}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              isFullyVerified
                ? 'bg-emerald-950/60 border-emerald-800/80 hover:bg-emerald-900/60 text-emerald-200'
                : 'bg-amber-950/60 border-amber-800/80 hover:bg-amber-900/60 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isFullyVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="text-[11px] font-bold text-white">
                  {isFullyVerified ? 'Verified Officer' : 'Verification Action'}
                </span>
              </div>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  isFullyVerified
                    ? 'bg-emerald-800 text-emerald-100'
                    : 'bg-amber-800 text-amber-100'
                }`}
              >
                {isFullyVerified ? 'Active' : 'Pending'}
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-1 leading-tight">
              {isFullyVerified
                ? 'Email & Mobile authenticated'
                : 'Complete Email & Mobile verification'}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0 ${
                      item.badgeColor || 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
