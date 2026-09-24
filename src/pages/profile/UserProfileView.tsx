import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { calculatePasswordStrength } from '../auth/AuthPages';
import { UserRole } from '../../types';
import {
  User,
  Mail,
  Smartphone,
  Building,
  ShieldCheck,
  KeyRound,
  Laptop,
  Smartphone as PhoneIcon,
  LogOut,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  History,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const {
    user,
    role,
    updateProfile,
    changePassword,
    toggle2FA,
    activeSessions,
    revokeSession,
    revokeAllOtherSessions,
    logout,
    auditLogs,
    addToast,
    sessionTimeoutWarning,
    extendSession,
    setIsVerificationModalOpen,
    sendEmailVerificationOtp,
    verifyEmailOtp,
    sendMobileVerificationOtp,
    verifyMobileOtp,
  } = useAuth();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions' | 'audit'>('profile');

  // Inline verification testing states
  const [inlineEmailOtp, setInlineEmailOtp] = useState('');
  const [inlineMobileOtp, setInlineMobileOtp] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingMobile, setIsSendingMobile] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || '');
  const [editMobile, setEditMobile] = useState(user?.mobile || '');
  const [editDepartment, setEditDepartment] = useState(user?.department || '');
  const [editDesignation, setEditDesignation] = useState(user?.designation || '');

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA state
  const [isToggling2FA, setIsToggling2FA] = useState(false);

  if (!user) {
    return null;
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editMobile.replace(/\D/g, '').length !== 10) {
      addToast('error', 'Invalid Mobile', 'Mobile number must be exactly 10 digits.');
      return;
    }

    const ok = await updateProfile({
      fullName: editFullName,
      mobile: editMobile,
      department: editDepartment,
      designation: editDesignation,
    });

    if (ok) {
      setIsEditingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('error', 'Fields Required', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('error', 'Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    const strength = calculatePasswordStrength(newPassword);
    if (strength.score < 3) {
      addToast('error', 'Weak Password', 'New password must meet at least 3 security requirements.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      addToast('error', 'Update Failed', res.message);
    }
  };

  const handleToggle2FA = async () => {
    setIsToggling2FA(true);
    await toggle2FA(!user.twoFactorEnabled);
    setIsToggling2FA(false);
  };

  const roleLabelMap: Record<UserRole, string> = {
    [UserRole.CONTRACTOR]: 'Tender Contractor / Vendor',
    [UserRole.PWD_ENGINEER]: 'PWD Executive Engineer',
    [UserRole.COLLECTOR]: 'District Collector & Magistrate',
    [UserRole.CAG_AUDITOR]: 'CAG Principal Auditor',
    [UserRole.ADMIN]: 'Ministry / National Administrator',
  };

  // User's security logs
  const userAuditLogs = auditLogs
    .filter((log) => log.userId === user.id || log.category === 'AUTH')
    .slice(0, 8);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Session timeout warning banner */}
      {sessionTimeoutWarning && (
        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold text-sm">Security Inactivity Warning</p>
              <p className="text-xs text-amber-300/80">
                You have been idle. Your session will automatically lock in 5 minutes for compliance.
              </p>
            </div>
          </div>
          <button
            onClick={extendSession}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Extend Session
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-blue-700/20">
              {user.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {user.fullName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800">
                  {role ? role.replace('_', ' ') : 'USER'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.designation} • {user.department || user.organization || 'MPLADS Division'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                <span>ID: <code className="font-mono text-slate-700 font-bold">{user.id}</code></span>
                <span>•</span>
                <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Active now'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Verify ID (Email &amp; Mobile)</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Official Identity Verification Status Card */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
              <div>
                <h2 className="text-xs font-bold text-slate-900">
                  National Informatics Centre (NIC) &amp; CDAC Verification Status
                </h2>
                <p className="text-[11px] text-slate-500">
                  Two-factor cryptographic verification mandatory for official government works &amp; fund sanctions
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="px-3 py-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline self-start sm:self-auto"
            >
              Manage / Re-verify
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Email Status */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                user.isEmailVerified
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${user.isEmailVerified ? 'text-emerald-700' : 'text-amber-700'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Email Verification</span>
                  <span className="text-[11px] font-mono text-slate-600">{user.email}</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  user.isEmailVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {user.isEmailVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </>
                ) : (
                  'Pending'
                )}
              </span>
            </div>

            {/* Mobile Status */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between ${
                user.isMobileVerified
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${user.isMobileVerified ? 'text-emerald-700' : 'text-amber-700'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Mobile SMS Gateway</span>
                  <span className="text-[11px] font-mono text-slate-600">+91 {user.mobile}</span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  user.isMobileVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {user.isMobileVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </>
                ) : (
                  'Pending'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-100 pt-4 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile Particulars', icon: User },
            { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
            { id: 'sessions', label: 'Active Sessions', icon: Laptop },
            { id: 'audit', label: 'Account Audit Trail', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Profile Particulars */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Particulars
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Registered government identity and contact specifications
                </p>
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                >
                  Edit Particulars
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Full Name &amp; Title</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {user.fullName}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Official Email ID</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                    {user.email}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Official Mobile</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                    +91 {user.mobile}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Clearance Designation</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {user.designation}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Department / Agency</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {user.department || user.organization || 'General Administration'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-400 text-[11px] block">Jurisdiction Jurisdiction</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {user.district ? `${user.district} District, ` : ''}{user.state || 'National Level'}
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name &amp; Title
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Organization
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors shadow-sm"
                >
                  Save Profile Changes
                </button>
              </form>
            )}
          </div>

          {/* Role Access Matrix Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-700" />
              <span>Role Permissions Matrix</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your account is authorized as{' '}
              <strong className="text-slate-800">{roleLabelMap[role || UserRole.COLLECTOR]}</strong>.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Access to authorized role dashboard &amp; KPIs</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Inspect anomalies, geospatial maps &amp; bills</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Submit digitally signed verification actions</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 opacity-40" />
                <span>Foreign role administration restricted (RBAC Protected)</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Need elevation or cross-district clearance? Contact the MoSPI System Administrator.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Security & 2FA */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-700" />
                <span>Change Access Password</span>
              </h3>
              <p className="text-xs text-slate-500">
                Update your authentication password. Minimum 8 characters with numbers and symbols.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Strength Meter */}
              {newPassword && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Security Score:</span>
                    <span className="font-bold text-blue-700">
                      {calculatePasswordStrength(newPassword).label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${calculatePasswordStrength(newPassword).color} ${
                        calculatePasswordStrength(newPassword).width
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isUpdatingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Two-Factor Authentication (2FA) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Two-Factor Authentication (2FA)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add an extra layer of protection requiring a 6-digit OTP code on every login attempt.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  SMS / Email OTP Verification
                </span>
                <span className="text-[11px] text-slate-500">
                  {user.twoFactorEnabled
                    ? '2FA is active. Verification required on login.'
                    : 'Currently disabled. Only password is required.'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggle2FA}
                disabled={isToggling2FA}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  user.twoFactorEnabled ? 'bg-blue-700' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    user.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">
                Security Recommendations:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>2FA is strongly advised for District Collector and CAG Auditor clearances.</li>
                <li>OTPs are generated on-the-fly and valid for 5 minutes.</li>
                <li>In this demo environment, test codes are conveniently displayed in toast notifications.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-blue-700" />
                <span>Authorized Active Sessions</span>
              </h3>
              <p className="text-xs text-slate-500">
                Workstations and mobile devices currently logged into this official account
              </p>
            </div>
            {activeSessions.length > 1 && (
              <button
                onClick={revokeAllOtherSessions}
                className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors self-start sm:self-auto"
              >
                Revoke All Other Sessions
              </button>
            )}
          </div>

          <div className="space-y-3">
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  sess.isCurrent
                    ? 'border-blue-400/60 bg-blue-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      sess.isCurrent
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {sess.device.toLowerCase().includes('phone') || sess.device.toLowerCase().includes('tablet') ? (
                      <PhoneIcon className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {sess.device}
                      </span>
                      {sess.isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {sess.browser} • {sess.os}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span className="font-mono">{sess.ipAddress}</span>
                      <span>•</span>
                      <span>{sess.location}</span>
                      <span>•</span>
                      <span>Last active: {sess.lastActive}</span>
                    </div>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => revokeSession(sess.id)}
                    className="px-3 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    Terminate Session
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-700" />
              <span>Authentication &amp; Activity Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500">
              Immutable telemetry tracking login attempts, credential changes, and role clearance switches
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3 font-semibold">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3 font-semibold">Security Action</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Details</th>
                  <th className="py-2.5 px-3 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-[11px] text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '10.14.22.8'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
