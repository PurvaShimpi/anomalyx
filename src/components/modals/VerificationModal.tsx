import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RefreshCw,
  Copy,
  ExternalLink,
  Award,
  Download,
  KeyRound,
  Send,
  Sparkles,
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    sendEmailVerificationOtp,
    verifyEmailOtp,
    sendMobileVerificationOtp,
    verifyMobileOtp,
    addToast,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'both' | 'email' | 'mobile'>('both');

  // Email form state
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [simulatedEmailCode, setSimulatedEmailCode] = useState<string | null>(null);

  // Mobile form state
  const [mobileInput, setMobileInput] = useState(user?.mobile || '');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);
  const [simulatedMobileCode, setSimulatedMobileCode] = useState<string | null>(null);

  // Sync with current user info
  useEffect(() => {
    if (user) {
      setEmailInput(user.email);
      setMobileInput(user.mobile);
    }
  }, [user]);

  // Timers countdown
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (emailTimer > 0) {
      timerId = setTimeout(() => setEmailTimer(emailTimer - 1), 1000);
    }
    return () => clearTimeout(timerId);
  }, [emailTimer]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (mobileTimer > 0) {
      timerId = setTimeout(() => setMobileTimer(mobileTimer - 1), 1000);
    }
    return () => clearTimeout(timerId);
  }, [mobileTimer]);

  if (!isOpen || !user) return null;

  const isEmailVerified = !!user.isEmailVerified;
  const isMobileVerified = !!user.isMobileVerified;

  const verifiedCount = (isEmailVerified ? 1 : 0) + (isMobileVerified ? 1 : 0);
  const verificationPercent = verifiedCount * 50;

  // Handle Email OTP Send
  const handleSendEmailOtp = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      addToast('error', 'Invalid Email', 'Please provide a valid official email address.');
      return;
    }
    setIsSendingEmailOtp(true);
    const resp = await sendEmailVerificationOtp(emailInput);
    setIsSendingEmailOtp(false);
    if (resp.success) {
      setIsEmailOtpSent(true);
      setEmailTimer(30);
      setSimulatedEmailCode(resp.otp || '482910');
    }
  };

  // Handle Email OTP Verify
  const handleVerifyEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailOtp.trim()) {
      addToast('error', 'Required Field', 'Please enter the 6-digit OTP code.');
      return;
    }
    setIsVerifyingEmail(true);
    const resp = await verifyEmailOtp(emailOtp, emailInput);
    setIsVerifyingEmail(false);
    if (resp.success) {
      setEmailOtp('');
      setIsEmailOtpSent(false);
      setSimulatedEmailCode(null);
    }
  };

  // Handle Mobile OTP Send
  const handleSendMobileOtp = async () => {
    const clean = mobileInput.replace(/\D/g, '');
    if (clean.length < 10) {
      addToast('error', 'Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsSendingMobileOtp(true);
    const resp = await sendMobileVerificationOtp(clean);
    setIsSendingMobileOtp(false);
    if (resp.success) {
      setIsMobileOtpSent(true);
      setMobileTimer(30);
      setSimulatedMobileCode(resp.otp || '839201');
    }
  };

  // Handle Mobile OTP Verify
  const handleVerifyMobile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mobileOtp.trim()) {
      addToast('error', 'Required Field', 'Please enter the 6-digit OTP code.');
      return;
    }
    setIsVerifyingMobile(true);
    const resp = await verifyMobileOtp(mobileOtp, mobileInput);
    setIsVerifyingMobile(false);
    if (resp.success) {
      setMobileOtp('');
      setIsMobileOtpSent(false);
      setSimulatedMobileCode(null);
    }
  };

  // Quick Demo Auto-Verification (One-click complete test)
  const handleQuickDemoVerifyBoth = async () => {
    await verifyEmailOtp('123456', user.email);
    await verifyMobileOtp('123456', user.mobile);
    addToast('success', 'Both Verified', 'Email and Mobile have both been verified for this demo session.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-6">
        {/* Header with National Portal Branding */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5 border-b border-blue-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Officer Identity Verification System
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  NIC &amp; CDAC Gateway
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Two-point cryptographic verification for government records and MPLADS fund authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Summary Card */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full border-4 border-slate-200 flex items-center justify-center bg-white shadow-xs">
              <span className="text-xs font-black text-blue-900">{verificationPercent}%</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {verifiedCount === 2
                    ? 'Official Verification Complete'
                    : verifiedCount === 1
                    ? 'Partially Verified (1 of 2 Complete)'
                    : 'Unverified Official Account'}
                </span>
                {verifiedCount === 2 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                    Level-2 Officer Shield
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Officer: <strong className="text-slate-700">{user.fullName}</strong> • {user.designation}
              </p>
            </div>
          </div>

          {verifiedCount < 2 && (
            <button
              onClick={handleQuickDemoVerifyBoth}
              className="px-3 py-1.5 rounded-xl bg-blue-100/80 hover:bg-blue-200/80 text-blue-900 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-blue-200"
              title="Quickly mark both email & mobile as verified for demo testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>Auto-Verify Both (Demo)</span>
            </button>
          )}
        </div>

        {/* Modal Body: Dual Verification Panels */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Panel 1: Official Email Verification */}
            <div
              className={`rounded-2xl border p-5 transition-all ${
                isEmailVerified
                  ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isEmailVerified
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Email Verification</h3>
                    <p className="text-[11px] text-slate-500">Government e-Mail Gateway</p>
                  </div>
                </div>
                {isEmailVerified ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
              </div>

              {isEmailVerified ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-emerald-100 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified Email:</span>
                      <strong className="font-mono text-slate-900">{user.email}</strong>
                    </div>
                    <div className="flex justify-between mt-1 text-[11px] text-slate-400">
                      <span>Verified Timestamp:</span>
                      <span>
                        {user.emailVerifiedAt
                          ? new Date(user.emailVerifiedAt).toLocaleString()
                          : 'Recorded'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sendEmailVerificationOtp(user.email);
                      setIsEmailOtpSent(true);
                      setEmailTimer(30);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-verify or update official email address</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Government Email (.gov.in / .nic.in)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="officer@mplads.gov.in"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={isSendingEmailOtp || emailTimer > 0}
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        {isSendingEmailOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{emailTimer > 0 ? `Resend (${emailTimer}s)` : 'Send OTP'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Incoming Email Notification Banner */}
                  {simulatedEmailCode && (
                    <div className="p-3.5 rounded-xl bg-sky-950/90 border-2 border-sky-500/70 text-xs space-y-1.5 animate-in fade-in shadow-lg shadow-sky-950/50">
                      <div className="flex items-center justify-between text-sky-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-sky-400" />
                          <span className="text-sky-300">Simulated Email Gateway (Inbox Pop-up)</span>
                        </span>
                        <span className="font-mono text-sm bg-sky-400 text-slate-950 px-2.5 py-0.5 rounded-lg font-black tracking-wider shadow-sm">
                          {simulatedEmailCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-100 leading-snug font-medium">
                        Subject: MPLADS Officer Security Verification Code for {emailInput}.
                      </p>
                      <button
                        type="button"
                        onClick={() => setEmailOtp(simulatedEmailCode)}
                        className="text-[11px] font-bold text-sky-400 hover:text-sky-200 underline flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Click to Auto-fill Code ({simulatedEmailCode})</span>
                      </button>
                    </div>
                  )}

                  {/* Email OTP Input form */}
                  {isEmailOtpSent && (
                    <form onSubmit={handleVerifyEmail} className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit code"
                          className="flex-1 px-3 py-2 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isVerifyingEmail || emailOtp.length < 6}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-xs"
                        >
                          {isVerifyingEmail ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Verify Email</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Panel 2: Official Mobile Verification (Gov SMS Gateway) */}
            <div
              className={`rounded-2xl border p-5 transition-all ${
                isMobileVerified
                  ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isMobileVerified
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Mobile Verification</h3>
                    <p className="text-[11px] text-slate-500">Gov CDAC SMS Gateway</p>
                  </div>
                </div>
                {isMobileVerified ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
              </div>

              {isMobileVerified ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-emerald-100 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Verified Mobile:</span>
                      <strong className="font-mono text-slate-900">+91 {user.mobile}</strong>
                    </div>
                    <div className="flex justify-between mt-1 text-[11px] text-slate-400">
                      <span>Verified Timestamp:</span>
                      <span>
                        {user.mobileVerifiedAt
                          ? new Date(user.mobileVerifiedAt).toLocaleString()
                          : 'Recorded'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sendMobileVerificationOtp(user.mobile);
                      setIsMobileOtpSent(true);
                      setMobileTimer(30);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Update mobile number or re-authenticate</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Registered 10-Digit Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-2.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 text-slate-600">
                        +91
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="9822012345"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSendMobileOtp}
                        disabled={isSendingMobileOtp || mobileTimer > 0}
                        className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-700 hover:bg-blue-800 text-white transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        {isSendingMobileOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{mobileTimer > 0 ? `Resend (${mobileTimer}s)` : 'Send SMS'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Simulated Incoming SMS Notification Banner */}
                  {simulatedMobileCode && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/90 border-2 border-emerald-500/70 text-xs space-y-1.5 animate-in fade-in shadow-lg shadow-emerald-950/50">
                      <div className="flex items-center justify-between text-emerald-300 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-300">Simulated SMS (Gov CDAC Gateway Pop-up)</span>
                        </span>
                        <span className="font-mono text-sm bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-lg font-black tracking-wider shadow-sm">
                          {simulatedMobileCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100 leading-snug font-mono">
                        "Your MoSPI MPLADS Verification OTP is {simulatedMobileCode}. Do not share with anyone. - NIC/CDAC"
                      </p>
                      <button
                        type="button"
                        onClick={() => setMobileOtp(simulatedMobileCode)}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-200 underline flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Click to Auto-fill Code ({simulatedMobileCode})</span>
                      </button>
                    </div>
                  )}

                  {/* Mobile OTP Input form */}
                  {isMobileOtpSent && (
                    <form onSubmit={handleVerifyMobile} className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Enter 6-Digit SMS Verification Code
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={mobileOtp}
                          onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit code"
                          className="flex-1 px-3 py-2 text-sm font-mono tracking-widest text-center rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isVerifyingMobile || mobileOtp.length < 6}
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-xs"
                        >
                          {isVerifyingMobile ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Verify Mobile</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Verification Certificate (Shown when both are verified) */}
          {isEmailVerified && isMobileVerified && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      National MPLADS Digital Verification Certificate
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Compliant with Information Technology Act &amp; MoSPI Security Guidelines
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    addToast(
                      'info',
                      'Certificate Downloaded',
                      'Digital Verification Certificate VER-MPLADS-2026-X8921 generated.'
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-blue-700" />
                  <span>Download Digital Seal Slip</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Official Token
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    VER-2026-X8921
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Gov Channel
                  </span>
                  <span className="font-bold text-emerald-700 text-[11px]">NIC + CDAC SMS</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Authority Level
                  </span>
                  <span className="font-bold text-blue-800 text-[11px]">Tier-2 Authorized</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Disbursement Sign
                  </span>
                  <span className="font-bold text-emerald-700 text-[11px]">Active Clearance</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            For technical support regarding NIC / CDAC gateways, contact <code className="text-blue-700 font-bold">mplads-support@nic.in</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
