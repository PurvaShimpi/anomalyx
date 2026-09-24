import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { INITIAL_PROJECTS, INITIAL_AI_ALERTS } from '../../server/db';
import {
  ShieldAlert,
  Bell,
  LogOut,
  Search,
  Menu,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  User,
  Check,
  FolderGit2,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface TopNavbarProps {
  onToggleMobileSidebar?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileSidebar }) => {
  const {
    user,
    role,
    logout,
    setActiveView,
    setSelectedProjectId,
    setSelectedAlertId,
    setIsVerificationModalOpen,
    switchDemoRole,
    addToast,
  } = useAuth();

  // Popover state
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Unread notifications tracker
  const [hasUnread, setHasUnread] = useState(true);

  // Refs for outside click handling
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotificationMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(target)) {
        setShowRoleMenu(false);
      }
      if (userRef.current && !userRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotificationMenu(false);
        setShowRoleMenu(false);
        setShowUserMenu(false);
        setShowSearchResults(false);
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const roleMeta: Record<
    UserRole,
    {
      shortLabel: string;
      fullLabel: string;
      badgeStyle: string;
      activeStyle: string;
      dept: string;
      portalDesc: string;
    }
  > = {
    [UserRole.CONTRACTOR]: {
      shortLabel: 'Contractor',
      fullLabel: 'Tender Contractor / Vendor',
      badgeStyle: 'bg-emerald-950/80 text-emerald-200 border-emerald-800',
      activeStyle: 'bg-emerald-600 text-white',
      dept: 'Patil Infrastructure Pvt Ltd',
      portalDesc: 'Submit E-MB measurements, bills, and test certificates',
    },
    [UserRole.PWD_ENGINEER]: {
      shortLabel: 'PWD Engineer',
      fullLabel: 'PWD Executive Engineer',
      badgeStyle: 'bg-blue-950/80 text-blue-200 border-blue-800',
      activeStyle: 'bg-blue-600 text-white',
      dept: 'Division 2, Nashik',
      portalDesc: 'Verify site milestones, MB entries, and bill claims',
    },
    [UserRole.COLLECTOR]: {
      shortLabel: 'District Collector',
      fullLabel: 'District Collector / Magistrate',
      badgeStyle: 'bg-purple-950/80 text-purple-200 border-purple-800',
      activeStyle: 'bg-purple-600 text-white',
      dept: 'District Magistrate Office, Nashik',
      portalDesc: 'Sanctions, inquiry directives, fund utilization oversight',
    },
    [UserRole.CAG_AUDITOR]: {
      shortLabel: 'CAG Auditor',
      fullLabel: 'CAG Principal Auditor',
      badgeStyle: 'bg-amber-950/80 text-amber-200 border-amber-800',
      activeStyle: 'bg-amber-600 text-white',
      dept: 'Comptroller & Auditor General of India',
      portalDesc: 'Statutory audit, forensic trace, duplicate coordinates',
    },
    [UserRole.ADMIN]: {
      shortLabel: 'National Admin',
      fullLabel: 'Ministry / National Admin',
      badgeStyle: 'bg-rose-950/80 text-rose-200 border-rose-800',
      activeStyle: 'bg-rose-600 text-white',
      dept: 'MoSPI / MPLADS Division, GoI',
      portalDesc: 'National analytics, system telemetry, audit trail',
    },
  };

  const getRoleNotifications = () => {
    switch (role) {
      case UserRole.CONTRACTOR:
        return [
          {
            id: 'notif-c1',
            title: 'Payment Released',
            time: '2h ago',
            desc: '₹11.16L processed for Satara Road (P105).',
            projectId: 'proj-p105',
          },
          {
            id: 'notif-c2',
            title: 'E-MB Returned',
            time: '1d ago',
            desc: 'Roof steel measurement returned for re-verification.',
            projectId: 'proj-p102',
          },
          {
            id: 'notif-c3',
            title: 'Inspection Scheduled',
            time: '2d ago',
            desc: 'Executive engineer site visit scheduled for Friday.',
            projectId: 'proj-p101',
          },
        ];
      case UserRole.PWD_ENGINEER:
        return [
          {
            id: 'notif-p1',
            title: 'Bill Verification Pending',
            time: '1h ago',
            desc: 'INV-2026-015 submitted for Project P102.',
            projectId: 'proj-p102',
            alertId: 'alt-102-crit',
          },
          {
            id: 'notif-p2',
            title: 'Critical Risk Alert',
            time: '3h ago',
            desc: 'Physical progress mismatch flagged on Niphad Hall.',
            alertId: 'alt-102-crit',
          },
          {
            id: 'notif-p3',
            title: 'Material Certificate Approved',
            time: '1d ago',
            desc: 'Cement Grade 53 batch certified for P101.',
            projectId: 'proj-p101',
          },
        ];
      case UserRole.COLLECTOR:
        return [
          {
            id: 'notif-col1',
            title: 'High Risk Alert: Niphad Community Hall',
            time: '30m ago',
            desc: 'Project P102 requires immediate inquiry directive.',
            alertId: 'alt-102-crit',
          },
          {
            id: 'notif-col2',
            title: 'Duplicate Project Work Detected',
            time: '4h ago',
            desc: 'P108 potential overlap with P102 coordinates.',
            alertId: 'alt-102-dup',
          },
          {
            id: 'notif-col3',
            title: 'Quarterly Expenditure Due',
            time: '1d ago',
            desc: 'District expenditure report ready for DM approval.',
            projectId: 'proj-p104',
          },
        ];
      case UserRole.CAG_AUDITOR:
        return [
          {
            id: 'notif-a1',
            title: 'Audit Dossier Compiled',
            time: '10m ago',
            desc: 'Forensic evidence pack ready for P102 case.',
            alertId: 'alt-102-crit',
          },
          {
            id: 'notif-a2',
            title: 'Unmatched Payment Trace',
            time: '5h ago',
            desc: 'PFMS voucher discrepancy detected in Aurangabad.',
            projectId: 'proj-p103',
          },
          {
            id: 'notif-a3',
            title: 'Geographic Overlap Flag',
            time: '1d ago',
            desc: '2 projects within 45m radius flagged in Dindori.',
            alertId: 'alt-102-dup',
          },
        ];
      case UserRole.ADMIN:
      default:
        return [
          {
            id: 'notif-adm1',
            title: 'National Alert Summary',
            time: '15m ago',
            desc: '4 High/Critical anomalies flagged in Maharashtra.',
            alertId: 'alt-102-crit',
          },
          {
            id: 'notif-adm2',
            title: 'Pipeline Sync Completed',
            time: '1h ago',
            desc: 'PFMS & GIS telemetry data refreshed across 12 states.',
            projectId: 'proj-p101',
          },
          {
            id: 'notif-adm3',
            title: 'New Official Provisioned',
            time: '3h ago',
            desc: 'PWD Executive Engineer credentials issued for Nashik.',
            projectId: 'proj-p102',
          },
        ];
    }
  };

  const notifications = getRoleNotifications();
  const isFullyVerified = !!(user?.isEmailVerified && user?.isMobileVerified);

  // Search matching logic
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredProjects = trimmedQuery
    ? INITIAL_PROJECTS.filter(
        (p) =>
          p.code.toLowerCase().includes(trimmedQuery) ||
          p.name.toLowerCase().includes(trimmedQuery) ||
          p.district.toLowerCase().includes(trimmedQuery) ||
          p.category.toLowerCase().includes(trimmedQuery) ||
          p.contractorName.toLowerCase().includes(trimmedQuery) ||
          p.mpName.toLowerCase().includes(trimmedQuery)
      ).slice(0, 5)
    : [];

  const filteredAlerts = trimmedQuery
    ? INITIAL_AI_ALERTS.filter(
        (a) =>
          a.projectCode.toLowerCase().includes(trimmedQuery) ||
          a.title.toLowerCase().includes(trimmedQuery) ||
          a.alertType.toLowerCase().includes(trimmedQuery) ||
          a.description.toLowerCase().includes(trimmedQuery)
      ).slice(0, 3)
    : [];

  const handleSelectProject = (projectId: string) => {
    setActiveView('dashboard');
    setSelectedProjectId(projectId);
    setSearchQuery('');
    setShowSearchResults(false);
    setShowMobileSearch(false);
  };

  const handleSelectAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    setSearchQuery('');
    setShowSearchResults(false);
    setShowMobileSearch(false);
  };

  const handleSwitchRole = (newRole: UserRole) => {
    switchDemoRole(newRole);
    setShowRoleMenu(false);
    setShowUserMenu(false);
    setActiveView('dashboard');
    addToast('info', 'Workspace Switched', `Active view updated to ${roleMeta[newRole].fullLabel}`);
  };

  const handleNotificationClick = (notif: { projectId?: string; alertId?: string }) => {
    setShowNotificationMenu(false);
    if (notif.alertId) {
      setSelectedAlertId(notif.alertId);
    } else if (notif.projectId) {
      setActiveView('dashboard');
      setSelectedProjectId(notif.projectId);
    }
  };

  const currentRoleInfo = role ? roleMeta[role] : roleMeta[UserRole.ADMIN];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xs text-white" id="top-navbar">
      <div className="px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left branding & mobile toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700"
              title="Toggle Navigation Menu"
              aria-label="Toggle navigation menu"
              id="mobile-nav-toggle-btn"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
              title="Return to Primary Workspace Dashboard"
              id="navbar-brand-btn"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-slate-900 flex items-center justify-center text-white font-black shadow-xs shrink-0 group-hover:shadow-md transition-shadow">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white tracking-wider text-sm sm:text-base leading-none">
                    ANOMALY<span className="text-blue-400">X</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700">
                    MPLADS
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium hidden sm:block leading-tight mt-0.5">
                  Ministry of Statistics &amp; Programme Implementation
                </p>
              </div>
            </button>
          </div>

          {/* Center Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-2 lg:mx-4 relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search works (e.g. P102), district, contractor, alerts..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-800/80 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition-all"
                id="desktop-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Search Results Dropdown */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden z-50 text-xs animate-in fade-in-50 duration-150">
                <div className="p-2 border-b border-slate-800 flex items-center justify-between bg-slate-800/80 text-[11px] text-slate-300 font-medium">
                  <span>
                    Search results for &quot;<span className="font-semibold text-white">{searchQuery}</span>&quot;
                  </span>
                  <button
                    onClick={() => setShowSearchResults(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Close (Esc)
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                  {/* Projects Section */}
                  {filteredProjects.length > 0 && (
                    <div className="p-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Development Works ({filteredProjects.length})
                      </div>
                      {filteredProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProject(p.id)}
                          className="px-3 py-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono font-bold text-[11px] bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded border border-slate-700">
                                {p.code}
                              </span>
                              <span className="font-semibold text-white truncate">
                                {p.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate mt-0.5">
                              {p.district}, {p.state} • {p.contractorName}
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                p.riskLevel === 'CRITICAL'
                                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                  : p.riskLevel === 'HIGH'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {p.riskLevel}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Alerts Section */}
                  {filteredAlerts.length > 0 && (
                    <div className="p-1">
                      <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        AI Risk Flags ({filteredAlerts.length})
                      </div>
                      {filteredAlerts.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => handleSelectAlert(a.id)}
                          className="px-3 py-2 rounded-xl hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="font-semibold text-white truncate">
                                {a.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 truncate mt-0.5">
                              Work {a.projectCode} • Risk Score: {a.riskScore}/100 • {a.riskLevel}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                              View Alert
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length === 0 && filteredAlerts.length === 0 && (
                    <div className="p-6 text-center text-slate-400">
                      <FolderGit2 className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                      <p className="font-medium text-xs text-white">No matching projects or alerts found</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Try searching for project code &quot;P102&quot;, &quot;Nashik&quot;, &quot;Patil&quot;, or &quot;Hall&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors touch-manipulation min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700"
              title="Search Projects"
              aria-label="Open search bar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Email & Mobile Verification Status Trigger */}
            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all touch-manipulation min-h-[38px] ${
                isFullyVerified
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800 hover:bg-emerald-900/80'
                  : 'bg-amber-950/80 text-amber-200 border-amber-800 hover:bg-amber-900/80 animate-pulse'
              }`}
              title="Click to view or complete Email and Mobile Number verification"
              id="navbar-verification-btn"
            >
              {isFullyVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Verified:</span>
                  <span className="font-bold hidden sm:inline">Email &amp; Mobile</span>
                  <span className="font-bold sm:hidden">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-bold hidden sm:inline">Verify Email &amp; Mobile</span>
                  <span className="font-bold sm:hidden">Verify</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-amber-800 text-amber-100 font-black hidden md:inline">
                    Action
                  </span>
                </>
              )}
            </button>

            {/* Quick Role Switcher Dropdown */}
            <div className="relative" ref={roleRef}>
              <button
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all touch-manipulation min-h-[38px] ${currentRoleInfo.badgeStyle} hover:shadow-xs`}
                title="Switch Stakeholder Role (Demo / Official Workspace)"
                aria-expanded={showRoleMenu}
                id="navbar-role-switcher-btn"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold hidden xl:inline">{currentRoleInfo.fullLabel.split('/')[0]}</span>
                <span className="font-bold xl:hidden">{currentRoleInfo.shortLabel}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 rounded-2xl shadow-xl border border-slate-700 py-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">Switch Stakeholder Role</span>
                      <span className="text-[10px] text-slate-400">Select an official portal perspective</span>
                    </div>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  </div>

                  <div className="py-1">
                    {Object.values(UserRole).map((r) => {
                      const isCurrent = role === r;
                      const meta = roleMeta[r];
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSwitchRole(r)}
                          className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-800 transition-colors ${
                            isCurrent ? 'bg-slate-800/80 font-bold' : ''
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isCurrent ? meta.activeStyle : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {isCurrent ? <Check className="w-3 h-3 text-white" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-white truncate">
                                {meta.fullLabel}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-800">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-300 truncate mt-0.5">{meta.dept}</p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{meta.portalDesc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Menu */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors touch-manipulation min-h-[38px] min-w-[38px] flex items-center justify-center border border-slate-700"
                title="Notifications"
                aria-label="View notifications"
                aria-expanded={showNotificationMenu}
                id="navbar-notifications-btn"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-900 animate-pulse" />
                )}
              </button>

              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-72 sm:w-84 max-w-[calc(100vw-1.5rem)] bg-slate-900 rounded-2xl shadow-xl border border-slate-700 py-2 z-50 animate-in fade-in-50 duration-150">
                  <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Official Alerts &amp; Directives
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Targeted to: {currentRoleInfo.shortLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          addToast('success', 'Payment Disbursed (P105)', '₹11.16 Lakh processed with bank reconciliation match.');
                          setTimeout(() => addToast('warning', 'Site Inspection Pending', 'Executive Engineer review due within 48 hours for Satara bypass.'), 250);
                          setTimeout(() => addToast('error', 'Geofence Breach Detected', 'Geo-tagging location variance exceeded 250m on P103 inspection.'), 500);
                          setTimeout(() => addToast('info', 'MoSPI Circular Issued', 'New physical verification guidelines applicable for FY 2026-27.'), 750);
                        }}
                        className="text-[10px] text-sky-400 hover:text-sky-300 font-bold px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/80 transition-colors"
                        title="Trigger demo pop-up messages to preview all colors"
                      >
                        Test Pop-ups
                      </button>
                      {hasUnread ? (
                        <button
                          type="button"
                          onClick={() => {
                            setHasUnread(false);
                            addToast('info', 'Notifications Marked', 'All current notifications marked as read.');
                          }}
                          className="text-[10px] text-slate-400 hover:text-white font-medium"
                        >
                          Mark all read
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">All read</span>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => {
                      // Determine notification category & text colors
                      const titleLower = notif.title.toLowerCase();
                      const isError = titleLower.includes('return') || titleLower.includes('breach') || titleLower.includes('delay') || titleLower.includes('alert') || titleLower.includes('inquiry');
                      const isSuccess = titleLower.includes('released') || titleLower.includes('payment') || titleLower.includes('approved') || titleLower.includes('verified');
                      const isWarning = titleLower.includes('inspection') || titleLower.includes('pending') || titleLower.includes('scheduled') || titleLower.includes('audit');

                      let titleColor = 'text-sky-400';
                      let descColor = 'text-sky-200/90';
                      let badgeStyle = 'bg-sky-950 text-sky-300 border-sky-800';
                      let badgeText = 'NOTICE';
                      let actionColor = 'text-sky-400 hover:text-sky-300';

                      if (isError) {
                        titleColor = 'text-rose-400';
                        descColor = 'text-rose-200/90';
                        badgeStyle = 'bg-rose-950 text-rose-300 border-rose-800';
                        badgeText = 'CRITICAL';
                        actionColor = 'text-rose-400 hover:text-rose-300';
                      } else if (isSuccess) {
                        titleColor = 'text-emerald-400';
                        descColor = 'text-emerald-200/90';
                        badgeStyle = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                        badgeText = 'SETTLED';
                        actionColor = 'text-emerald-400 hover:text-emerald-300';
                      } else if (isWarning) {
                        titleColor = 'text-amber-400';
                        descColor = 'text-amber-200/90';
                        badgeStyle = 'bg-amber-950 text-amber-300 border-amber-800';
                        badgeText = 'SCHEDULED';
                        actionColor = 'text-amber-400 hover:text-amber-300';
                      }

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className="px-3.5 py-2.5 hover:bg-slate-800/80 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-1.5 min-w-0 pr-2">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${badgeStyle}`}>
                                {badgeText}
                              </span>
                              <span className={`truncate ${titleColor}`}>{notif.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal shrink-0">{notif.time}</span>
                          </div>
                          <p className={`text-[11px] mt-1 leading-snug font-medium pl-0.5 ${descColor}`}>
                            {notif.desc}
                          </p>
                          <div className={`mt-1.5 flex items-center gap-1 text-[10px] font-bold ${actionColor}`}>
                            <span>Take action</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="px-3.5 py-2 border-t border-slate-800 bg-slate-800/50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Audit trail backed</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationMenu(false);
                        setActiveView('notifications');
                      }}
                      className="text-blue-400 font-bold hover:underline"
                    >
                      View All in Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Account Menu */}
            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors touch-manipulation min-h-[38px]"
                title="User Profile and Account Menu"
                aria-expanded={showUserMenu}
                id="navbar-user-profile-btn"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left max-w-[110px] truncate">
                  <div className="text-xs font-bold text-white leading-tight truncate">
                    {user?.fullName || 'Official User'}
                  </div>
                  <div className="text-[10px] text-slate-300 truncate">
                    {user?.designation || currentRoleInfo.shortLabel}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block shrink-0" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-slate-900 rounded-2xl shadow-xl border border-slate-700 py-2 z-50 animate-in fade-in-50 duration-150">
                  {/* User Profile Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-9 h-9 rounded-xl bg-blue-700 text-white font-bold text-sm flex items-center justify-center">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {user?.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] pt-1 border-t border-slate-700/60">
                      <span className="text-slate-400">Official Mobile:</span>
                      <span className="font-mono font-medium text-slate-200">{user?.mobile}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">2FA Security:</span>
                      <span
                        className={`font-semibold ${
                          user?.twoFactorEnabled ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {user?.twoFactorEnabled ? 'Enabled (Active)' : 'Not Configured'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setActiveView('profile');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile &amp; Security Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsVerificationModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                      <span>Email &amp; Mobile Verification</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/50 flex items-center gap-2"
                      id="navbar-logout-btn"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out / Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input Drawer (When toggled on mobile) */}
        {showMobileSearch && (
          <div className="md:hidden mt-2 pt-2 border-t border-slate-800 relative" ref={mobileSearchRef}>
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search works (e.g. P102), district, contractor..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-700 bg-slate-800 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                id="mobile-search-input"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="mt-2 bg-slate-900 rounded-xl shadow-lg border border-slate-700 overflow-hidden text-xs max-h-64 overflow-y-auto">
                {filteredProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="p-2.5 border-b border-slate-800 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {p.code} - {p.name}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {p.district} • {p.contractorName}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      View
                    </span>
                  </div>
                ))}
                {filteredAlerts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => handleSelectAlert(a.id)}
                    className="p-2.5 border-b border-slate-800 hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {a.title}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Work {a.projectCode} • Risk: {a.riskLevel}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      Alert
                    </span>
                  </div>
                ))}
                {filteredProjects.length === 0 && filteredAlerts.length === 0 && (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No matching records found.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
