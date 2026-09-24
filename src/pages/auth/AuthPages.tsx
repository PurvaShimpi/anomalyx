import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Lock,
  Mail,
  User as UserIcon,
  Building,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  FileText,
  BadgeCheck,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export interface AuthPagesProps {
  initialMode?: 'login' | 'signup' | 'forgot-password';
  onGoHome: () => void;
}

// Password strength evaluator
export const calculatePasswordStrength = (pass: string) => {
  const hasMinLength = pass.length >= 8;
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);

  const score = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let label = 'Very Weak';
  let color = 'bg-rose-500 text-rose-500';
  let width = 'w-1/5';

  if (score === 2) {
    label = 'Weak';
    color = 'bg-orange-500 text-orange-500';
    width = 'w-2/5';
  } else if (score === 3) {
    label = 'Medium';
    color = 'bg-amber-500 text-amber-500';
    width = 'w-3/5';
  } else if (score === 4) {
    label = 'Strong';
    color = 'bg-emerald-500 text-emerald-500';
    width = 'w-4/5';
  } else if (score === 5) {
    label = 'Very Strong';
    color = 'bg-emerald-600 text-emerald-600';
    width = 'w-full';
  }

  return { score, label, color, width, hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial };
};

export const AuthPages: React.FC<AuthPagesProps> = ({ initialMode = 'login', onGoHome }) => {
  const {
    login,
    loginWithOtp,
    register,
    requestOtp,
    verifyResetOtp,
    resetPassword,
    twoFactorPending,
    verify2FA,
    cancel2FA,
    switchDemoRole,
    addToast,
    registeredUsers,
    rememberMe,
    setRememberMe,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'mobile-otp' | 'email-otp'>('password');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('collector.nashik@mplads.gov.in');
  const [loginPassword, setLoginPassword] = useState('Demo@1234');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.COLLECTOR);
  const [loginOtp, setLoginOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // 2FA state
  const [twoFactorInput, setTwoFactorInput] = useState('');

  // Sign up form state
  const [signupStep, setSignupStep] = useState<'details' | 'otp'>('details');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>(UserRole.PWD_ENGINEER);
  const [signupDepartment, setSignupDepartment] = useState('');
  const [signupDesignation, setSignupDesignation] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupTermsAccepted, setSignupTermsAccepted] = useState(false);
  const [signupOtp, setSignupOtp] = useState('');
  const [signupSimulatedOtp, setSignupSimulatedOtp] = useState('');

  // Forgot / Reset Password state
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'new-password' | 'success'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotSimulatedOtp, setForgotSimulatedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Terms modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    if (loginMethod === 'password') {
      await login(loginIdentifier, loginPassword, selectedRole, rememberMe);
    } else {
      // Login with OTP
      if (!isOtpSent) {
        const res = await requestOtp(loginIdentifier, 'login');
        if (res.success) {
          setIsOtpSent(true);
          setOtpCountdown(30);
        }
      } else {
        if (!loginOtp.trim()) {
          addToast('error', 'OTP Required', 'Please enter the 6-digit verification code.');
          setIsLoading(false);
          return;
        }
        await loginWithOtp(loginIdentifier, loginOtp, rememberMe);
      }
    }
    setIsLoading(false);
  };

  // Handle 2FA verification submission
  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorInput.trim()) {
      addToast('error', 'Code Required', 'Please enter the 6-digit 2FA code.');
      return;
    }
    setIsLoading(true);
    await verify2FA(twoFactorInput);
    setIsLoading(false);
  };

  // Send OTP for Login
  const handleSendLoginOtp = async () => {
    if (!loginIdentifier.trim()) {
      addToast('error', 'Identifier Required', 'Please enter your registered email or mobile number.');
      return;
    }
    setIsLoading(true);
    const res = await requestOtp(loginIdentifier, 'login');
    setIsLoading(false);
    if (res.success) {
      setIsOtpSent(true);
      setOtpCountdown(30);
    }
  };

  // Handle Sign Up Next / Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupStep === 'details') {
      // Validate mobile: 10 digits
      const mobileClean = signupMobile.replace(/\D/g, '');
      if (mobileClean.length !== 10) {
        addToast('error', 'Invalid Mobile', 'Please provide a valid 10-digit mobile number.');
        return;
      }

      // Validate email
      if (!signupEmail.includes('@') || !signupEmail.includes('.')) {
        addToast('error', 'Invalid Email', 'Please provide a valid government or official email address.');
        return;
      }

      // Validate password strength
      const strength = calculatePasswordStrength(signupPassword);
      if (strength.score < 3) {
        addToast('error', 'Weak Password', 'Password must meet at least 3 strength criteria (8+ characters, letters, numbers, symbols).');
        return;
      }

      // Validate password confirmation
      if (signupPassword !== signupConfirmPassword) {
        addToast('error', 'Password Mismatch', 'The passwords entered do not match.');
        return;
      }

      if (!signupTermsAccepted) {
        addToast('error', 'Terms Required', 'Please accept the MPLADS Officer Code of Conduct and Verification terms.');
        return;
      }

      // Trigger OTP step
      setIsLoading(true);
      const res = await requestOtp(signupEmail, 'register');
      setIsLoading(false);

      if (res.success) {
        setSignupSimulatedOtp(res.otp || '123456');
        setSignupStep('otp');
        setOtpCountdown(30);
      }
    } else {
      // Validate OTP & Complete registration
      if (!signupOtp.trim()) {
        addToast('error', 'OTP Required', 'Please enter the verification code sent to your email.');
        return;
      }

      if (signupOtp.trim() !== signupSimulatedOtp && signupOtp.trim() !== '123456') {
        addToast('error', 'Invalid OTP', 'The verification code entered is incorrect.');
        return;
      }

      setIsLoading(true);
      await register({
        fullName: signupFullName,
        email: signupEmail,
        mobile: signupMobile,
        role: signupRole,
        department: signupDepartment || 'MPLADS Division',
        designation: signupDesignation || 'Authorised Official',
        password: signupPassword,
      });
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Flow
  const handleForgotRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      addToast('error', 'Identifier Required', 'Please enter your registered email or mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await requestOtp(forgotIdentifier, 'reset');
    setIsLoading(false);

    if (res.success) {
      setForgotSimulatedOtp(res.otp || '123456');
      setForgotStep('verify');
      setOtpCountdown(30);
    }
  };

  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtp.trim()) {
      addToast('error', 'OTP Required', 'Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    const verified = await verifyResetOtp(forgotIdentifier, forgotOtp);
    setIsLoading(false);

    if (verified) {
      setForgotStep('new-password');
    }
  };

  const handleForgotSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const strength = calculatePasswordStrength(newPassword);
    if (strength.score < 3) {
      addToast('error', 'Weak Password', 'Password must meet at least 3 security criteria.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      addToast('error', 'Password Mismatch', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const success = await resetPassword(forgotIdentifier, newPassword);
    setIsLoading(false);

    if (success) {
      setForgotStep('success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mt-2 mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-900 text-white font-black text-2xl shadow-lg shadow-blue-900/20 mb-3 border border-blue-800">
          AX
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <span>ANOMALY<span className="text-blue-700">X</span></span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            OFFICIAL PORTAL
          </span>
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          AI-Powered Monitoring, Anomaly Detection &amp; Fund Traceability System
        </p>
      </div>

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-8 text-xs relative">
          {/* ======================================================== */}
          {/* 2FA PENDING MODAL / OVERLAY */}
          {/* ======================================================== */}
          {twoFactorPending ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication (2FA)</h2>
                <p className="text-xs text-slate-600 mt-1">
                  A high-security 6-digit verification code was generated for{' '}
                  <span className="text-blue-700 font-semibold">{twoFactorPending.identifier}</span>.
                </p>
                <div className="mt-2.5 p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-center text-xs">
                  Evaluation Demo OTP:{' '}
                  <span className="font-mono font-bold tracking-widest text-blue-800 text-sm">
                    {twoFactorPending.otp}
                  </span>
                </div>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 text-center">
                    Enter 6-Digit One-Time Password
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorInput}
                    onChange={(e) => setTwoFactorInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-widest font-mono text-xl py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={cancel2FA}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Verify &amp; Enter</span>
                  </button>
                </div>
              </form>
            </div>
          ) : authMode === 'login' ? (
            /* ======================================================== */
            /* LOGIN VIEW */
            /* ======================================================== */
            <div className="space-y-5">
              {/* Login Method Tabs */}
              <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                    loginMethod === 'password'
                      ? 'bg-white text-blue-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('mobile-otp');
                    setLoginIdentifier('9422099887');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                    loginMethod === 'mobile-otp'
                      ? 'bg-white text-blue-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email-otp');
                    setLoginIdentifier('collector.nashik@mplads.gov.in');
                    setIsOtpSent(false);
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 ${
                    loginMethod === 'email-otp'
                      ? 'bg-white text-blue-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Role Designation Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Designated Official Role:
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                  >
                    <option value={UserRole.COLLECTOR}>District Collector / District Magistrate</option>
                    <option value={UserRole.CAG_AUDITOR}>CAG Principal Auditor</option>
                    <option value={UserRole.PWD_ENGINEER}>PWD Executive Engineer</option>
                    <option value={UserRole.CONTRACTOR}>Tender Contractor / Vendor</option>
                    <option value={UserRole.ADMIN}>Ministry / National Admin</option>
                  </select>
                </div>

                {/* Identifier Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {loginMethod === 'mobile-otp' ? 'Registered 10-Digit Mobile:' : 'Official Email ID / Username:'}
                  </label>
                  <div className="relative">
                    {loginMethod === 'mobile-otp' ? (
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    ) : (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    )}
                    <input
                      type={loginMethod === 'mobile-otp' ? 'tel' : 'email'}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={loginMethod === 'mobile-otp' ? '9822011234' : 'officer@mplads.gov.in'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Password input or OTP input */}
                {loginMethod === 'password' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Access Password:
                      </label>
                      <button
                        type="button"
                        onClick={() => setAuthMode('forgot-password')}
                        className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Verification Code (OTP):
                      </label>
                      {isOtpSent ? (
                        <button
                          type="button"
                          disabled={otpCountdown > 0}
                          onClick={handleSendLoginOtp}
                          className="text-[11px] text-blue-700 hover:underline disabled:opacity-50"
                        >
                          {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                        </button>
                      ) : null}
                    </div>
                    {!isOtpSent ? (
                      <button
                        type="button"
                        onClick={handleSendLoginOtp}
                        disabled={isLoading}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-medium flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4 text-blue-700" />
                        <span>Send 6-Digit OTP</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            maxLength={6}
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 6-digit OTP (e.g. 123456)"
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-blue-300 bg-white text-slate-900 placeholder-slate-400 font-mono tracking-wider focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Demo OTP code was displayed in the top toast alert. You can also enter{' '}
                          <span className="font-mono text-blue-700 font-bold">123456</span> for immediate test login.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Remember Me & Security notice */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 text-xs">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                    />
                    <span>Remember this workstation</span>
                  </label>
                  <span className="text-[10px] text-slate-500">256-bit AES Session</span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4" />
                  )}
                  <span>
                    {isLoading
                      ? 'Authenticating...'
                      : loginMethod !== 'password' && !isOtpSent
                      ? 'Request OTP Code'
                      : 'Sign In to Official Workspace'}
                  </span>
                </button>
              </form>

              {/* Link to Register */}
              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-slate-600 text-xs">
                  New official or contractor requiring system clearance?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setSignupStep('details');
                    }}
                    className="text-blue-700 hover:underline font-semibold"
                  >
                    Register Account
                  </button>
                </p>
              </div>
            </div>
          ) : authMode === 'signup' ? (
            /* ======================================================== */
            /* SIGN UP VIEW */
            /* ======================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Official Account Registration</h2>
                  <p className="text-[11px] text-slate-500">
                    Step {signupStep === 'details' ? '1 of 2: Officer Particulars' : '2 of 2: Identity Verification (OTP)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                {signupStep === 'details' ? (
                  <>
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Full Name &amp; Title:
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={signupFullName}
                          onChange={(e) => setSignupFullName(e.target.value)}
                          placeholder="e.g. Er. Devendra Patil / Smt. Ananya Sen"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Email & Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Official Email:
                        </label>
                        <input
                          type="email"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          placeholder="name@gov.in / name@nic.in"
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          10-Digit Mobile:
                        </label>
                        <input
                          type="tel"
                          value={signupMobile}
                          onChange={(e) => setSignupMobile(e.target.value)}
                          placeholder="9822011234"
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Role & Department */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Designated Role:
                        </label>
                        <select
                          value={signupRole}
                          onChange={(e) => setSignupRole(e.target.value as UserRole)}
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                        >
                          <option value={UserRole.PWD_ENGINEER}>PWD Executive Engineer</option>
                          <option value={UserRole.COLLECTOR}>District Collector / DM</option>
                          <option value={UserRole.CAG_AUDITOR}>CAG Principal Auditor</option>
                          <option value={UserRole.CONTRACTOR}>Tender Contractor / Vendor</option>
                          <option value={UserRole.ADMIN}>Ministry Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Organization / Dept:
                        </label>
                        <input
                          type="text"
                          value={signupDepartment}
                          onChange={(e) => setSignupDepartment(e.target.value)}
                          placeholder="e.g. PWD Maharashtra / Collectorate"
                          className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Create Password:
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Min 8 chars"
                            className="w-full p-2 pr-8 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Confirm Password:
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="w-full p-2 pr-8 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-mono"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    {signupPassword && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-600">Password Strength:</span>
                          <span className="font-bold text-blue-800">
                            {calculatePasswordStrength(signupPassword).label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${calculatePasswordStrength(signupPassword).color} transition-all duration-300 ${
                              calculatePasswordStrength(signupPassword).width
                            }`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pt-1">
                          <div className={`flex items-center gap-1 ${signupPassword.length >= 8 ? 'text-emerald-700 font-semibold' : ''}`}>
                            <span>• 8+ Characters</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[A-Z]/.test(signupPassword) ? 'text-emerald-700 font-semibold' : ''}`}>
                            <span>• Uppercase letter</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[0-9]/.test(signupPassword) ? 'text-emerald-700 font-semibold' : ''}`}>
                            <span>• Number (0-9)</span>
                          </div>
                          <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(signupPassword) ? 'text-emerald-700 font-semibold' : ''}`}>
                            <span>• Special symbol</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-700">
                        <input
                          type="checkbox"
                          checked={signupTermsAccepted}
                          onChange={(e) => setSignupTermsAccepted(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                        />
                        <span>
                          I agree to the{' '}
                          <button
                            type="button"
                            onClick={() => setShowTermsModal(true)}
                            className="text-blue-700 hover:underline font-semibold"
                          >
                            MPLADS Officer Security Terms
                          </button>{' '}
                          and confirm that all credentials represent verified government or contractor identity.
                        </span>
                      </label>
                    </div>

                    {/* Continue button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-700/20"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      <span>Proceed to OTP Verification</span>
                    </button>
                  </>
                ) : (
                  /* OTP Verification Step for Signup */
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                      <ShieldCheck className="w-8 h-8 text-blue-700 mx-auto mb-1.5" />
                      <p className="font-bold text-slate-900 text-xs">Verify Email &amp; Mobile</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        We sent a 6-digit confirmation code to{' '}
                        <span className="text-blue-700 font-semibold">{signupEmail}</span>
                      </p>
                      <div className="mt-2 text-xs font-mono text-blue-800">
                        Demo Verification Code: <span className="font-bold text-slate-900">{signupSimulatedOtp}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Enter 6-Digit Verification Code:
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={signupOtp}
                        onChange={(e) => setSignupOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full text-center tracking-widest font-mono text-xl py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSignupStep('details')}
                        className="text-slate-600 hover:text-slate-900 font-medium"
                      >
                        ← Edit Particulars
                      </button>
                      <button
                        type="button"
                        disabled={otpCountdown > 0}
                        onClick={async () => {
                          const res = await requestOtp(signupEmail, 'register');
                          if (res.success) {
                            setSignupSimulatedOtp(res.otp || '123456');
                            setOtpCountdown(30);
                          }
                        }}
                        className="text-blue-700 hover:underline font-semibold disabled:opacity-50"
                      >
                        {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-700/20"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Verify &amp; Activate Official Account</span>
                    </button>
                  </div>
                )}
              </form>

              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-slate-600 text-xs">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-blue-700 hover:underline font-semibold"
                  >
                    Sign In here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* FORGOT PASSWORD / RESET VIEW */
            /* ======================================================== */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Reset Official Password</h2>
                  <p className="text-[11px] text-slate-500">
                    Two-step identity challenge via registered email or mobile
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>

              {forgotStep === 'request' && (
                <form onSubmit={handleForgotRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enter Registered Email ID or 10-Digit Mobile:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="collector.nashik@mplads.gov.in"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    <span>Send Password Reset OTP</span>
                  </button>
                </form>
              )}

              {forgotStep === 'verify' && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <p className="text-[11px] text-slate-600">
                      OTP sent to <span className="text-blue-700 font-semibold">{forgotIdentifier}</span>
                    </p>
                    <div className="mt-1 text-xs text-blue-800">
                      Demo Reset Code: <span className="font-bold text-slate-900 font-mono">{forgotSimulatedOtp}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enter 6-Digit OTP:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center tracking-widest font-mono text-xl py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => setForgotStep('request')}
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      ← Change Identifier
                    </button>
                    <button
                      type="button"
                      disabled={otpCountdown > 0}
                      onClick={async () => {
                        const res = await requestOtp(forgotIdentifier, 'reset');
                        if (res.success) {
                          setForgotSimulatedOtp(res.otp || '123456');
                          setOtpCountdown(30);
                        }
                      }}
                      className="text-blue-700 hover:underline font-semibold disabled:opacity-50"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Verify Code</span>
                  </button>
                </form>
              )}

              {forgotStep === 'new-password' && (
                <form onSubmit={handleForgotSetNewPassword} className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Enter New Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 chars"
                        className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-mono"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Confirm New Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full p-2.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Strength Bar */}
                  {newPassword && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-600">Strength:</span>
                        <span className="font-bold text-blue-800">
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
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Update Password &amp; Finish</span>
                  </button>
                </form>
              )}

              {forgotStep === 'success' && (
                <div className="text-center space-y-3 py-4 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Password Reset Complete</h3>
                  <p className="text-xs text-slate-600">
                    Your password has been securely updated. You may now sign in using your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setForgotStep('request');
                      setLoginPassword(newPassword);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors shadow-sm"
                  >
                    Sign In Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>MPLADS Officer Security Terms</span>
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 text-slate-700 leading-relaxed">
              <p>
                <strong>1. Authorized Role Usage:</strong> Every account on AnomalyX is bound to role-specific administrative clearances (Contractor, PWD Engineer, Collector, CAG Auditor, Ministry Admin). Users must only initiate transactions and verifications within their designated purview.
              </p>
              <p>
                <strong>2. Early-Warning &amp; Due Process:</strong> AnomalyX generates statistical alerts and algorithmic risk scores. In accordance with government directives, AI indicators are probabilistic flags and must never be treated as automatic criminal declarations or unilateral fund seizures without verified field enquiry.
              </p>
              <p>
                <strong>3. Audit Trail Traceability:</strong> All authentication actions, logins, evidence submissions, and inquiry issuances are recorded with immutable timestamps and cryptographic hashes.
              </p>
              <p>
                <strong>4. Evaluation Disclaimer:</strong> This portal is currently displaying synthetic demo records for system testing.
              </p>
            </div>
            <button
              onClick={() => {
                setSignupTermsAccepted(true);
                setShowTermsModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold transition-colors shadow-sm"
            >
              I Accept &amp; Agree to Terms
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
