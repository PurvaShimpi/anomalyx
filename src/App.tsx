import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import { ToastContainer } from './components/common/ToastContainer';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';
import { RoleGuard } from './components/layout/RoleGuard';
import { LandingPage } from './pages/landing/LandingPage';
import { AuthPages } from './pages/auth/AuthPages';
import { UserProfileView } from './pages/profile/UserProfileView';
import { ContractorDashboard } from './pages/roles/ContractorDashboard';
import { PwdEngineerDashboard } from './pages/roles/PwdEngineerDashboard';
import { CollectorDashboard } from './pages/roles/CollectorDashboard';
import { CagAuditorDashboard } from './pages/roles/CagAuditorDashboard';
import { AdminDashboard } from './pages/roles/AdminDashboard';
import { AlertDetailModal } from './components/modals/AlertDetailModal';
import { VerificationModal } from './components/modals/VerificationModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, role, activeView, selectedAlertId, setSelectedAlertId, isVerificationModalOpen, setIsVerificationModalOpen } = useAuth();
  // First screen defaults to login as explicitly required
  const [pageMode, setPageMode] = useState<'landing' | 'login' | 'signup'>('login');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const mainRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeView]);

  // If user is not authenticated, show Login/SignUp (or Landing if opted)
  if (!isAuthenticated) {
    if (pageMode === 'login' || pageMode === 'signup') {
      return (
        <AuthPages
          initialMode={pageMode}
          onGoHome={() => setPageMode('landing')}
        />
      );
    }
    return (
      <LandingPage
        onGoToLogin={() => setPageMode('login')}
        onGoToSignUp={() => setPageMode('signup')}
      />
    );
  }

  // Authenticated workspace view
  const renderDashboardByRole = () => {
    switch (role) {
      case UserRole.CONTRACTOR:
        return (
          <RoleGuard allowedRoles={[UserRole.CONTRACTOR]}>
            <ContractorDashboard />
          </RoleGuard>
        );
      case UserRole.PWD_ENGINEER:
        return (
          <RoleGuard allowedRoles={[UserRole.PWD_ENGINEER]}>
            <PwdEngineerDashboard />
          </RoleGuard>
        );
      case UserRole.COLLECTOR:
        return (
          <RoleGuard allowedRoles={[UserRole.COLLECTOR]}>
            <CollectorDashboard />
          </RoleGuard>
        );
      case UserRole.CAG_AUDITOR:
        return (
          <RoleGuard allowedRoles={[UserRole.CAG_AUDITOR]}>
            <CagAuditorDashboard />
          </RoleGuard>
        );
      case UserRole.ADMIN:
      default:
        return (
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </RoleGuard>
        );
    }
  };

  return (
    <div className="dark min-h-screen bg-slate-950 flex flex-col text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Top Navigation Header */}
      <TopNavbar onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Role-specific Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Role Content Dashboard or Profile Settings */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 text-white dashboard-container">
          <div className="max-w-7xl mx-auto text-white">
            {activeView === 'profile' ? <UserProfileView /> : renderDashboardByRole()}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Verification Modal (Email and Mobile) */}
      {isVerificationModalOpen && (
        <VerificationModal onClose={() => setIsVerificationModalOpen(false)} />
      )}

      {/* Global AI Alert Modal */}
      {selectedAlertId && (
        <AlertDetailModal
          alertId={selectedAlertId}
          onClose={() => setSelectedAlertId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
