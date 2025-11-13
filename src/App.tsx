import { useState, useEffect } from 'react';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { OrganizationProvider } from './contexts/OrganizationContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { LearnerDashboard } from './pages/LearnerDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { EnhancedAdminDashboard } from './pages/EnhancedAdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { CourseViewerPage } from './pages/CourseViewerPage';
import { LandingPage } from './pages/LandingPage';
import { PricingPage } from './pages/PricingPage';
import { OrganizationSignupPage } from './pages/OrganizationSignupPage';
import { OrganizationSettingsPage } from './pages/OrganizationSettingsPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SubscribePage } from './pages/SubscribePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { RefundPolicyPage } from './pages/RefundPolicyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { CookieConsent } from './components/CookieConsent';
import { getPath, navigateTo } from './lib/router';
import { logger } from './lib/logger';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(getPath());
  const [viewingCourse, setViewingCourse] = useState<{ id: string; name: string } | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  logger.debug('[APP] Render state', { loading, hasUser: !!user, hasProfile: !!profile, path: currentPath });

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(getPath());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('routechange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('routechange', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        logger.warn('[APP] Loading timeout reached after 15 seconds');
        setLoadingTimeout(true);
      }, 15000);

      return () => clearTimeout(timeout);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  if (loading && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (loadingTimeout) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors p-4">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Taking longer than expected</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're having trouble loading your profile. This might be a temporary issue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const publicRoutes = ['/', '/pricing', '/login', '/signup', '/reset-password', '/terms', '/privacy', '/refunds', '/cookies'];
  const isPublicRoute = publicRoutes.includes(currentPath);

  if (!user && !isPublicRoute) {
    return <LoginPage />;
  }

  if (user && profile && !profile.organization_id && currentPath !== '/organization/signup' && currentPath !== '/login' && !profile.is_super_admin) {
    logger.debug('[APP] User has no organization, redirecting to signup', { currentPath });
    if (currentPath !== '/organization/signup') {
      logger.debug('[APP] Navigating to /organization/signup');
      setTimeout(() => navigateTo('/organization/signup'), 0);
    }
    return <OrganizationSignupPage />;
  }

  if (currentPath === '/' && !user) {
    return <LandingPage />;
  }

  if (currentPath === '/' && user && profile && profile.organization_id) {
    logger.debug('[APP] User on root with organization, redirecting to dashboard');
    navigateTo('/dashboard');
    return null;
  }

  if (currentPath === '/pricing') {
    return <PricingPage />;
  }

  if (currentPath === '/subscribe') {
    return <SubscribePage />;
  }

  if (currentPath === '/login' || currentPath === '/signup') {
    return <LoginPage />;
  }

  if (currentPath === '/reset-password') {
    return <ResetPasswordPage />;
  }

  if (currentPath === '/terms') {
    return <TermsOfServicePage />;
  }

  if (currentPath === '/privacy') {
    return <PrivacyPolicyPage />;
  }

  if (currentPath === '/refunds') {
    return <RefundPolicyPage />;
  }

  if (currentPath === '/cookies') {
    return <CookiePolicyPage />;
  }

  if (currentPath === '/organization/signup') {
    return <OrganizationSignupPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (profile.is_super_admin && currentPath === '/super-admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/profile')} />
        <SuperAdminDashboard />
      </div>
    );
  }

  if (currentPath === '/settings') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/profile')} />
        <OrganizationSettingsPage />
      </div>
    );
  }

  if (viewingCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/profile')} />
        <CourseViewerPage
          courseId={viewingCourse.id}
          courseName={viewingCourse.name}
          onBack={() => setViewingCourse(null)}
        />
      </div>
    );
  }

  if (currentPath === '/profile') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navbar onProfileClick={() => navigateTo('/dashboard')} />
        <ProfilePage onBack={() => navigateTo('/dashboard')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar onProfileClick={() => navigateTo('/profile')} />
      {profile.role === 'learner' && <LearnerDashboard />}
      {profile.role === 'instructor' && <InstructorDashboard onViewCourse={setViewingCourse} />}
      {profile.role === 'admin' && <EnhancedAdminDashboard onViewCourse={setViewingCourse} />}
      <CookieConsent />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </OrganizationProvider>
    </AuthProvider>
  );
}

export default App;
