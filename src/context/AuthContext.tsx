import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, UserRole, UserSession, AuditLog } from '../types';
import { INITIAL_USERS, INITIAL_AUDIT_LOGS } from '../server/db';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface TwoFactorPendingState {
  user: User;
  identifier: string;
  otp: string;
  targetRole?: UserRole;
  rememberMe: boolean;
}

export interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;

  // 2FA pending state
  twoFactorPending: TwoFactorPendingState | null;
  verify2FA: (enteredOtp: string) => Promise<boolean>;
  cancel2FA: () => void;

  // Login & Registration
  login: (
    identifier: string,
    passwordOrRole?: string | UserRole,
    requestedRole?: UserRole,
    remember?: boolean
  ) => Promise<{ success: boolean; requires2FA?: boolean; message?: string }>;
  loginWithOtp: (identifier: string, otp: string, remember?: boolean) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password?: string }) => Promise<boolean>;

  // OTP Management
  requestOtp: (identifier: string, type: 'login' | 'reset' | 'register' | '2fa') => Promise<{ success: boolean; otp?: string; message: string }>;
  verifyResetOtp: (identifier: string, otp: string) => Promise<boolean>;
  resetPassword: (identifier: string, newPassword: string) => Promise<boolean>;

  // Email & Mobile Verification System
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  sendEmailVerificationOtp: (targetEmail?: string) => Promise<{ success: boolean; otp?: string; message: string }>;
  verifyEmailOtp: (otp: string, targetEmail?: string) => Promise<{ success: boolean; message: string }>;
  sendMobileVerificationOtp: (targetMobile?: string) => Promise<{ success: boolean; otp?: string; message: string }>;
  verifyMobileOtp: (otp: string, targetMobile?: string) => Promise<{ success: boolean; message: string }>;

  // Profile & Settings
  updateProfile: (updatedFields: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  toggle2FA: (enabled: boolean) => Promise<boolean>;

  // Sessions
  activeSessions: UserSession[];
  revokeSession: (sessionId: string) => void;
  revokeAllOtherSessions: () => void;
  sessionTimeoutWarning: boolean;
  extendSession: () => void;

  // Role Switch & Logout
  switchDemoRole: (role: UserRole) => void;
  logout: () => void;

  // System & Audit
  registeredUsers: User[];
  auditLogs: AuditLog[];
  addAuditLog: (action: string, category: AuditLog['category'], details: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SAMPLE_INITIAL_SESSIONS: UserSession[] = [
  {
    id: 'sess-curr',
    device: 'Desktop Workstation',
    browser: 'Chrome 128.0 (Current Device)',
    os: 'Windows 11 Enterprise (NIC Encrypted)',
    ipAddress: '10.14.22.8',
    location: 'District Collectorate, Nashik, Maharashtra',
    loginTime: '2026-09-11T16:30:00Z',
    lastActive: 'Just now',
    isCurrent: true,
  },
  {
    id: 'sess-mob-01',
    device: 'Field Inspection Tablet',
    browser: 'AnomalyX Mobile Inspector v2.4',
    os: 'Android 14 (Gov Secured)',
    ipAddress: '10.14.22.45',
    location: 'Niphad Site Office, Maharashtra',
    loginTime: '2026-09-10T09:15:00Z',
    lastActive: '18 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess-lap-02',
    device: 'Administrative Laptop',
    browser: 'Firefox ESR 126',
    os: 'macOS Sonoma 14.5',
    ipAddress: '10.22.50.11',
    location: 'MoSPI Central Secretariat, New Delhi',
    loginTime: '2026-09-08T14:00:00Z',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [twoFactorPending, setTwoFactorPending] = useState<TwoFactorPendingState | null>(null);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>(SAMPLE_INITIAL_SESSIONS);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  // In-memory OTP cache for simulation { identifier: { otp: string, expires: number } }
  const otpStore = useRef<Record<string, { otp: string; expires: number }>>({});
  const lastActivityRef = useRef<number>(Date.now());

  // Load registered users from localStorage or default to INITIAL_USERS
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('anomalyx_registered_users');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });

  const addToast = useCallback((type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addAuditLog = useCallback(
    (action: string, category: AuditLog['category'], details: string) => {
      const newLog: AuditLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        userName: user?.fullName || 'Anonymous / Auth Gate',
        userRole: user?.role || UserRole.ADMIN,
        action,
        category,
        details,
        ipAddress: '10.14.22.8',
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [user]
  );

  // Check saved session in localStorage or sessionStorage
  useEffect(() => {
    try {
      let savedUser = localStorage.getItem('anomalyx_user');
      let savedToken = localStorage.getItem('anomalyx_token');

      if (!savedUser || !savedToken) {
        savedUser = sessionStorage.getItem('anomalyx_user');
        savedToken = sessionStorage.getItem('anomalyx_token');
      }

      if (savedUser && savedToken) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setToken(savedToken);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save registered users on update
  useEffect(() => {
    try {
      localStorage.setItem('anomalyx_registered_users', JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }
  }, [registeredUsers]);

  // Session inactivity monitor (30 minutes timeout with warning)
  useEffect(() => {
    if (!user) return;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
      if (sessionTimeoutWarning) {
        setSessionTimeoutWarning(false);
      }
    };

    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      // 25 minutes: show warning
      if (elapsed > 25 * 60 * 1000 && !sessionTimeoutWarning) {
        setSessionTimeoutWarning(true);
      }
      // 30 minutes: auto-logout
      if (elapsed > 30 * 60 * 1000) {
        logout();
        addToast('warning', 'Session Expired', 'You were logged out due to inactivity for security compliance.');
      }
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      clearInterval(interval);
    };
  }, [user, sessionTimeoutWarning]);

  const extendSession = () => {
    lastActivityRef.current = Date.now();
    setSessionTimeoutWarning(false);
    addToast('info', 'Session Extended', 'Your secure session has been refreshed.');
  };

  // OTP Request simulation
  const requestOtp = async (
    identifier: string,
    type: 'login' | 'reset' | 'register' | '2fa'
  ): Promise<{ success: boolean; otp?: string; message: string }> => {
    setIsLoading(true);
    // Simulate short network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanId = identifier.trim().toLowerCase();
    // Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.current[cleanId] = {
      otp: generatedOtp,
      expires: Date.now() + 5 * 60 * 1000, // 5 min expiry
    };

    setIsLoading(false);

    // Audit log
    addAuditLog('OTP_REQUESTED', 'AUTH', `Simulated ${type.toUpperCase()} OTP dispatched for ${identifier}.`);

    addToast(
      'info',
      'One-Time Password (OTP) Generated',
      `Demo Verification Code for ${identifier}: ${generatedOtp} (Valid for 5 mins)`
    );

    return {
      success: true,
      otp: generatedOtp,
      message: `OTP sent successfully to ${identifier}. Use code: ${generatedOtp}`,
    };
  };

  // Login implementation
  const login = async (
    identifier: string,
    passwordOrRole?: string | UserRole,
    requestedRole?: UserRole,
    remember: boolean = true
  ): Promise<{ success: boolean; requires2FA?: boolean; message?: string }> => {
    setIsLoading(true);
    setRememberMe(remember);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const cleanId = identifier.trim().toLowerCase();
      const effectiveRole: UserRole | undefined =
        typeof passwordOrRole === 'string' && requestedRole
          ? requestedRole
          : typeof passwordOrRole !== 'string'
          ? passwordOrRole
          : undefined;

      // Find user
      const targetUser = registeredUsers.find(
        (u) =>
          (u.email.toLowerCase() === cleanId || u.mobile === identifier.trim()) &&
          (!effectiveRole || u.role === effectiveRole)
      );

      if (!targetUser) {
        // Fallback check if user matches role or demo quick login
        const roleFallback = registeredUsers.find((u) => u.role === effectiveRole);
        if (roleFallback) {
          return proceedSuccessfulLogin(roleFallback, remember);
        }

        addAuditLog('LOGIN_FAILED', 'AUTH', `Failed login attempt for identifier: ${identifier}`);
        addToast('error', 'Authentication Failed', 'No matching official account found with these credentials.');
        setIsLoading(false);
        return { success: false, message: 'Invalid credentials or unregistered account' };
      }

      // If password is supplied as string, verify password (or allow demo default 'Demo@1234' or any demo password)
      if (typeof passwordOrRole === 'string' && passwordOrRole.length > 0) {
        const validPassword = targetUser.password || 'Demo@1234';
        if (passwordOrRole !== validPassword && passwordOrRole !== 'Demo@1234' && passwordOrRole !== 'demo1234') {
          addAuditLog('LOGIN_FAILED', 'AUTH', `Password mismatch for ${targetUser.email}`);
          addToast('error', 'Incorrect Password', 'The password entered does not match our records.');
          setIsLoading(false);
          return { success: false, message: 'Incorrect password' };
        }
      }

      // Check if 2FA is required for this user
      if (targetUser.twoFactorEnabled) {
        const otpResp = await requestOtp(targetUser.email, '2fa');
        setTwoFactorPending({
          user: targetUser,
          identifier: targetUser.email,
          otp: otpResp.otp || '123456',
          targetRole: effectiveRole,
          rememberMe: remember,
        });
        setIsLoading(false);
        addToast(
          'info',
          'Two-Factor Authentication Required',
          `A 6-digit OTP has been sent to ${targetUser.email} (Code: ${otpResp.otp})`
        );
        return { success: false, requires2FA: true, message: '2FA verification code required' };
      }

      // Complete login
      return proceedSuccessfulLogin(targetUser, remember);
    } catch {
      setIsLoading(false);
      addToast('error', 'Login Error', 'An unexpected system error occurred during authentication.');
      return { success: false, message: 'Unexpected server error' };
    }
  };

  const proceedSuccessfulLogin = (targetUser: User, remember: boolean) => {
    const updatedUser = {
      ...targetUser,
      lastLogin: new Date().toISOString(),
    };

    setUser(updatedUser);
    const fakeToken = `ax_jwt_${targetUser.id}_${Date.now()}`;
    setToken(fakeToken);

    // Save session storage according to Remember Me
    if (remember) {
      localStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
      localStorage.setItem('anomalyx_token', fakeToken);
      sessionStorage.removeItem('anomalyx_user');
      sessionStorage.removeItem('anomalyx_token');
    } else {
      sessionStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
      sessionStorage.setItem('anomalyx_token', fakeToken);
      localStorage.removeItem('anomalyx_user');
      localStorage.removeItem('anomalyx_token');
    }

    setActiveView('dashboard');
    setIsLoading(false);
    setTwoFactorPending(null);

    addAuditLog('USER_LOGIN', 'AUTH', `Successful login as ${targetUser.role} (${targetUser.email})`);
    addToast('success', 'Authentication Successful', `Welcome back, ${targetUser.fullName}! Directing to ${targetUser.role.replace('_', ' ')} workspace.`);
    return { success: true };
  };

  // Verify 2FA OTP
  const verify2FA = async (enteredOtp: string): Promise<boolean> => {
    if (!twoFactorPending) return false;
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 400));
    const cleanOtp = enteredOtp.trim();

    if (cleanOtp === twoFactorPending.otp || cleanOtp === '123456') {
      addAuditLog('OTP_VERIFIED', 'AUTH', `2FA verification verified for ${twoFactorPending.user.email}`);
      proceedSuccessfulLogin(twoFactorPending.user, twoFactorPending.rememberMe);
      return true;
    } else {
      setIsLoading(false);
      addAuditLog('LOGIN_FAILED', 'AUTH', `Invalid 2FA OTP submitted for ${twoFactorPending.user.email}`);
      addToast('error', 'Invalid OTP', 'The verification code entered is incorrect or expired.');
      return false;
    }
  };

  const cancel2FA = () => {
    setTwoFactorPending(null);
    setIsLoading(false);
  };

  // Login with OTP
  const loginWithOtp = async (identifier: string, otp: string, remember: boolean = true): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const cleanId = identifier.trim().toLowerCase();
    const stored = otpStore.current[cleanId];
    const isOtpValid = (stored && stored.otp === otp.trim() && stored.expires > Date.now()) || otp.trim() === '123456';

    if (!isOtpValid) {
      setIsLoading(false);
      addAuditLog('LOGIN_FAILED', 'AUTH', `Failed OTP login attempt for ${identifier}`);
      addToast('error', 'OTP Verification Failed', 'Invalid or expired OTP. Please request a new code.');
      return false;
    }

    // Find user
    const targetUser =
      registeredUsers.find(
        (u) => u.email.toLowerCase() === cleanId || u.mobile === identifier.trim()
      ) || registeredUsers[2]; // Default fallback

    proceedSuccessfulLogin(targetUser, remember);
    return true;
  };

  // Sign up
  const register = async (
    userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password?: string }
  ): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Check duplicate
    const existing = registeredUsers.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase() || u.mobile === userData.mobile
    );

    if (existing) {
      setIsLoading(false);
      addToast('error', 'Account Exists', 'An official account with this email or mobile number already exists.');
      return false;
    }

    const newUser: User = {
      ...userData,
      id: `usr-${userData.role.toLowerCase()}-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      password: userData.password || 'Demo@1234',
      twoFactorEnabled: false,
      isEmailVerified: userData.isEmailVerified ?? true,
      isMobileVerified: userData.isMobileVerified ?? true,
      emailVerifiedAt: new Date().toISOString(),
      mobileVerifiedAt: new Date().toISOString(),
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    addAuditLog('USER_REGISTERED', 'AUTH', `New user registered: ${newUser.fullName} as ${newUser.role}`);
    proceedSuccessfulLogin(newUser, true);
    return true;
  };

  // Email verification methods
  const sendEmailVerificationOtp = async (
    targetEmail?: string
  ): Promise<{ success: boolean; otp?: string; message: string }> => {
    const emailToVerify = targetEmail || user?.email;
    if (!emailToVerify) {
      addToast('error', 'Missing Email', 'Please provide a valid official email address.');
      return { success: false, message: 'Missing email address' };
    }
    const cleanEmail = emailToVerify.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.current[`email_verify_${cleanEmail}`] = {
      otp: generatedOtp,
      expires: Date.now() + 10 * 60 * 1000,
    };

    addAuditLog('VERIFICATION_OTP_SENT', 'AUTH', `Email verification OTP dispatched for ${cleanEmail}`);
    addToast(
      'info',
      'Government Email Gateway OTP',
      `Official Email OTP for ${cleanEmail}: ${generatedOtp} (Valid for 10 min)`
    );

    return {
      success: true,
      otp: generatedOtp,
      message: `Verification code sent to ${cleanEmail}`,
    };
  };

  const verifyEmailOtp = async (
    otp: string,
    targetEmail?: string
  ): Promise<{ success: boolean; message: string }> => {
    const emailToVerify = targetEmail || user?.email;
    if (!emailToVerify) {
      return { success: false, message: 'No email found to verify' };
    }
    const cleanEmail = emailToVerify.trim().toLowerCase();
    const record = otpStore.current[`email_verify_${cleanEmail}`];

    if ((record && record.otp === otp.trim()) || otp.trim() === '123456') {
      const now = new Date().toISOString();
      if (user) {
        const updatedUser = {
          ...user,
          email: emailToVerify,
          isEmailVerified: true,
          emailVerifiedAt: now,
        };
        setUser(updatedUser);
        const updatedList = registeredUsers.map((u) => (u.id === user.id ? updatedUser : u));
        setRegisteredUsers(updatedList);
        if (rememberMe) {
          localStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
        }
      }
      delete otpStore.current[`email_verify_${cleanEmail}`];
      addAuditLog('EMAIL_VERIFIED', 'AUTH', `Official email ${cleanEmail} verified successfully.`);
      addToast('success', 'Email Verified', `Your email ${cleanEmail} has been verified successfully.`);
      return { success: true, message: 'Email verified successfully' };
    } else {
      addToast('error', 'Invalid Code', 'The entered email verification code is incorrect or expired.');
      return { success: false, message: 'Invalid or expired code' };
    }
  };

  // Mobile verification methods
  const sendMobileVerificationOtp = async (
    targetMobile?: string
  ): Promise<{ success: boolean; otp?: string; message: string }> => {
    const mobileToVerify = targetMobile || user?.mobile;
    if (!mobileToVerify) {
      addToast('error', 'Missing Mobile', 'Please provide a valid 10-digit mobile number.');
      return { success: false, message: 'Missing mobile number' };
    }
    const cleanMobile = mobileToVerify.trim().replace(/\D/g, '');
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.current[`mobile_verify_${cleanMobile}`] = {
      otp: generatedOtp,
      expires: Date.now() + 10 * 60 * 1000,
    };

    addAuditLog('VERIFICATION_OTP_SENT', 'AUTH', `Mobile SMS verification OTP dispatched for +91-${cleanMobile}`);
    addToast(
      'info',
      'Gov SMS Gateway (CDAC) OTP',
      `Official SMS OTP for +91-${cleanMobile}: ${generatedOtp} (Valid for 10 min)`
    );

    return {
      success: true,
      otp: generatedOtp,
      message: `SMS code sent to +91-${cleanMobile}`,
    };
  };

  const verifyMobileOtp = async (
    otp: string,
    targetMobile?: string
  ): Promise<{ success: boolean; message: string }> => {
    const mobileToVerify = targetMobile || user?.mobile;
    if (!mobileToVerify) {
      return { success: false, message: 'No mobile number found to verify' };
    }
    const cleanMobile = mobileToVerify.trim().replace(/\D/g, '');
    const record = otpStore.current[`mobile_verify_${cleanMobile}`];

    if ((record && record.otp === otp.trim()) || otp.trim() === '123456') {
      const now = new Date().toISOString();
      if (user) {
        const updatedUser = {
          ...user,
          mobile: cleanMobile,
          isMobileVerified: true,
          mobileVerifiedAt: now,
        };
        setUser(updatedUser);
        const updatedList = registeredUsers.map((u) => (u.id === user.id ? updatedUser : u));
        setRegisteredUsers(updatedList);
        if (rememberMe) {
          localStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
        }
      }
      delete otpStore.current[`mobile_verify_${cleanMobile}`];
      addAuditLog('MOBILE_VERIFIED', 'AUTH', `Official mobile +91-${cleanMobile} verified successfully.`);
      addToast('success', 'Mobile Verified', `Your mobile number +91-${cleanMobile} has been verified.`);
      return { success: true, message: 'Mobile verified successfully' };
    } else {
      addToast('error', 'Invalid Code', 'The entered SMS verification code is incorrect or expired.');
      return { success: false, message: 'Invalid or expired code' };
    }
  };

  // Verify Reset OTP
  const verifyResetOtp = async (identifier: string, otp: string): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const stored = otpStore.current[cleanId];
    const isValid = (stored && stored.otp === otp.trim() && stored.expires > Date.now()) || otp.trim() === '123456';

    if (isValid) {
      addAuditLog('OTP_VERIFIED', 'AUTH', `Password reset OTP verified for ${identifier}`);
      return true;
    }
    addToast('error', 'Verification Failed', 'Invalid OTP code.');
    return false;
  };

  // Reset password
  const resetPassword = async (identifier: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const cleanId = identifier.trim().toLowerCase();
    const userIndex = registeredUsers.findIndex(
      (u) => u.email.toLowerCase() === cleanId || u.mobile === identifier.trim()
    );

    if (userIndex === -1) {
      setIsLoading(false);
      addToast('error', 'User Not Found', 'No account found with this identifier.');
      return false;
    }

    const updated = [...registeredUsers];
    updated[userIndex] = {
      ...updated[userIndex],
      password: newPassword,
    };

    setRegisteredUsers(updated);
    addAuditLog('PASSWORD_CHANGED', 'AUTH', `Password reset completed for ${identifier}`);
    setIsLoading(false);
    addToast('success', 'Password Updated', 'Your password has been reset successfully. Please log in with your new password.');
    return true;
  };

  // Change password while logged in
  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not authenticated' };

    const expectedCurrent = user.password || 'Demo@1234';
    if (currentPassword !== expectedCurrent && currentPassword !== 'Demo@1234' && currentPassword !== 'demo1234') {
      return { success: false, message: 'Current password does not match our records.' };
    }

    const updated = registeredUsers.map((u) =>
      u.id === user.id ? { ...u, password: newPassword } : u
    );

    setRegisteredUsers(updated);
    setUser((prev) => (prev ? { ...prev, password: newPassword } : null));
    addAuditLog('PASSWORD_CHANGED', 'AUTH', `User ${user.email} changed their password.`);
    addToast('success', 'Password Changed', 'Your password has been updated securely.');
    return { success: true, message: 'Password changed successfully' };
  };

  // Profile update
  const updateProfile = async (updatedFields: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);

    const updatedList = registeredUsers.map((u) => (u.id === user.id ? updatedUser : u));
    setRegisteredUsers(updatedList);

    if (rememberMe) {
      localStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
    }

    addAuditLog('PROFILE_UPDATED', 'AUTH', `Profile details updated for user: ${user.fullName}`);
    addToast('success', 'Profile Updated', 'Your profile details have been saved.');
    return true;
  };

  // Toggle 2FA
  const toggle2FA = async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;

    const updatedUser = { ...user, twoFactorEnabled: enabled };
    setUser(updatedUser);

    const updatedList = registeredUsers.map((u) => (u.id === user.id ? updatedUser : u));
    setRegisteredUsers(updatedList);

    if (rememberMe) {
      localStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('anomalyx_user', JSON.stringify(updatedUser));
    }

    addAuditLog(
      '2FA_TOGGLED',
      'AUTH',
      `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'} by user ${user.email}`
    );
    addToast(
      'info',
      'Two-Factor Authentication',
      `Two-Factor Authentication is now ${enabled ? 'ACTIVE (Requires OTP on login)' : 'DISABLED'}.`
    );
    return true;
  };

  // Session management
  const revokeSession = (sessionId: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addAuditLog('SESSION_REVOKED', 'AUTH', `Session ${sessionId} terminated by user.`);
    addToast('info', 'Session Terminated', 'The selected remote device session has been revoked.');
  };

  const revokeAllOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    addAuditLog('ALL_SESSIONS_REVOKED', 'AUTH', `All remote sessions revoked by user.`);
    addToast('info', 'All Other Sessions Terminated', 'You are now only logged in on this current browser.');
  };

  // Role switcher for testing/evaluator
  const switchDemoRole = (targetRole: UserRole) => {
    const targetUser = registeredUsers.find((u) => u.role === targetRole) || registeredUsers[0];
    setUser(targetUser);
    const fakeToken = `ax_jwt_${targetUser.id}_${Date.now()}`;
    setToken(fakeToken);

    if (rememberMe) {
      localStorage.setItem('anomalyx_user', JSON.stringify(targetUser));
      localStorage.setItem('anomalyx_token', fakeToken);
    } else {
      sessionStorage.setItem('anomalyx_user', JSON.stringify(targetUser));
      sessionStorage.setItem('anomalyx_token', fakeToken);
    }

    setActiveView('dashboard');
    setSelectedProjectId(null);
    setSelectedAlertId(null);
    addAuditLog('ROLE_SWITCHED', 'AUTH', `Context switched to ${targetRole}: ${targetUser.fullName}`);
    addToast(
      'info',
      'Role Switched',
      `Switched context to ${targetRole.replace('_', ' ')}: ${targetUser.fullName}`
    );
  };

  // Logout
  const logout = () => {
    if (user) {
      addAuditLog('USER_LOGOUT', 'AUTH', `User ${user.fullName} (${user.email}) logged out.`);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('anomalyx_user');
    localStorage.removeItem('anomalyx_token');
    sessionStorage.removeItem('anomalyx_user');
    sessionStorage.removeItem('anomalyx_token');
    setActiveView('dashboard');
    setSelectedProjectId(null);
    setSelectedAlertId(null);
    setTwoFactorPending(null);
    addToast('info', 'Logged Out', 'You have been securely logged out of AnomalyX.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        token,
        isAuthenticated: !!user,
        isLoading,
        activeView,
        setActiveView,
        selectedProjectId,
        setSelectedProjectId,
        selectedAlertId,
        setSelectedAlertId,
        rememberMe,
        setRememberMe,
        twoFactorPending,
        verify2FA,
        cancel2FA,
        login,
        loginWithOtp,
        register,
        requestOtp,
        verifyResetOtp,
        resetPassword,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        sendEmailVerificationOtp,
        verifyEmailOtp,
        sendMobileVerificationOtp,
        verifyMobileOtp,
        updateProfile,
        changePassword,
        toggle2FA,
        activeSessions,
        revokeSession,
        revokeAllOtherSessions,
        sessionTimeoutWarning,
        extendSession,
        switchDemoRole,
        logout,
        registeredUsers,
        auditLogs,
        addAuditLog,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
